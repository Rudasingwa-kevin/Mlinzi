require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middleware ---------------

// Security headers
app.use(helmet());

// CORS — allow the React frontend
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Parse JSON bodies (for POST/PUT requests)
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files statically (for screenshots)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// General API rate limit (baseline protection for all /api routes)
const { apiLimiter } = require("./middleware/rateLimit");
app.use("/api", apiLimiter);

// --------------- Health Check ---------------

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Mlinzi API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
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

// --------------- 404 Handler ---------------

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// --------------- Global Error Handler ---------------

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// --------------- Start Server ---------------

const migrate = require("./models/db");

async function start() {
  await migrate();
  app.listen(PORT, () => {
    console.log(`Mlinzi server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/`);
  });
}

start();

module.exports = app;
