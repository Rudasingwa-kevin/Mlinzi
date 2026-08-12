const express = require("express");
const router = express.Router();
const { handleIncomingSMS } = require("../services/smsService");
const { channelLimiter } = require("../middleware/rateLimit");
const v = require("../middleware/validate");
const logger = require("../config/logger");

// POST /api/sms/incoming - Africa's Talking webhook
router.post("/incoming", channelLimiter, v.incomingSMS, async (req, res) => {
  try {
    const { from, text } = req.body;

    if (!from || !text) {
      return res.status(400).json({ error: "Missing from or text" });
    }

    logger.info({ from, textLength: text.length }, "SMS incoming");

    const result = await handleIncomingSMS(from, text);

    res.json({
      status: "ok",
      reply: result.reply,
      state: result.state,
    });
  } catch (err) {
    logger.error({ err }, "SMS incoming failed");
    res.status(500).json({ error: "Failed to process SMS" });
  }
});

// GET /api/sms/status - Delivery status callback (Africa's Talking)
router.post("/status", (req, res) => {
  // Log delivery status for analytics
  const { id, status, phoneNumber } = req.body;
  logger.info({ id, status, phoneNumber }, "SMS status update");
  res.json({ status: "ok" });
});

module.exports = router;
