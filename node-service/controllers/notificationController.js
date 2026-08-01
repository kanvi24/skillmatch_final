const Notification = require("../models/Notification");

// GET /api/notifications - list the logged-in user's notifications
async function listNotifications(req, res) {
  try {
    const notifications = await Notification.find({ userId: req.user.email })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      userId: req.user.email,
      isRead: false,
    });
    return res.json({ unreadCount, notifications });
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
}

// POST /api/notifications - create a notification (e.g. triggered by the Django backend)
async function createNotification(req, res) {
  try {
    const { userId, type, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ detail: "userId and message are required" });
    }
    const notification = await Notification.create({ userId, type, message });
    return res.status(201).json(notification);
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
}

// PATCH /api/notifications/:id/read
async function markAsRead(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.email },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ detail: "Notification not found" });
    }
    return res.json(notification);
  } catch (err) {
    return res.status(400).json({ detail: err.message });
  }
}

module.exports = { listNotifications, createNotification, markAsRead };
