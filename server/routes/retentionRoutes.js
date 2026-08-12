const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const { apiLimiter } = require("../middleware/rateLimit");
const retention = require("../services/dataRetentionService");

// ── GET /api/retention/stats ──
// Admin/national_society can see what's eligible for purge
router.get(
  "/stats",
  authenticateToken,
  requireRole("national_society"),
  async (req, res) => {
    try {
      const stats = await retention.getRetentionStats();
      res.json(stats);
    } catch (err) {
      console.error("Retention stats error:", err);
      res.status(500).json({ error: "Failed to fetch retention stats" });
    }
  }
);

// ── POST /api/retention/purge ──
// Manual purge trigger (admin/national_society)
router.post(
  "/purge",
  authenticateToken,
  requireRole("national_society"),
  apiLimiter,
  async (req, res) => {
    try {
      const summary = await retention.runFullPurge();
      res.json({ message: "Purge complete", summary });
    } catch (err) {
      console.error("Manual purge error:", err);
      res.status(500).json({ error: "Purge failed" });
    }
  }
);

// ── DELETE /api/retention/my-data ──
// Authenticated user can delete their own account + data
router.delete(
  "/my-data",
  authenticateToken,
  apiLimiter,
  async (req, res) => {
    try {
      await retention.deleteUser(req.user.id);
      res.json({ message: "Account and all associated data deleted" });
    } catch (err) {
      console.error("Self-deletion error:", err);
      res.status(500).json({ error: "Failed to delete account" });
    }
  }
);

module.exports = router;
