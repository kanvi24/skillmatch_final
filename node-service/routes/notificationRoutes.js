const express = require("express");
const requireAuth = require("../middleware/auth");
const {
  listNotifications,
  createNotification,
  markAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", requireAuth, listNotifications);
router.post("/", createNotification); // internal endpoint, called by Django backend
router.patch("/:id/read", requireAuth, markAsRead);

module.exports = router;
