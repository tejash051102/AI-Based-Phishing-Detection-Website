import ScanReport from "../models/ScanReport.js";
import ThreatLog from "../models/ThreatLog.js";
import User from "../models/User.js";
import { getModelMetrics } from "../services/ai.service.js";

const GEO_POINTS = [
  { country: "India", city: "Mumbai", lat: 19.076, lng: 72.8777 },
  { country: "United States", city: "Ashburn", lat: 39.0438, lng: -77.4874 },
  { country: "Germany", city: "Frankfurt", lat: 50.1109, lng: 8.6821 },
  { country: "Singapore", city: "Singapore", lat: 1.3521, lng: 103.8198 },
  { country: "Brazil", city: "Sao Paulo", lat: -23.5558, lng: -46.6396 },
  { country: "United Kingdom", city: "London", lat: 51.5072, lng: -0.1276 }
];

function geoFromScan(scan) {
  const seed = String(scan.sourceIp || scan._id || "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return GEO_POINTS[seed % GEO_POINTS.length];
}

export async function adminOverview(_req, res, next) {
  try {
    const [users, scans, blockedUsers, verdicts, feedback, recentLogs] = await Promise.all([
      User.countDocuments(),
      ScanReport.countDocuments(),
      User.countDocuments({ blocked: true }),
      ScanReport.aggregate([{ $group: { _id: "$verdict", count: { $sum: 1 } } }]),
      ScanReport.aggregate([
        { $match: { "userFeedback.label": { $exists: true } } },
        { $group: { _id: "$userFeedback.label", count: { $sum: 1 } } }
      ]),
      ThreatLog.find().sort({ createdAt: -1 }).limit(20).populate("user", "name email")
    ]);
    res.json({ users, scans, blockedUsers, verdicts, feedback, recentLogs });
  } catch (error) {
    next(error);
  }
}

export async function allScans(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const filter = {};
    if (req.query.verdict) filter.verdict = req.query.verdict;
    const [items, total] = await Promise.all([
      ScanReport.find(filter).populate("user", "name email role").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      ScanReport.countDocuments(filter)
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    next(error);
  }
}

export async function users(req, res, next) {
  try {
    const items = await User.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function toggleBlockUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.blocked = !user.blocked;
    await user.save();
    await ThreatLog.create({
      user: user._id,
      event: user.blocked ? "user_blocked" : "user_unblocked",
      severity: "medium"
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function threatMap(req, res, next) {
  try {
    const scans = await ScanReport.find({ verdict: { $in: ["suspicious", "phishing"] } })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("user", "name email");
    const grouped = new Map();
    scans.forEach((scan) => {
      const geo = geoFromScan(scan);
      const key = `${geo.country}:${scan.verdict}:${scan.type}`;
      const current = grouped.get(key) || {
        ...geo,
        verdict: scan.verdict,
        type: scan.type,
        count: 0,
        maxScore: 0,
        latest: scan.createdAt
      };
      current.count += 1;
      current.maxScore = Math.max(current.maxScore, scan.threatScore);
      current.latest = current.latest > scan.createdAt ? current.latest : scan.createdAt;
      grouped.set(key, current);
    });
    res.json({ points: [...grouped.values()], recent: scans.slice(0, 12) });
  } catch (error) {
    next(error);
  }
}

export async function modelMonitoring(_req, res, next) {
  try {
    const [metrics, feedback, scans, latestScan] = await Promise.all([
      getModelMetrics().catch(() => null),
      ScanReport.aggregate([
        { $match: { "userFeedback.label": { $exists: true } } },
        { $group: { _id: "$userFeedback.label", count: { $sum: 1 } } }
      ]),
      ScanReport.countDocuments(),
      ScanReport.findOne().sort({ createdAt: -1 })
    ]);

    res.json({
      metrics,
      feedback,
      datasetSize: metrics?.datasetSize || metrics?.samples || scans,
      modelVersion: metrics?.version || "demo-random-forest",
      lastTrainedAt: metrics?.trainedAt || metrics?.createdAt || latestScan?.createdAt || null
    });
  } catch (error) {
    next(error);
  }
}
