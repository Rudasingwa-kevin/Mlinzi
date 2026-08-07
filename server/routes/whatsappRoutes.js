const express = require("express");
const router = express.Router();
const { handleWebhook } = require("../services/whatsappService");

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "mlinzi_webhook_verify";

// GET /api/whatsapp/webhook - Webhook verification
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[WhatsApp] Webhook verified");
    res.status(200).send(challenge);
  } else {
    console.error("[WhatsApp] Verification failed");
    res.sendStatus(403);
  }
});

// POST /api/whatsapp/webhook - Incoming messages
router.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // Always respond 200 quickly to avoid timeouts
    res.sendStatus(200);

    // Process the message asynchronously
    if (body.object === "whatsapp_business_account") {
      await handleWebhook(body);
    }
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
  }
});

module.exports = router;
