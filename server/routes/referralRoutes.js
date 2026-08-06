const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/referralController");
const authenticateToken = require("../middleware/auth");
const { requireRole, requireApproved } = require("../middleware/auth");

router.get("/districts", ctrl.getDistricts);

router.post("/report/escalate", ctrl.escalate);

router.get("/counselor/cases", authenticateToken, requireRole("counselor"), requireApproved, ctrl.getCounselorCases);
router.get("/counselor/unassigned", authenticateToken, requireRole("counselor"), requireApproved, ctrl.getUnassignedCases);
router.get("/counselor/cases/:id", authenticateToken, requireRole("counselor"), requireApproved, ctrl.getCaseById);
router.post("/counselor/cases/:id/claim", authenticateToken, requireRole("counselor"), requireApproved, ctrl.assignCase);
router.patch("/counselor/cases/:id/status", authenticateToken, requireRole("counselor"), requireApproved, ctrl.updateCaseStatus);
router.post("/counselor/cases/:id/notes", authenticateToken, requireRole("counselor"), requireApproved, ctrl.addNote);

router.get("/national/analytics", authenticateToken, requireRole("national_society"), ctrl.getNationalAnalytics);

module.exports = router;
