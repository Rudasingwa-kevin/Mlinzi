const { extractText } = require("../services/ocrService");
const Report = require("../models/Report");

// POST /api/reports/upload
async function uploadReport(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No screenshot uploaded" });
    }

    const screenshotPath = `/uploads/${req.file.filename}`;

    // Step 1: OCR — extract text from screenshot
    let extractedText;
    try {
      extractedText = await extractText(req.file.path);
    } catch (ocrErr) {
      return res.status(422).json({
        error: "Could not extract text from image",
        detail: ocrErr.message,
      });
    }

    // Step 2: AI analysis placeholder (will be built in Step 4)
    const category = "pending_analysis";
    const severity = "pending";
    const guidance = "Analysis will be available shortly.";

    // Step 3: Save report to database
    const report = await Report.create({
      screenshotPath,
      extractedText,
      category,
      severity,
      guidance,
      isAnonymous: true,
    });

    res.status(201).json({
      message: "Report uploaded and text extracted",
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
  uploadReport,
  getReports,
  getReportById,
  updateReportStatus,
  getStats,
};
