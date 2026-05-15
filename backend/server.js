/**
 * @file server.js
 * @description Main Express server entry point for ChaatBot backend.
 *
 * Features:
 *  - Helmet for security headers
 *  - CORS with configurable origin
 *  - Rate limiting to prevent API abuse
 *  - Morgan for HTTP request logging
 *  - Graceful MongoDB connection with fallback
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./src/config/db");
const chatRoutes = require("./src/routes/chatRoutes");

// ─── App Init ────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ──────────────────────────────────────
connectDB();

// ─── Security Middleware ─────────────────────────────────────
app.use(helmet());

// ─── CORS Configuration ──────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── Rate Limiting ───────────────────────────────────────────
// Allows 100 requests per 15 minutes per IP to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});
app.use("/api", limiter);

// ─── Body Parsers ────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));      // Reject oversized payloads
app.use(express.urlencoded({ extended: true }));

// ─── HTTP Logging ────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── API Routes ──────────────────────────────────────────────
app.use("/api/chat", chatRoutes);

// ─── Health Check Endpoint ───────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🤖 ChaatBot API is running!",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found.` });
});

// ─── Global Error Handler ────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("💥 Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error.",
  });
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 ChaatBot Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔑 Gemini Key: ${process.env.GEMINI_API_KEY ? "✅ Configured" : "❌ Missing!"}\n`);
});

module.exports = app;
