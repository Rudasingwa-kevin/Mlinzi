const crypto = require("crypto");
const pool = require("../config/database");
const bcrypt = require("bcryptjs");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const TOKEN_EXPIRY_HOURS = 1;

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function sendResetEmail(email, token) {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;

  try {
    const { BrevoClient } = require("@getbrevo/brevo");
    const brevo = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY,
    });

    await brevo.transactionalEmails.sendTransacEmail({
      subject: "Mlinzi — Reset Your Password",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2E7D32;">Password Reset Request</h2>
          <p>You requested to reset your password for your Mlinzi counselor account.</p>
          <p>Click the button below to set a new password. This link expires in ${TOKEN_EXPIRY_HOURS} hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #2E7D32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; margin: 16px 0;">Reset Password</a>
          <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Mlinzi — Child Digital Protection Platform • UNICEF Innovation Project</p>
        </div>
      `,
      sender: { name: "Mlinzi", email: "noreply@mlinzi.org" },
      to: [{ email }],
    });

    console.log(`[PasswordReset] Email sent to ${email}`);
    return true;
  } catch (err) {
    console.error("[PasswordReset] Email send failed:", err.message);
    // In development, log the reset URL so it can be tested without email
    if (process.env.NODE_ENV !== "production") {
      console.log(`[PasswordReset] DEV RESET URL: ${resetUrl}`);
      return true;
    }
    return false;
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Always return success to prevent email enumeration
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.json({ message: "If an account exists with that email, a reset link has been sent." });
    }

    const userId = result.rows[0].id;
    const token = generateToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Invalidate any existing tokens for this user
    await pool.query("UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1", [userId]);

    // Save new token
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expiresAt]
    );

    // Send email
    await sendResetEmail(email, token);

    res.json({ message: "If an account exists with that email, a reset link has been sent." });
  } catch (err) {
    console.error("ForgotPassword error:", err);
    res.status(500).json({ error: "Failed to process request" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Find valid token
    const result = await pool.query(
      "SELECT * FROM password_reset_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    const resetEntry = result.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, resetEntry.user_id]);

    // Mark token as used
    await pool.query("UPDATE password_reset_tokens SET used = TRUE WHERE id = $1", [resetEntry.id]);

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("ResetPassword error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
