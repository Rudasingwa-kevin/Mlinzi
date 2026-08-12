const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateEmail } = require("deep-email-validator");
const logger = require("../config/logger");

const JWT_SECRET = process.env.JWT_SECRET || "mlinzi-dev-secret-change-in-production";

async function isEmailValid(email) {
  const result = await validateEmail({
    email,
    validateMx: true,
    validateTypo: true,
    validateDisposable: true,
    validateSMTP: false,
  });
  return result.valid;
}

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, role, district, phone } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!["counselor", "national_society"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Validate email format, MX records, typos, disposable domains
    const validEmail = await isEmailValid(email);
    if (!validEmail) {
      return res.status(400).json({ error: "Please use a valid email address" });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password, full_name, role, district, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, full_name, role, is_approved, district, phone",
      [email, hashedPassword, full_name, role, district || null, phone || null]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, is_approved: user.is_approved }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ user, token });
  } catch (err) {
    logger.error({ err }, "Register failed");
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, is_approved: user.is_approved }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, is_approved: user.is_approved },
      token,
    });
  } catch (err) {
    logger.error({ err }, "Login failed");
    res.status(500).json({ error: "Login failed" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, full_name, role, is_approved FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    logger.error({ err }, "GetMe failed");
    res.status(500).json({ error: "Failed to get user" });
  }
};

exports.getPendingCounselors = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, full_name, role, is_approved, created_at FROM users WHERE role = 'counselor' ORDER BY created_at DESC"
    );
    res.json({ counselors: result.rows });
  } catch (err) {
    logger.error({ err }, "GetPendingCounselors failed");
    res.status(500).json({ error: "Failed to fetch counselors" });
  }
};

exports.approveCounselor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE users SET is_approved = TRUE WHERE id = $1 AND role = 'counselor' RETURNING id, email, full_name, role, is_approved",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Counselor not found" });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    logger.error({ err }, "ApproveCounselor failed");
    res.status(500).json({ error: "Failed to approve counselor" });
  }
};
