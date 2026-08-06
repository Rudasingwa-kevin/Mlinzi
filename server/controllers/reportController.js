const { analyzeText, analyzeImage } = require("../services/aiService");
const Report = require("../models/Report");

// POST /api/reports/manual
async function manualReport(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const extractedText = text.trim();

    let category, severity, guidance;
    try {
      const analysis = await analyzeText(extractedText);
      category = analysis.category;
      severity = analysis.severity;
      guidance = analysis.guidance;
    } catch (aiErr) {
      console.error("AI analysis failed:", aiErr.message);
      category = "pending_analysis";
      severity = "pending";
      guidance = "Automated analysis unavailable. A counselor will review this report.";
    }

    const report = await Report.create({
      screenshotPath: null,
      extractedText,
      category,
      severity,
      guidance,
      isAnonymous: true,
    });

    res.status(201).json({
      message: "Report submitted and analyzed",
      report,
    });
  } catch (err) {
    console.error("Manual report error:", err);
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

    let extractedText, category, severity, guidance;

    try {
      const analysis = await analyzeImage(req.file.path);
      extractedText = analysis.extractedText;
      category = analysis.category;
      severity = analysis.severity;
      guidance = analysis.guidance;
    } catch (aiErr) {
      console.error("AI vision analysis failed:", aiErr.message);
      extractedText = "Could not analyze image";
      category = "pending_analysis";
      severity = "pending";
      guidance = "Automated analysis unavailable. A counselor will review this report.";
    }

    const report = await Report.create({
      screenshotPath,
      extractedText,
      category,
      severity,
      guidance,
      isAnonymous: true,
    });

    res.status(201).json({
      message: "Report uploaded and analyzed",
      report,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to process upload" });
  }
}

// GET /api/reports
async function getReports(req, res) {
  try {
    const { status, category, severity, limit, offset } = req.query;
    const reports = await Report.findAll({
      status,
      category,
      severity,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    res.json({ reports });
  } catch (err) {
    console.error("Fetch error:", err);
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
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
}

// PATCH /api/reports/:id/status
async function updateReportStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }
    const report = await Report.updateStatus(req.params.id, status);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json({ report });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update report" });
  }
}

// GET /api/reports/stats
async function getStats(req, res) {
  try {
    const stats = await Report.getStats();
    res.json({ stats });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}

module.exports = {
  manualReport,
  uploadReport,
  getReports,
  getReportById,
  updateReportStatus,
  getStats,
};
