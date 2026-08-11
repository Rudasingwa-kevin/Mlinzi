const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTP } = require("../services/otpService");
const { channelLimiter } = require("../middleware/rateLimit");
const { body, validationResult } = require("express-validator");

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

// POST /api/otp/send - Send OTP via SMS or email
router.post("/send", channelLimiter, [
  body("destination")
    .trim()
    .notEmpty().withMessage("Destination is required")
    .isLength({ max: 255 }).withMessage("Destination too long"),
  body("channel")
    .isIn(["sms", "email"]).withMessage("Channel must be 'sms' or 'email'"),
  body("purpose")
    .isIn(["signup", "reset"]).withMessage("Purpose must be 'signup' or 'reset'"),
  validate,
], async (req, res) => {
  try {
    const { destination, channel, purpose } = req.body;
    const result = await sendOTP(destination, purpose, channel);
    res.json({ message: "Verification code sent", expiresIn: result.expiresIn });
  } catch (err) {
    console.error("SendOTP error:", err);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

// POST /api/otp/verify - Verify OTP code
router.post("/verify", channelLimiter, [
  body("destination")
    .trim()
    .notEmpty().withMessage("Destination is required"),
  body("code")
    .isLength({ min: 6, max: 6 }).withMessage("Code must be 6 digits")
    .isNumeric().withMessage("Code must be numbers only"),
  body("purpose")
    .isIn(["signup", "reset"]).withMessage("Purpose must be 'signup' or 'reset'"),
  validate,
], async (req, res) => {
  try {
    const { destination, code, purpose } = req.body;
    const result = await verifyOTP(destination, code, purpose);

    if (result.valid) {
      res.json({ verified: true, message: "Verified successfully" });
    } else {
      res.status(400).json({ verified: false, error: result.error });
    }
  } catch (err) {
    console.error("VerifyOTP error:", err);
    res.status(500).json({ error: "Failed to verify code" });
  }
});

module.exports = router;
