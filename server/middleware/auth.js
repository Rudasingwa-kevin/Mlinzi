const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "mlinzi-dev-secret-change-in-production";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

function requireApproved(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Access denied" });
  }
  if (req.user.role === "counselor" && !req.user.is_approved) {
    return res.status(403).json({ error: "Account pending approval" });
  }
  next();
}

module.exports = authenticateToken;
module.exports.requireRole = requireRole;
module.exports.requireApproved = requireApproved;
