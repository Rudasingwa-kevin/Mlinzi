const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const ctrl = require("../controllers/reportController");
const authenticateToken = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const { reportLimiter } = require("../middleware/rateLimit");
const v = require("../middleware/validate");

// Manual text submission (public - children submit) - rate limited
router.post("/manual", reportLimiter, v.manualReport, ctrl.manualReport);

// Upload screenshot → OCR → save report (public - children submit) - rate limited
router.post("/upload", reportLimiter, upload.single("screenshot"), v.uploadReport, ctrl.uploadReport);

// Counselor: list reports with optional filters (protected)
router.get("/", authenticateToken, requireRole("counselor"), v.getReports, ctrl.getReports);

// National dashboard: analytics (protected)
router.get("/stats", authenticateToken, requireRole("national_society"), ctrl.getStats);

// Single report detail (protected - both roles)
router.get("/:id", authenticateToken, requireRole("counselor", "national_society"), v.getReportById, ctrl.getReportById);

module.exports = router;
