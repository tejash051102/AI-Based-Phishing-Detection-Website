import fs from "fs/promises";
import { body, query } from "express-validator";
import Notification from "../models/Notification.js";
import ScanReport from "../models/ScanReport.js";
import ThreatLog from "../models/ThreatLog.js";
import { predictThreat } from "../services/ai.service.js";
import { checkVirusTotal } from "../services/reputation.service.js";
import { sendThreatAlert } from "../services/email.service.js";
import { buildScanPdf } from "../services/report.service.js";
import { extractScanItems } from "../services/fileParser.service.js";

export const scanRules = [
  body("type").isIn(["url", "text"]).withMessage("Type must be url or text"),
  body("content").trim().isLength({ min: 3 }).withMessage("Content is required")
];

export const listRules = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("verdict").optional().isIn(["safe", "suspicious", "phishing"]),
  query("type").optional().isIn(["url", "text", "file"]),
  query("from").optional({ checkFalsy: true }).isISO8601(),
  query("to").optional({ checkFalsy: true }).isISO8601()
];

export const feedbackRules = [
  body("label").isIn(["accurate", "false_positive", "false_negative"]).withMessage("Feedback label is invalid"),
  body("note").optional().trim().isLength({ max: 500 }).withMessage("Feedback note must be 500 characters or fewer")
];

export const bulkRules = [
  body("items").isArray({ min: 1, max: 30 }).withMessage("Provide 1 to 30 scan items"),
  body("items.*").trim().isLength({ min: 3 }).withMessage("Each scan item must include content")
];

function verdictFromScore(score) {
  if (score >= 75) return "phishing";
  if (score >= 45) return "suspicious";
  return "safe";
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function safeUrlPreview(value) {
  const normalized = normalizeUrl(value);
  const parsed = new URL(normalized);
  return {
    normalized,
    domain: parsed.hostname,
    protocol: parsed.protocol.replace(":", ""),
    pathDepth: parsed.pathname.split("/").filter(Boolean).length,
    queryLength: parsed.search.length,
    hasCredentials: Boolean(parsed.username || parsed.password),
    usesIpHost: /^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname),
    recommendation: "Inspect the verdict, domain, and indicators before opening this link."
  };
}

