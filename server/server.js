require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// --------------- Middleware ---------------

// CORS — allow the React frontend during development
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON bodies (for POST/PUT requests)
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files statically (for screenshots)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------- Health Check ---------------

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Mlinzi API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// --------------- Route Registration ---------------

// Routes will be imported and mounted here as we build them:
// const reportRoutes = require("./routes/reportRoutes");
// app.use("/api/reports", reportRoutes);

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
