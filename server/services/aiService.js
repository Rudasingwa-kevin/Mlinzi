const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are Mlinzi, an AI child safety analyst for a UNICEF platform in Rwanda.

Analyze the following text extracted from a screenshot of an online message. Classify it into exactly ONE of these categories:

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

IMPORTANT: Respond ONLY with valid JSON in this exact format, no extra text:
{
  "category": "category name from the list above",
  "severity": "low | medium | high",
  "guidance": "clear, simple safety advice for the child"
}`;

async function analyzeText(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    SYSTEM_PROMPT,
    `\n\nMessage to analyze:\n"${text}"`,
  ]);

  const response = await result.response;
  const raw = response.text().trim();

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```json\n?/i, "").replace(/\n?```$/i, "").trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (!parsed.category || !parsed.severity || !parsed.guidance) {
      throw new Error("Missing required fields in AI response");
    }

    // Normalize severity
    const validSeverities = ["low", "medium", "high"];
    if (!validSeverities.includes(parsed.severity.toLowerCase())) {
      parsed.severity = "low";
    }
    parsed.severity = parsed.severity.toLowerCase();

    return parsed;
  } catch (parseErr) {
    console.error("AI response parse error:", parseErr.message);
    console.error("Raw AI response:", raw);
    throw new Error("AI returned an invalid response format");
  }
}

module.exports = { analyzeText };
