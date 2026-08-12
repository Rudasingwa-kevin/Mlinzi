const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const v = require("../middleware/validate");
const {
  getCounselorNotifications,
  markNotificationRead,
  markAllRead,
} = require("../services/notificationService");
const logger = require("../config/logger");

// GET /api/notifications - Get counselor notifications
router.get("/", authenticateToken, requireRole("counselor"), async (req, res) => {
  try {
    const { unreadOnly, limit } = req.query;
    const notifications = await getCounselorNotifications(req.user.id, {
      unreadOnly: unreadOnly === "true",
      limit: limit ? parseInt(limit, 10) : 20,
    });
    res.json({ notifications });
  } catch (err) {
    logger.error({ err }, "GetNotifications failed");
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH /api/notifications/:id/read - Mark as read
router.patch("/:id/read", authenticateToken, requireRole("counselor"), v.markNotificationRead, async (req, res) => {
  try {
    await markNotificationRead(req.params.id);
    res.json({ status: "ok" });
  } catch (err) {
    logger.error({ err }, "MarkRead failed");
    res.status(500).json({ error: "Failed to mark notification" });
  }
});

// POST /api/notifications/read-all - Mark all as read
router.post("/read-all", authenticateToken, requireRole("counselor"), async (req, res) => {
  try {
    await markAllRead(req.user.id);
    res.json({ status: "ok" });
  } catch (err) {
    logger.error({ err }, "MarkAllRead failed");
    res.status(500).json({ error: "Failed to mark notifications" });
  }
});

module.exports = router;