function analyzeEmailHeaders(content) {
  const headerBlock = content.split(/\r?\n\r?\n/)[0] || content;
  const get = (name) => headerBlock.match(new RegExp(`^${name}:\\s*(.+)$`, "im"))?.[1]?.trim() || "";
  const received = headerBlock.match(/^Received:\s*(.+)$/gim) || [];
  const authResults = get("Authentication-Results");
  const from = get("From");
  const replyTo = get("Reply-To");
  const returnPath = get("Return-Path");
  const checks = [
    { label: "SPF", status: /spf=pass/i.test(authResults) ? "pass" : /spf=/i.test(authResults) ? "fail_or_softfail" : "unknown" },
    { label: "DKIM", status: /dkim=pass/i.test(authResults) ? "pass" : /dkim=/i.test(authResults) ? "fail_or_softfail" : "unknown" },
    { label: "DMARC", status: /dmarc=pass/i.test(authResults) ? "pass" : /dmarc=/i.test(authResults) ? "fail_or_softfail" : "unknown" }
  ];
  const mismatches = [];
  if (replyTo && from && !replyTo.toLowerCase().includes(from.split("@").pop()?.replace(/[>"]/g, "").toLowerCase() || "")) {
    mismatches.push("Reply-To domain differs from From domain");
  }
  if (returnPath && from && !returnPath.toLowerCase().includes(from.split("@").pop()?.replace(/[>"]/g, "").toLowerCase() || "")) {
    mismatches.push("Return-Path domain differs from From domain");
  }
  return {
    from,
    replyTo,
    returnPath,
    subject: get("Subject"),
    relayHops: received.length,
    checks,
    findings: [
      ...checks.filter((item) => item.status !== "pass").map((item) => `${item.label} is ${item.status}`),
      ...mismatches,
      ...(received.length > 5 ? ["Unusually long relay path"] : [])
    ]
  };
}

async function persistScan({ req, type, content, fileName, fileBatchId, extractedFromFile = false, sourceLabel }) {
  const ai = await predictThreat({ type: type === "file" ? "text" : type, content });
  const threatScore = Math.round((ai.probability || 0) * 100);
  const reputation = type === "url" ? await checkVirusTotal(content) : undefined;
  const verdict = verdictFromScore(threatScore);

  const scan = await ScanReport.create({
    user: req.user._id,
    type,
    input: content,
    normalizedInput: content.toLowerCase(),
    verdict,
    threatScore,
    probability: ai.probability,
    indicators: ai.indicators || [],
    aiDetails: ai,
    reputation,
    fileName,
    fileBatchId,
    extractedFromFile,
    sourceLabel,
    sourceIp: req.ip
  });

  await ThreatLog.create({
    user: req.user._id,
    scan: scan._id,
    event: "scan_completed",
    severity: verdict === "phishing" ? "critical" : verdict === "suspicious" ? "medium" : "low",
    metadata: { verdict, threatScore },
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });

  if (verdict !== "safe") {
    await Notification.create({
      user: req.user._id,
      title: `${verdict === "phishing" ? "High" : "Elevated"} risk detected`,
      message: `Threat score ${threatScore}/100 for your ${type} scan.`,
      type: verdict === "phishing" ? "danger" : "warning",
      link: `/history/${scan._id}`
    });
    sendThreatAlert({
      to: req.user.email,
      subject: "PhishGuard threat alert",
      text: `A ${verdict} item was detected with score ${threatScore}/100.`
    }).catch(() => {});
  }

  return scan;
}

export async function createScan(req, res, next) {
  try {
    const scan = await persistScan({ req, type: req.body.type, content: req.body.content });
    res.status(201).json({ scan });
  } catch (error) {
    next(error);
  }
}

export async function uploadScan(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "Upload a .txt, .eml, .csv, or .json file" });
    const content = await fs.readFile(req.file.path, "utf8");
    const extension = req.file.originalname.split(".").pop()?.toLowerCase() || "txt";
    const extractedItems = extractScanItems(content, extension);
    if (!extractedItems.length) {
      const scan = await persistScan({
        req,
        type: "file",
        content: content.slice(0, 12000),
        fileName: req.file.originalname
      });
      return res.status(201).json({ scan, scans: [scan], extracted: 1 });
    }

    const fileBatchId = `${Date.now()}-${req.file.filename}`;
    const scans = [];
    for (const item of extractedItems) {
      scans.push(
        await persistScan({
          req,
          type: item.type,
          content: item.content,
          fileName: req.file.originalname,
          fileBatchId,
          extractedFromFile: true,
          sourceLabel: item.sourceLabel
        })
      );
    }
    res.status(201).json({ scan: scans[0], scans, extracted: scans.length, fileBatchId });
  } catch (error) {
    next(error);
  }
}

export async function bulkScan(req, res, next) {
  try {
    const scans = [];
    for (const item of req.body.items) {
      const content = item.trim();
      const type = /^https?:\/\//i.test(content) || /^www\./i.test(content) ? "url" : "text";
      scans.push(await persistScan({ req, type, content: type === "url" ? normalizeUrl(content) : content, sourceLabel: "Bulk scan" }));
    }
    res.status(201).json({ scans, total: scans.length });
  } catch (error) {
    next(error);
  }
}

export async function previewUrl(req, res, next) {
  try {
    res.json({ preview: safeUrlPreview(req.body.url || "") });
  } catch (_error) {
    res.status(400).json({ message: "Enter a valid URL to preview" });
  }
}

export async function analyzeHeaders(req, res, next) {
  try {
    res.json({ analysis: analyzeEmailHeaders(req.body.content || "") });
  } catch (error) {
    next(error);
  }
}

export async function listScans(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const filter = { user: req.user._id };
    if (req.query.verdict) filter.verdict = req.query.verdict;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) filter.$text = { $search: req.query.search };
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    const [items, total] = await Promise.all([
      ScanReport.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      ScanReport.countDocuments(filter)
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    next(error);
  }
}

export async function getScan(req, res, next) {
  try {
    const scan = await ScanReport.findOne({ _id: req.params.id, user: req.user._id });
    if (!scan) return res.status(404).json({ message: "Scan not found" });
    res.json({ scan });
  } catch (error) {
    next(error);
  }
}

export async function exportScan(req, res, next) {
  try {
    const scan = await ScanReport.findOne({ _id: req.params.id, user: req.user._id });
    if (!scan) return res.status(404).json({ message: "Scan not found" });
    const pdf = await buildScanPdf(scan);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=scan-${scan._id}.pdf`);
    res.send(pdf);
  } catch (error) {
    next(error);
  }
}

export async function submitScanFeedback(req, res, next) {
  try {
    const scan = await ScanReport.findOne({ _id: req.params.id, user: req.user._id });
    if (!scan) return res.status(404).json({ message: "Scan not found" });

    scan.userFeedback = {
      label: req.body.label,
      note: req.body.note || "",
      submittedAt: new Date()
    };
    scan.status = "reviewed";
    await scan.save();

    await ThreatLog.create({
      user: req.user._id,
      scan: scan._id,
      event: "scan_feedback_submitted",
      severity: req.body.label === "accurate" ? "low" : "medium",
      metadata: { feedback: req.body.label, verdict: scan.verdict, threatScore: scan.threatScore },
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.json({ scan });
  } catch (error) {
    next(error);
  }
}

export async function analytics(req, res, next) {
  try {
    const user = req.user._id;
    const [summary, timeline, latest] = await Promise.all([
      ScanReport.aggregate([
        { $match: { user } },
        { $group: { _id: "$verdict", count: { $sum: 1 }, avgScore: { $avg: "$threatScore" } } }
      ]),
      ScanReport.aggregate([
        { $match: { user } },
        { $group: { _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d" } }, scans: { $sum: 1 }, avgScore: { $avg: "$threatScore" } } },
        { $sort: { _id: 1 } },
        { $limit: 14 }
      ]),
      ScanReport.find({ user }).sort({ createdAt: -1 }).limit(5)
    ]);
    const total = summary.reduce((sum, item) => sum + item.count, 0);
    const weightedRisk = summary.reduce((sum, item) => {
      const weight = item._id === "phishing" ? 100 : item._id === "suspicious" ? 55 : 10;
      return sum + item.count * weight;
    }, 0);
    const riskScore = total ? Math.round(weightedRisk / total) : 0;
    res.json({ summary, timeline, latest, riskScore });
  } catch (error) {
    next(error);
  }
}
