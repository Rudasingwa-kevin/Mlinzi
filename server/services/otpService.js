const crypto = require("crypto");
const nodemailer = require("nodemailer");
const pool = require("../config/database");
const { sendSMS } = require("./smsService");

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;

const emailTransporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

function generateCode() {
  return crypto.randomInt(100000, 999999).toString();
}

async function sendOTPSms(phone, code, purpose) {
  const purposeLabel = purpose === "signup" ? "Mlinzi account verification" : "Mlinzi password reset";
  const message = `Your ${purposeLabel} code is: ${code}\n\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.`;
  await sendSMS(phone, message);
}

async function sendOTPEmail(email, code, purpose) {
  const purposeLabel = purpose === "signup" ? "Mlinzi account verification" : "Mlinzi password reset";
  const from = `"${process.env.SENDER_NAME || "Mlinzi"}" <${process.env.SENDER_EMAIL}>`;

  await emailTransporter.sendMail({
    from,
    to: email,
    subject: `Mlinzi — Your Verification Code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2E7D32;">Verification Code</h2>
        <p>Your ${purposeLabel} code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2E7D32; text-align: center; padding: 20px; background: #f0fdf4; border-radius: 12px; margin: 16px 0;">${code}</div>
        <p style="color: #666; font-size: 13px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Mlinzi — Child Digital Protection Platform • UNICEF Innovation Project</p>
      </div>
    `,
  });
}

async function sendOTP(destination, purpose, channel = "sms") {
  // Invalidate any existing OTPs for this destination+purpose
  await pool.query(
    "UPDATE otp_codes SET verified = TRUE WHERE destination = $1 AND purpose = $2 AND verified = FALSE",
    [destination, purpose]
  );

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await pool.query(
    "INSERT INTO otp_codes (destination, code, purpose, expires_at) VALUES ($1, $2, $3, $4)",
    [destination, code, purpose, expiresAt]
  );

  if (channel === "email") {
    await sendOTPEmail(destination, code, purpose);
  } else {
    await sendOTPSms(destination, code, purpose);
  }

  console.log(`[OTP] Sent to ${destination} (${purpose}/${channel}): ${code}`);
  return { sent: true, expiresIn: OTP_EXPIRY_MINUTES * 60 };
}

async function verifyOTP(destination, code, purpose) {
  const result = await pool.query(
    "SELECT * FROM otp_codes WHERE destination = $1 AND purpose = $2 AND verified = FALSE ORDER BY created_at DESC LIMIT 1",
    [destination, purpose]
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

  await pool.query("UPDATE otp_codes SET verified = TRUE WHERE id = $1", [otp.id]);
  return { valid: true };
}

module.exports = { sendOTP, verifyOTP };
