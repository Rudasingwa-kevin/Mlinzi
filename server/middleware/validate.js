const { body, query, param, validationResult } = require("express-validator");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

// ── Auth ──

const register = [
  body("email")
    .trim()
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage("Email too long"),
  body("password")
    .isLength({ min: 8, max: 128 }).withMessage("Password must be 8-128 characters"),
  body("full_name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ max: 100 }).withMessage("Name too long")
    .matches(/^[a-zA-Z\s'-]+$/).withMessage("Name contains invalid characters"),
  body("role")
    .isIn(["counselor", "national_society"]).withMessage("Invalid role"),
  body("district")
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage("District too long"),
  body("phone")
    .optional()
    .trim()
    .matches(/^\+?[0-9\s-]{7,15}$/).withMessage("Invalid phone number"),
  validate,
];

const login = [
  body("email")
    .trim()
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
  validate,
];

// ── Reports ──

const manualReport = [
  body("text")
    .trim()
    .notEmpty().withMessage("Text is required")
    .isLength({ min: 2, max: 5000 }).withMessage("Text must be 2-5000 characters"),
  body("channel")
    .optional()
    .isIn(["web", "sms", "whatsapp"]).withMessage("Invalid channel"),
  validate,
];

const uploadReport = [
  body("channel")
    .optional()
    .isIn(["web", "sms", "whatsapp"]).withMessage("Invalid channel"),
  validate,
];

const getReports = [
  query("category")
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage("Category too long"),
  query("severity")
    .optional()
    .isIn(["low", "medium", "high"]).withMessage("Invalid severity"),
  query("channel")
    .optional()
    .isIn(["web", "sms", "whatsapp"]).withMessage("Invalid channel"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  query("offset")
    .optional()
    .isInt({ min: 0 }).withMessage("Offset must be >= 0"),
  validate,
];

const getReportById = [
  param("id")
    .isInt({ min: 1 }).withMessage("Invalid report ID"),
  validate,
];

// ── Referrals ──

const RWANDA_DISTRICTS = [
  "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
  "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo",
  "Gasabo", "Kicukiro", "Nyarugenge",
  "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango",
  "Karongi", "Nyabihu", "Rubavu", "Rusizi", "Rutsiro",
];

const escalate = [
  body("reportId")
    .isInt({ min: 1 }).withMessage("Invalid report ID"),
  body("district")
    .isIn(RWANDA_DISTRICTS).withMessage("Invalid district"),
  body("preferredContact")
    .isIn(["phone", "sms", "whatsapp", "email"]).withMessage("Invalid contact method"),
  body("contactValue")
    .trim()
    .notEmpty().withMessage("Contact value is required")
    .isLength({ max: 255 }).withMessage("Contact value too long"),
  body("bestTime")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Best time too long"),
  body("isSafe")
    .optional()
    .isIn(["Yes", "No", "Not sure"]).withMessage("Invalid safety status"),
  validate,
];

const updateCaseStatus = [
  param("id")
    .isInt({ min: 1 }).withMessage("Invalid case ID"),
  body("status")
    .isIn(["new", "under_review", "resolved"]).withMessage("Invalid status"),
  validate,
];

const addNote = [
  param("id")
    .isInt({ min: 1 }).withMessage("Invalid case ID"),
  body("note")
    .trim()
    .notEmpty().withMessage("Note is required")
    .isLength({ max: 2000 }).withMessage("Note too long"),
  validate,
];

const counselorCases = [
  query("status")
    .optional()
    .isIn(["new", "under_review", "resolved"]).withMessage("Invalid status"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be 1-100"),
  query("offset")
    .optional()
    .isInt({ min: 0 }).withMessage("Offset must be >= 0"),
  validate,
];

const caseById = [
  param("id")
    .isInt({ min: 1 }).withMessage("Invalid case ID"),
  validate,
];

// ── SMS / WhatsApp ──

const incomingSMS = [
  body("from")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^\+?[0-9]{7,15}$/).withMessage("Invalid phone number"),
  body("text")
    .trim()
    .notEmpty().withMessage("Message text is required")
    .isLength({ max: 1600 }).withMessage("Message too long"),
  validate,
];

const whatsappWebhook = [
  body("object")
    .equals("whatsapp_business_account").withMessage("Invalid webhook payload"),
  validate,
];

// ── Notifications ──

const markNotificationRead = [
  param("id")
    .isInt({ min: 1 }).withMessage("Invalid notification ID"),
  validate,
];

module.exports = {
  validate,
  register,
  login,
  manualReport,
  uploadReport,
  getReports,
  getReportById,
  escalate,
  updateCaseStatus,
  addNote,
  counselorCases,
  caseById,
  incomingSMS,
  whatsappWebhook,
  markNotificationRead,
};
