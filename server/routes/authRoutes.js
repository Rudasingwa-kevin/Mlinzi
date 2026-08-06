const express = require("express");
const router = express.Router();
const { register, login, getMe, getPendingCounselors, approveCounselor } = require("../controllers/authController");
const authenticateToken = require("../middleware/auth");
const { requireRole } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);
router.get("/counselors", authenticateToken, requireRole("national_society"), getPendingCounselors);
router.patch("/approve/:id", authenticateToken, requireRole("national_society"), approveCounselor);

module.exports = router;
