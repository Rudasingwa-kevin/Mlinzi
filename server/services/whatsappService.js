const pool = require("../config/database");
const { analyzeText, analyzeImage } = require("./aiService");
const Report = require("../models/Report");
const fs = require("fs");
const path = require("path");
const logger = require("../config/logger");

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}`;

async function sendWhatsAppMessage(to, message) {
  logger.info({ to }, "WhatsApp outgoing");

  if (process.env.NODE_ENV === "production" && WHATSAPP_TOKEN) {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      });
      return await response.json();
    } catch (err) {
      logger.error({ err }, "WhatsApp send failed");
    }
  }

  return { status: "sent" };
}

async function sendWhatsAppImage(to, imageUrl, caption = "") {
  if (process.env.NODE_ENV === "production" && WHATSAPP_TOKEN) {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "image",
          image: { link: imageUrl, caption },
        }),
      });
      return await response.json();
    } catch (err) {
      logger.error({ err }, "WhatsApp image send failed");
    }
  }
  return { status: "sent" };
}

async function downloadMedia(mediaId) {
  if (!WHATSAPP_TOKEN) return null;

  try {
    // Get media URL
    const mediaRes = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
    });
    const mediaData = await mediaRes.json();

    if (!mediaData.url) return null;

    // Download the file
    const response = await fetch(mediaData.url, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `whatsapp_${Date.now()}.jpg`;
    const filepath = path.join(__dirname, "..", "uploads", filename);
    fs.writeFileSync(filepath, buffer);

    return filepath;
  } catch (err) {
    logger.error({ err }, "Media download failed");
    return null;
  }
}

async function handleWebhook(body) {
  const { entry } = body;
  if (!entry || !entry[0]?.changes?.[0]?.value?.messages) return null;

  const message = entry[0].changes[0].value.messages[0];
  const phoneNumber = message.from;
  const msgType = message.type;

  let textContent = "";
  let imagePath = null;

  switch (msgType) {
    case "text":
      textContent = message.text?.body || "";
      break;
    case "image":
      if (message.image?.id) {
        imagePath = await downloadMedia(message.image.id);
      }
      textContent = message.image?.caption || "Screenshot uploaded via WhatsApp";
      break;
    case "audio":
      textContent = "[Voice message received - transcription pending]";
      break;
    case "document":
      textContent = "[Document received]";
      break;
    default:
      textContent = "";
  }

  if (!textContent && !imagePath) return null;

  // Analyze the content
  let category, severity, confidence, recommendedAction, guidance, extractedText;

  try {
    if (imagePath) {
      const analysis = await analyzeImage(imagePath);
      ({ category, severity, confidence, recommendedAction, guidance, extractedText } = analysis);
    } else {
      const analysis = await analyzeText(textContent);
      ({ category, severity, confidence, recommendedAction, guidance, extractedText } = analysis);
    }
  } catch (aiErr) {
    logger.warn({ err: aiErr }, "AI analysis failed for WhatsApp, using fallback");
    category = "pending_analysis";
    severity = "pending";
    confidence = null;
    recommendedAction = "anonymous_report";
    guidance = "Automated analysis unavailable. A counselor will review this report.";
    extractedText = textContent;
  }

  const report = await Report.create({
    screenshotPath: imagePath ? `/uploads/${path.basename(imagePath)}` : null,
    extractedText,
    category,
    severity,
    confidence,
    recommendedAction,
    guidance,
    channel: "whatsapp",
    isAnonymous: true,
  });

  // Build response based on recommended action
  let responseText = `Mlinzi AI Analysis

Category: ${report.category}
Risk Level: ${report.severity}
Confidence: ${report.confidence || "N/A"}%

${report.guidance}

Reply:
1 - Get safety advice
2 - Report another incident
3 - Connect to a counselor`;

  if (report.recommended_action === "connect_counselor" || report.recommended_action === "emergency_referral") {
    responseText += `\n\nA counselor should review this case. Reply 3 to connect with one now.`;
  }

  if (report.recommended_action === "emergency_referral") {
    responseText += `\n\nIf you are in immediate danger, call:\n- Police: 112\n- Child Helpline: 116`;
  }

  await sendWhatsAppMessage(phoneNumber, responseText);

  return { report, phoneNumber };
}

module.exports = {
  handleWebhook,
  sendWhatsAppMessage,
  sendWhatsAppImage,
};
