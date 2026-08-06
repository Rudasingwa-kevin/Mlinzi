const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

async function analyzeText(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    ANALYSIS_PROMPT,
    `\n\nMessage to analyze:\n"${text}"`,
  ]);

  const response = await result.response;
  const raw = response.text().trim();

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

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    ANALYSIS_PROMPT,
    {
      inlineData: {
        mimeType,
        data: imageBuffer.toString("base64"),
      },
    },
  ]);

  const response = await result.response;
  const raw = response.text().trim();

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
