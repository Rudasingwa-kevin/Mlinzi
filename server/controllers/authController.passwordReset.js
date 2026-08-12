const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const { sendOTP, verifyOTP } = require("../services/otpService");
const logger = require("../config/logger");

exports.forgotPassword = async (req, res) => {
  try {
    const { destination, channel } = req.body;

    if (!destination) {
      return res.status(400).json({ error: "Phone number or email is required" });
    }

    if (!["sms", "email"].includes(channel)) {
      return res.status(400).json({ error: "Channel must be 'sms' or 'email'" });
    }

    // Check if a counselor exists with this phone or email
    let query, params;
    if (channel === "sms") {
      query = "SELECT id FROM users WHERE phone = $1 AND role = 'counselor'";
      params = [destination];
    } else {
      query = "SELECT id FROM users WHERE email = $1 AND role = 'counselor'";
      params = [destination];
    }

    const result = await pool.query(query, params);

    // Always return success to prevent enumeration
    if (result.rows.length === 0) {
      return res.json({ message: "If an account exists, a verification code has been sent." });
    }

    await sendOTP(destination, "reset", channel);

    res.json({ message: "If an account exists, a verification code has been sent." });
  } catch (err) {
    logger.error({ err }, "ForgotPassword failed");
    res.status(500).json({ error: "Failed to process request" });
  }
};

exports.verifyResetOTP = async (req, res) => {
  try {
    const { destination, code } = req.body;

    if (!destination || !code) {
      return res.status(400).json({ error: "Destination and code are required" });
    }

    const result = await verifyOTP(destination, code, "reset");

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    // Generate a short-lived reset token (5 minutes)
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Get user ID from phone or email
    let userResult;
    if (destination.includes("@")) {
      userResult = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND role = 'counselor'",
        [destination]
      );
    } else {
      userResult = await pool.query(
        "SELECT id FROM users WHERE phone = $1 AND role = 'counselor'",
        [destination]
      );
    }

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Account not found" });
    }

    // Save reset token
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userResult.rows[0].id, resetToken, expiresAt]
    );

    res.json({ verified: true, resetToken });
  } catch (err) {
    logger.error({ err }, "VerifyResetOTP failed");
    res.status(500).json({ error: "Failed to verify code" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({ error: "Reset token and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const result = await pool.query(
      "SELECT * FROM password_reset_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW()",
      [resetToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const resetEntry = result.rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, resetEntry.user_id]);
    await pool.query("UPDATE password_reset_tokens SET used = TRUE WHERE id = $1", [resetEntry.id]);

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    logger.error({ err }, "ResetPassword failed");
    res.status(500).json({ error: "Failed to reset password" });
  }
};
