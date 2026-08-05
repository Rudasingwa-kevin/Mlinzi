const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const ctrl = require("../controllers/reportController");

// Upload screenshot → OCR → save report
router.post("/upload", upload.single("screenshot"), ctrl.uploadReport);

// Counselor: list reports with optional filters
router.get("/", ctrl.getReports);

// National dashboard: analytics
router.get("/stats", ctrl.getStats);

// Single report detail
router.get("/:id", ctrl.getReportById);

// Counselor: update report status
router.patch("/:id/status", ctrl.updateReportStatus);

module.exports = router;
