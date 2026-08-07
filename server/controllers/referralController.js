const pool = require("../config/database");
const ReferralCase = require("../models/ReferralCase");
const CounselorNote = require("../models/CounselorNote");
const Report = require("../models/Report");
const { notifyCounselorNewCase, notifyHighRiskCase, notifyCaseStatusChange } = require("../services/notificationService");

const RWANDA_DISTRICTS = [
  "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
  "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo",
  "Gasabo", "Kicukiro", "Nyarugenge",
  "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango",
  "Bugarama", "Kamembe", "Murundi", "Nyamashepe", "Nyungwe", "Rusizi",
  "Karongi", "Ngorester", "Nyabihu", "Nyamashepe", "Rubavu", "Rutsiro"
];

exports.getDistricts = (req, res) => {
  res.json({ districts: RWANDA_DISTRICTS });
};

exports.escalate = async (req, res) => {
  try {
    const { reportId, district, preferredContact, contactValue, bestTime, isSafe } = req.body;

    if (!reportId || !district || !preferredContact || !contactValue) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!RWANDA_DISTRICTS.includes(district)) {
      return res.status(400).json({ error: "Invalid district" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const referral = await ReferralCase.create({
      reportId,
      district,
      preferredContact,
      contactValue,
      bestTime,
      isSafe,
    });

    await Report.updateEscalated(reportId);

    // Notify counselors in the district
    try {
      if (report.severity === "high") {
        await notifyHighRiskCase({ id: referral.id, district, category: report.category, severity: report.severity });
      }
      // Auto-assign to first available counselor in district
      const counselorResult = await pool.query(
        "SELECT id FROM users WHERE role = 'counselor' AND is_approved = TRUE AND district = $1 LIMIT 1",
        [district]
      );
      if (counselorResult.rows.length > 0) {
        const counselorId = counselorResult.rows[0].id;
        await ReferralCase.assignCounselor(referral.id, counselorId);
        await notifyCounselorNewCase(counselorId, { id: referral.id, district, category: report.category, severity: report.severity });
      }
    } catch (notifErr) {
      console.error("Notification error (non-blocking):", notifErr.message);
    }

    res.status(201).json({ referral });
  } catch (err) {
    console.error("Escalate error:", err);
    res.status(500).json({ error: "Failed to create referral" });
  }
};

exports.getCounselorCases = async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const cases = await ReferralCase.findByCounselor(req.user.id, {
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    res.json({ cases });
  } catch (err) {
    console.error("GetCounselorCases error:", err);
    res.status(500).json({ error: "Failed to fetch cases" });
  }
};

exports.getUnassignedCases = async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const cases = await ReferralCase.findUnassigned({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
    res.json({ cases });
  } catch (err) {
    console.error("GetUnassignedCases error:", err);
    res.status(500).json({ error: "Failed to fetch cases" });
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const caseData = await ReferralCase.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: "Case not found" });
    }
    const notes = await CounselorNote.findByCase(req.params.id);
    res.json({ case: caseData, notes });
  } catch (err) {
    console.error("GetCaseById error:", err);
    res.status(500).json({ error: "Failed to fetch case" });
  }
};

exports.assignCase = async (req, res) => {
  try {
    const caseData = await ReferralCase.assignCounselor(req.params.id, req.user.id);
    if (!caseData) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.json({ case: caseData });
  } catch (err) {
    console.error("AssignCase error:", err);
    res.status(500).json({ error: "Failed to assign case" });
  }
};

exports.updateCaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const caseData = await ReferralCase.updateStatus(req.params.id, status, req.user.id);
    if (!caseData) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Notify on status change
    try {
      await notifyCaseStatusChange(req.params.id, status, req.user.id);
    } catch (notifErr) {
      console.error("Status change notification error:", notifErr.message);
    }

    res.json({ case: caseData });
  } catch (err) {
    console.error("UpdateCaseStatus error:", err);
    res.status(500).json({ error: "Failed to update case status" });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({ error: "Note is required" });
    }

    const caseData = await ReferralCase.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ error: "Case not found" });
    }

    if (caseData.assigned_counselor_id !== req.user.id) {
      return res.status(403).json({ error: "Not assigned to this case" });
    }

    const newNote = await CounselorNote.create({
      caseId: req.params.id,
      counselorId: req.user.id,
      note,
    });

    res.status(201).json({ note: newNote });
  } catch (err) {
    console.error("AddNote error:", err);
    res.status(500).json({ error: "Failed to add note" });
  }
};

exports.getNationalAnalytics = async (req, res) => {
  try {
    const reportStats = await Report.getStats();
    const referralStats = await ReferralCase.getStats();

    // Additional analytics: response time breakdown, district heatmap data
    const responseTimeBreakdown = await pool.query(`
      SELECT
        district,
        COUNT(*) as total_cases,
        AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 3600) as avg_response_hours,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) as avg_resolution_hours
      FROM referral_cases
      WHERE first_response_at IS NOT NULL
      GROUP BY district
      ORDER BY avg_response_hours ASC
    `);

    const channelBreakdown = await pool.query(`
      SELECT channel, COUNT(*) as count FROM reports GROUP BY channel ORDER BY count DESC
    `);

    res.json({
      reportStats,
      referralStats,
      responseTimeByDistrict: responseTimeBreakdown.rows,
      channelBreakdown: channelBreakdown.rows,
    });
  } catch (err) {
    console.error("GetNationalAnalytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
