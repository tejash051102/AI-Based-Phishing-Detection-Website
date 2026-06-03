import { body } from "express-validator";
import { predictThreat } from "../services/ai.service.js";
import { checkVirusTotal } from "../services/reputation.service.js";

export const quickScanRules = [
  body("url").trim().isLength({ min: 4 }).withMessage("URL is required")
];

function normalizeUrl(value) {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function verdictFromScore(score) {
  if (score >= 75) return "phishing";
  if (score >= 45) return "suspicious";
  return "safe";
}

function previewUrl(value) {
  const normalized = normalizeUrl(value);
  const url = new URL(normalized);
  return {
    normalized,
    domain: url.hostname,
    protocol: url.protocol.replace(":", ""),
    pathDepth: url.pathname.split("/").filter(Boolean).length,
    queryLength: url.search.length,
    hasCredentials: Boolean(url.username || url.password),
    usesIpHost: /^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname),
    safeToOpenAdvice: "Review the result before opening this URL directly."
  };
}

export async function publicQuickScan(req, res, next) {
  try {
    const url = normalizeUrl(req.body.url);
    const ai = await predictThreat({ type: "url", content: url });
    const threatScore = Math.round((ai.probability || 0) * 100);
    const reputation = await checkVirusTotal(url);
    res.json({
      scan: {
        type: "url",
        input: url,
        verdict: verdictFromScore(threatScore),
        threatScore,
        probability: ai.probability,
        indicators: ai.indicators || [],
        aiDetails: ai,
        reputation,
        preview: previewUrl(url)
      }
    });
  } catch (error) {
    next(error);
  }
}
