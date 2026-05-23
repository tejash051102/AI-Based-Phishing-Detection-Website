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
  query("type").optional().isIn(["url", "text", "file"])
];

export const feedbackRules = [
  body("label").isIn(["accurate", "false_positive", "false_negative"]).withMessage("Feedback label is invalid"),
  body("note").optional().trim().isLength({ max: 500 }).withMessage("Feedback note must be 500 characters or fewer")
];

function verdictFromScore(score) {
  if (score >= 75) return "phishing";
  if (score >= 45) return "suspicious";
  return "safe";
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

export async function listScans(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const filter = { user: req.user._id };
    if (req.query.verdict) filter.verdict = req.query.verdict;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) filter.$text = { $search: req.query.search };

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
    res.json({ summary, timeline, latest });
  } catch (error) {
    next(error);
  }
}
