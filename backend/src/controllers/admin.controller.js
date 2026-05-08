import ScanReport from "../models/ScanReport.js";
import ThreatLog from "../models/ThreatLog.js";
import User from "../models/User.js";

export async function adminOverview(_req, res, next) {
  try {
    const [users, scans, blockedUsers, verdicts, recentLogs] = await Promise.all([
      User.countDocuments(),
      ScanReport.countDocuments(),
      User.countDocuments({ blocked: true }),
      ScanReport.aggregate([{ $group: { _id: "$verdict", count: { $sum: 1 } } }]),
      ThreatLog.find().sort({ createdAt: -1 }).limit(20).populate("user", "name email")
    ]);
    res.json({ users, scans, blockedUsers, verdicts, recentLogs });
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

