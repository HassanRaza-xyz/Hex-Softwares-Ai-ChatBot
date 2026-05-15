/**
 * @file chatRoutes.js
 * @description Express router for all chat-related API endpoints.
 * Includes graceful handling for when MongoDB is not connected.
 */

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { sendMessageToGemini } = require("../services/geminiService");
const Conversation = require("../models/Conversation");
const { getDBStatus } = require("../config/db");

// ─────────────────────────────────────────────────────────────
// POST /api/chat/message
// ─────────────────────────────────────────────────────────────
router.post("/message", async (req, res) => {
  try {
    const { message, sessionId, model = "gemini-1.5-flash" } = req.body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ success: false, error: "Message is required." });
    }

    const trimmedMessage = message.trim();
    const sid = sessionId || uuidv4();
    const dbConnected = getDBStatus();

    let conversation = null;
    let recentHistory = [];

    // Only try to find conversation if DB is connected
    if (dbConnected) {
      try {
        conversation = await Conversation.findOne({ sessionId: sid });
        if (conversation) {
          recentHistory = conversation.messages.slice(-20);
        }
      } catch (e) {
        console.warn("⚠️ Database query failed, proceeding without history.");
      }
    }

    // Call Gemini API
    const aiResponse = await sendMessageToGemini(trimmedMessage, recentHistory, model);

    // Save to DB if connected
    if (dbConnected) {
      try {
        if (!conversation) {
          conversation = new Conversation({ sessionId: sid, model });
        }
        conversation.messages.push(
          { role: "user", content: trimmedMessage },
          { role: "assistant", content: aiResponse }
        );
        if (conversation.messages.length === 2) conversation.generateTitle();
        await conversation.save();
      } catch (e) {
        console.warn("⚠️ Failed to save conversation to database.");
      }
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: sid,
        message: aiResponse,
        title: conversation?.title || "New Chat",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Chat Route Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message.includes("API_KEY") ? "Invalid API Key" : "AI service error",
    });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/chat/conversations
// ─────────────────────────────────────────────────────────────
router.get("/conversations", async (req, res) => {
  if (!getDBStatus()) return res.status(200).json({ success: true, data: [] });
  try {
    const conversations = await Conversation.find({ isActive: true })
      .select("sessionId title updatedAt")
      .sort({ updatedAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, data: conversations });
  } catch (error) {
    res.status(200).json({ success: true, data: [] });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/chat/:sessionId
// ─────────────────────────────────────────────────────────────
router.get("/:sessionId", async (req, res) => {
  if (!getDBStatus()) return res.status(404).json({ success: false, error: "DB Disconnected" });
  try {
    const conversation = await Conversation.findOne({ sessionId: req.params.sessionId, isActive: true });
    if (!conversation) return res.status(404).json({ success: false, error: "Not found" });
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, error: "Database error" });
  }
});

module.exports = router;
