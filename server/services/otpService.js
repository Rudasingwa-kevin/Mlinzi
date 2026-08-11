const crypto = require("crypto");
const pool = require("../config/database");
const { sendSMS } = require("./smsService");

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

function generateCode() {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendOTP(phone, purpose) {
  // Invalidate any existing OTPs for this phone+purpose
  await pool.query(
    "UPDATE otp_codes SET verified = TRUE WHERE phone = $1 AND purpose = $2 AND verified = FALSE",
    [phone, purpose]
  );

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await pool.query(
    "INSERT INTO otp_codes (phone, code, purpose, expires_at) VALUES ($1, $2, $3, $4)",
    [phone, code, purpose, expiresAt]
  );

  const purposeLabel = purpose === "signup" ? "Mlinzi account verification" : "Mlinzi password reset";
  const message = `Your ${purposeLabel} code is: ${code}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.`;

  await sendSMS(phone, message);

  console.log(`[OTP] Sent to ${phone} (${purpose}): ${code}`);
  return { sent: true, expiresIn: OTP_EXPIRY_MINUTES * 60 };
}

async function verifyOTP(phone, code, purpose) {
  const result = await pool.query(
    "SELECT * FROM otp_codes WHERE phone = $1 AND purpose = $2 AND verified = FALSE ORDER BY created_at DESC LIMIT 1",
    [phone, purpose]
  );

  if (result.rows.length === 0) {
    return { valid: false, error: "No verification code found. Request a new one." };
  }

  const otp = result.rows[0];

  if (new Date(otp.expires_at) < new Date()) {
    return { valid: false, error: "Code expired. Request a new one." };
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    await pool.query("UPDATE otp_codes SET verified = TRUE WHERE id = $1", [otp.id]);
    return { valid: false, error: "Too many attempts. Request a new code." };
  }

  if (otp.code !== code) {
    await pool.query("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1", [otp.id]);
    return { valid: false, error: `Invalid code. ${MAX_ATTEMPTS - otp.attempts - 1} attempts left.` };
  }

  // Mark as verified
  await pool.query("UPDATE otp_codes SET verified = TRUE WHERE id = $1", [otp.id]);
  return { valid: true };
}

module.exports = { sendOTP, verifyOTP };
