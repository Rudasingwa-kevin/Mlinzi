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

// POST /api/otp/send - Send OTP to phone
router.post("/send", channelLimiter, [
  body("phone")
    .trim()
    .matches(/^\+?[0-9]{7,15}$/).withMessage("Invalid phone number"),
  body("purpose")
    .isIn(["signup", "reset"]).withMessage("Purpose must be 'signup' or 'reset'"),
  validate,
], async (req, res) => {
  try {
    const { phone, purpose } = req.body;
    const result = await sendOTP(phone, purpose);
    res.json({ message: "Verification code sent", expiresIn: result.expiresIn });
  } catch (err) {
    console.error("SendOTP error:", err);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

// POST /api/otp/verify - Verify OTP code
router.post("/verify", channelLimiter, [
  body("phone")
    .trim()
    .matches(/^\+?[0-9]{7,15}$/).withMessage("Invalid phone number"),
  body("code")
    .isLength({ min: 6, max: 6 }).withMessage("Code must be 6 digits")
    .isNumeric().withMessage("Code must be numbers only"),
  body("purpose")
    .isIn(["signup", "reset"]).withMessage("Purpose must be 'signup' or 'reset'"),
  validate,
], async (req, res) => {
  try {
    const { phone, code, purpose } = req.body;
    const result = await verifyOTP(phone, code, purpose);

    if (result.valid) {
      res.json({ verified: true, message: "Phone number verified" });
    } else {
      res.status(400).json({ verified: false, error: result.error });
    }
  } catch (err) {
    console.error("VerifyOTP error:", err);
    res.status(500).json({ error: "Failed to verify code" });
  }
});

module.exports = router;
