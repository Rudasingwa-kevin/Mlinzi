const { analyzeText, analyzeImage } = require("../services/aiService");
const Report = require("../models/Report");
const logger = require("../config/logger");

// POST /api/reports/manual
async function manualReport(req, res) {
  try {
    const { text, channel } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const extractedText = text.trim();

    let category, severity, confidence, recommendedAction, guidance;
    try {
      const analysis = await analyzeText(extractedText);
      category = analysis.category;
      severity = analysis.severity;
      confidence = analysis.confidence;
      recommendedAction = analysis.recommendedAction;
      guidance = analysis.guidance;
    } catch (aiErr) {
      logger.warn({ err: aiErr }, "AI text analysis failed, using fallback");
      category = "pending_analysis";
      severity = "pending";
      confidence = null;
      recommendedAction = "anonymous_report";
      guidance = "Automated analysis unavailable. A counselor will review this report.";
    }

    const report = await Report.create({
      screenshotPath: null,
      extractedText,
      category,
      severity,
      confidence,
      recommendedAction,
      guidance,
      channel: channel || "web",
      isAnonymous: true,
    });

    res.status(201).json({
      message: "Report submitted and analyzed",
      report,
    });
  } catch (err) {
    logger.error({ err }, "Manual report failed");
    res.status(500).json({ error: "Failed to process report" });
  }
}

// POST /api/reports/upload
async function uploadReport(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No screenshot uploaded" });
    }

    const screenshotPath = `/uploads/${req.file.filename}`;
    const channel = req.body.channel || "web";

    let extractedText, category, severity, confidence, recommendedAction, guidance;

    try {
      const analysis = await analyzeImage(req.file.path);
      extractedText = analysis.extractedText;
      category = analysis.category;
      severity = analysis.severity;
      confidence = analysis.confidence;
      recommendedAction = analysis.recommendedAction;
      guidance = analysis.guidance;
    } catch (aiErr) {
      logger.warn({ err: aiErr }, "AI image analysis failed, using fallback");
      extractedText = "Could not analyze image";
      category = "pending_analysis";
      severity = "pending";
      confidence = null;
      recommendedAction = "anonymous_report";
      guidance = "Automated analysis unavailable. A counselor will review this report.";
    }

    const report = await Report.create({
      screenshotPath,
      extractedText,
      category,
      severity,
      confidence,
      recommendedAction,
      guidance,
      channel,
      isAnonymous: true,
    });

    res.status(201).json({
      message: "Report uploaded and analyzed",
      report,
    });
  } catch (err) {
    logger.error({ err }, "Upload report failed");
    res.status(500).json({ error: "Failed to process upload" });
  }
}

// GET /api/reports
async function getReports(req, res) {
  try {
    const { status, category, severity, district, channel, limit, offset } = req.query;
    const reports = await Report.findAll({
      category,
      severity,
      district,
      channel,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    res.json({ reports });
  } catch (err) {
    logger.error({ err }, "Fetch reports failed");
    res.status(500).json({ error: "Failed to fetch reports" });
  }
}

// GET /api/reports/:id
async function getReportById(req, res) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json({ report });
  } catch (err) {
    logger.error({ err }, "Fetch report by ID failed");
    res.status(500).json({ error: "Failed to fetch report" });
  }
}

// GET /api/reports/stats
async function getStats(req, res) {
  try {
    const stats = await Report.getStats();
    res.json({ stats });
  } catch (err) {
    logger.error({ err }, "Fetch stats failed");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}

module.exports = {
  manualReport,
  uploadReport,
  getReports,
  getReportById,
  getStats,
};
