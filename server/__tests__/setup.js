// Load env vars BEFORE anything else (so JWT_SECRET is available)
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mlinzi-dev-secret-change-in-production";

// ── Mock Database Pool ──

let mockQueryFn = jest.fn();

jest.mock("../config/database", () => ({
  query: (...args) => mockQueryFn(...args),
  on: jest.fn(),
}));

// ── Mock Logger (silent in tests) ──

jest.mock("../config/logger", () => {
  const noop = () => {};
  return {
    info: noop,
    warn: noop,
    error: noop,
    debug: noop,
    child: () => ({ info: noop, warn: noop, error: noop, debug: noop }),
  };
});

jest.mock("pino-http", () => {
  return () => (req, res, next) => next();
});

// ── Mock Rate Limiter (no-op in tests) ──

jest.mock("../middleware/rateLimit", () => {
  const noop = (req, res, next) => next();
  return {
    apiLimiter: noop,
    authLimiter: noop,
    reportLimiter: noop,
    escalationLimiter: noop,
    channelLimiter: noop,
  };
});

// ── Mock External Services (silent) ──

jest.mock("../services/aiService", () => ({
  analyzeText: jest.fn().mockResolvedValue({
    category: "bullying",
    severity: "medium",
    confidence: 85,
    recommendedAction: "anonymous_report",
    guidance: "This appears to be bullying.",
  }),
  analyzeImage: jest.fn().mockResolvedValue({
    extractedText: "Sample extracted text",
    category: "bullying",
    severity: "medium",
    confidence: 80,
    recommendedAction: "anonymous_report",
    guidance: "This image contains concerning content.",
  }),
}));

jest.mock("../services/otpService", () => ({
  sendOTP: jest.fn().mockResolvedValue({ expiresIn: 600 }),
  verifyOTP: jest.fn(),
}));

jest.mock("../services/smsService", () => ({
  handleIncomingSMS: jest.fn(),
}));

jest.mock("../services/whatsappService", () => ({
  handleWebhook: jest.fn(),
}));

jest.mock("../services/notificationService", () => ({
  getCounselorNotifications: jest.fn().mockResolvedValue([]),
  markNotificationRead: jest.fn(),
  markAllRead: jest.fn(),
  notifyCounselorNewCase: jest.fn(),
  notifyHighRiskCase: jest.fn(),
  notifyCaseStatusChange: jest.fn(),
}));

jest.mock("../services/dataRetentionService", () => ({
  getRetentionStats: jest.fn().mockResolvedValue({
    retentionDays: 90,
    tables: {
      reports: { total: 0, expired: 0 },
      referral_cases: { total: 0, expired: 0 },
      counselor_notes: { total: 0, expired: 0 },
      sms_sessions: { total: 0, expired: 0 },
      notifications: { total: 0, expired: 0 },
      otp_codes: { total: 0, expired: 0 },
      password_reset_tokens: { total: 0, expired: 0 },
    },
  }),
  runFullPurge: jest.fn().mockResolvedValue({
    timestamp: new Date().toISOString(),
    retentionDays: 90,
    results: [],
    totalDeleted: 0,
  }),
  deleteUser: jest.fn(),
  RETENTION_DAYS: 90,
}));

jest.mock("deep-email-validator", () => ({
  validateEmail: jest.fn().mockResolvedValue({ valid: true }),
}));

jest.mock("multer", () => {
  const multerInstance = {
    single: () => (req, res, next) => next(),
  };
  const multerFn = jest.fn(() => multerInstance);
  multerFn.diskStorage = jest.fn(() => ({
    destination: () => {},
    filename: () => {},
  }));
  multerFn.memoryStorage = jest.fn(() => ({}));
  return multerFn;
});

// ── Helpers ──

function setMockQuery(fn) {
  mockQueryFn = fn;
}

function getMockQuery() {
  return mockQueryFn;
}

function makeToken(payload = {}) {
  return jwt.sign(
    { id: 1, role: "counselor", is_approved: true, ...payload },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

function makeNationalToken(payload = {}) {
  return jwt.sign(
    { id: 2, role: "national_society", is_approved: true, ...payload },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

function mockQuerySequence(results) {
  let callIndex = 0;
  mockQueryFn = jest.fn().mockImplementation(() => {
    const idx = callIndex++;
    if (idx < results.length) {
      const r = results[idx];
      return typeof r === "function" ? r() : Promise.resolve(r);
    }
    return Promise.resolve({ rows: [], rowCount: 0 });
  });
}

module.exports = {
  setMockQuery,
  getMockQuery,
  makeToken,
  makeNationalToken,
  mockQuerySequence,
  JWT_SECRET,
};
