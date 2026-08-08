const express = require("express");
const router = express.Router();
const { register, login, getMe, getPendingCounselors, approveCounselor } = require("../controllers/authController");
const authenticateToken = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimit");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", authenticateToken, getMe);
router.get("/counselors", authenticateToken, requireRole("national_society"), getPendingCounselors);
router.patch("/approve/:id", authenticateToken, requireRole("national_society"), approveCounselor);

module.exports = router;
