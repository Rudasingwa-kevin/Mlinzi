require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const pinoHttp = require("pino-http");
const path = require("path");
const fs = require("fs");
const logger = require("./config/logger");

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middleware ---------------

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      mediaSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  frameguard: { action: "deny" },
}));

// HTTP request logging
app.use(pinoHttp({ logger, autoLogging: process.env.NODE_ENV === "production" }));

// CORS — allow the React frontend
const isProduction = process.env.NODE_ENV === "production";
const defaultOrigins = [
  "http://localhost:5173",
  "https://mlinzi-unicef.vercel.app",
];
const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : [];
const allowedOrigins = [...new Set([...envOrigins, ...defaultOrigins])];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow Render health checks (no Origin header, has render-health-check header)
      // and server-to-server pings
      if (!origin && isProduction) {
        return cb(null, true);
      }
      // Allow requests with no origin in dev (curl, Postman, server-to-server)
      if (!origin && !isProduction) {
        return cb(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["X-Total-Count"],
    maxAge: 86400,
  })
);

// Parse JSON bodies (for POST/PUT requests)
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files statically (for screenshots)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// NOTE: /api rate limiting is handled per-route to avoid double-counting
// with route-specific limiters (authLimiter, reportLimiter, etc.)
const { apiLimiter } = require("./middleware/rateLimit");
app.use("/api", (req, res, next) => {
  // Skip the general limiter for routes that have their own stricter limiter
  const strictPaths = ["/api/auth", "/api/reports", "/api/report", "/api/sms", "/api/whatsapp", "/api/otp"];
  if (strictPaths.some((p) => req.path.startsWith(p))) return next();
  return apiLimiter(req, res, next);
});

// --------------- Health Check ---------------

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Mlinzi API",
    version: "2.1.0",
    timestamp: new Date().toISOString(),
    retention: { days: RETENTION_DAYS },
  });
});

// --------------- Route Registration ---------------

// Auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Report routes
const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);

// Referral routes
const referralRoutes = require("./routes/referralRoutes");
app.use("/api", referralRoutes);

// SMS channel routes
const smsRoutes = require("./routes/smsRoutes");
app.use("/api/sms", smsRoutes);

// WhatsApp channel routes
const whatsappRoutes = require("./routes/whatsappRoutes");
app.use("/api/whatsapp", whatsappRoutes);

// Notification routes
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// OTP routes (signup verification, password reset)
const otpRoutes = require("./routes/otpRoutes");
app.use("/api/otp", otpRoutes);

// Data retention routes (admin stats, manual purge, self-deletion)
const retentionRoutes = require("./routes/retentionRoutes");
app.use("/api/retention", retentionRoutes);

// --------------- 404 Handler ---------------

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// --------------- Global Error Handler ---------------

app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS" || err.message === "Missing Origin header") {
    return res.status(403).json({ error: "Origin not allowed by CORS policy" });
  }
  logger.error({ err }, "Unhandled error");
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// --------------- Start Server ---------------

const migrate = require("./models/db");
const { runFullPurge, RETENTION_DAYS } = require("./services/dataRetentionService");
const { initWebSocket } = require("./services/websocketService");
const { KeepAliveJob } = require("./services/keepAliveService");

// Ensure uploads directory exists (Render's filesystem is ephemeral)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function start() {
  await migrate();
  const server = app.listen(PORT, () => {
    logger.info({ port: PORT, retentionDays: RETENTION_DAYS }, "Mlinzi server started");

    // Attach WebSocket server
    initWebSocket(server);

    // Start keep-alive ping to prevent Render free tier spin-down
    KeepAliveJob.start();

    // Schedule hourly data retention purge
    const ONE_HOUR = 60 * 60 * 1000;
    setInterval(async () => {
      try {
        await runFullPurge();
      } catch (err) {
        logger.error({ err }, "Scheduled data retention purge failed");
      }
    }, ONE_HOUR);
  });
}

// Only start when run directly (not when required by tests)
if (require.main === module) {
  start();
}

module.exports = app;
