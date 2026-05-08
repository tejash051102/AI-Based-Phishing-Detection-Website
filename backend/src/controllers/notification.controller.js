import Notification from "../models/Notification.js";

export async function listNotifications(req, res, next) {
  try {
    const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
    res.json({ items });
  } catch (error) {
    next(error);
  }
}

export async function markRead(req, res, next) {
  try {
    await Notification.updateMany({ user: req.user._id, _id: { $in: req.body.ids || [] } }, { read: true });
    res.json({ message: "Notifications updated" });
  } catch (error) {
    next(error);
  }
}

