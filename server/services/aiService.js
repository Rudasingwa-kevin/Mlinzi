const fs = require("fs");
const path = require("path");

const ZEN_API_URL = "https://opencode.ai/zen/v1/chat/completions";
const ZEN_API_KEY = process.env.ZEN_API_KEY;
const MODEL_ID = "mimo-v2.5-free";

const ANALYSIS_PROMPT = `You are Mlinzi, an AI child safety analyst for a UNICEF platform in Rwanda.

Analyze the following text or image of an online message. Classify it into exactly ONE of these categories:

- Cyberbullying
- Sextortion
- Grooming
- Scam/Fraud
- Threat of violence
- Harassment
- Hate speech
- Self-harm concern
- Impersonation
- Safe / Low concern

Assess severity as exactly ONE of: low, medium, high

Provide child-friendly guidance that a young person (age 10-17) can understand and follow.

Also extract the text you can read from the message (in whatever language it is written).

IMPORTANT: Respond ONLY with valid JSON in this exact format, no extra text:
{
  "extractedText": "the text you read from the image, or the text provided",
  "category": "category name from the list above",
  "severity": "low | medium | high",
  "guidance": "clear, simple safety advice for the child"
}`;

async function callZenAPI(messages) {
  const response = await fetch(ZEN_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ZEN_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL_ID,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zen API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function analyzeText(text) {
  const messages = [
    { role: "system", content: ANALYSIS_PROMPT },
    { role: "user", content: `Message to analyze:\n"${text}"` },
  ];

  const raw = await callZenAPI(messages);
  const cleaned = raw.replace(/^```json\n?/i, "").replace(/\n?```$/i, "").trim();

  try {
    const parsed = JSON.parse(cleaned);

    if (!parsed.category || !parsed.severity || !parsed.guidance) {
      throw new Error("Missing required fields in AI response");
    }

    const validSeverities = ["low", "medium", "high"];
    if (!validSeverities.includes(parsed.severity.toLowerCase())) {
      parsed.severity = "low";
    }
    parsed.severity = parsed.severity.toLowerCase();

    return {
      extractedText: parsed.extractedText || text,
      category: parsed.category,
      severity: parsed.severity,
      guidance: parsed.guidance,
    };
  } catch (parseErr) {
    console.error("AI response parse error:", parseErr.message);
    console.error("Raw AI response:", raw);
    throw new Error("AI returned an invalid response format");
  }
}

async function analyzeImage(imagePath) {
  const filePath = path.isAbsolute(imagePath)
    ? imagePath
    : path.join(__dirname, "..", imagePath);

  const imageBuffer = fs.readFileSync(filePath);
  const mimeType = filePath.endsWith(".png") ? "image/png" : "image/jpeg";
  const base64Image = imageBuffer.toString("base64");

  const messages = [
    { role: "system", content: ANALYSIS_PROMPT },
    {
      role: "user",
      content: [
        { type: "text", text: "Analyze this image:" },
        {
          type: "image_url",
          image_url: { url: `data:${mimeType};base64,${base64Image}` },
        },
      ],
    },
  ];

  const raw = await callZenAPI(messages);
  const cleaned = raw.replace(/^```json\n?/i, "").replace(/\n?```$/i, "").trim();

  try {
    const parsed = JSON.parse(cleaned);

    if (!parsed.category || !parsed.severity || !parsed.guidance) {
      throw new Error("Missing required fields in AI response");
    }

    const validSeverities = ["low", "medium", "high"];
    if (!validSeverities.includes(parsed.severity.toLowerCase())) {
      parsed.severity = "low";
    }
    parsed.severity = parsed.severity.toLowerCase();

    return {
      extractedText: parsed.extractedText || "",
      category: parsed.category,
      severity: parsed.severity,
      guidance: parsed.guidance,
    };
  } catch (parseErr) {
    console.error("AI vision response parse error:", parseErr.message);
    console.error("Raw AI response:", raw);
    throw new Error("AI returned an invalid response format");
  }
}

module.exports = { analyzeText, analyzeImage };
