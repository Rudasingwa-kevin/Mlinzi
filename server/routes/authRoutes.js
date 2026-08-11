const express = require("express");
const router = express.Router();
const { register, login, getMe, getPendingCounselors, approveCounselor } = require("../controllers/authController");
const { forgotPassword, resetPassword } = require("../controllers/authController.passwordReset");
const authenticateToken = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");
const v = require("../middleware/validate");

router.post("/register", authLimiter, v.register, register);
router.post("/login", authLimiter, v.login, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/me", authenticateToken, getMe);
router.get("/counselors", authenticateToken, requireRole("national_society"), getPendingCounselors);
router.patch("/approve/:id", authenticateToken, requireRole("national_society"), approveCounselor);

module.exports = router;
