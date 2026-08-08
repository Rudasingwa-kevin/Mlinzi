const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const ctrl = require("../controllers/reportController");
const authenticateToken = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const { reportLimiter } = require("../middleware/rateLimit");

// Manual text submission (public - children submit) - rate limited
router.post("/manual", reportLimiter, ctrl.manualReport);

// Upload screenshot → OCR → save report (public - children submit) - rate limited
router.post("/upload", reportLimiter, upload.single("screenshot"), ctrl.uploadReport);

// Counselor: list reports with optional filters (protected)
router.get("/", authenticateToken, requireRole("counselor"), ctrl.getReports);

// National dashboard: analytics (protected)
router.get("/stats", authenticateToken, requireRole("national_society"), ctrl.getStats);

// Single report detail (protected - both roles)
router.get("/:id", authenticateToken, requireRole("counselor", "national_society"), ctrl.getReportById);

// Counselor: update report status (protected)
router.patch("/:id/status", authenticateToken, requireRole("counselor"), ctrl.updateReportStatus);

module.exports = router;
