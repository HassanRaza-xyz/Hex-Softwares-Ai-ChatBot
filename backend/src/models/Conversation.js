/**
 * @file Conversation.js
 * @description Mongoose schema for storing chat conversations.
 * Each conversation belongs to a session and contains an ordered list of messages.
 */

const mongoose = require("mongoose");

// ----- Message Sub-Schema -----
const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// ----- Conversation Schema -----
const ConversationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
    messages: [MessageSchema],
    model: {
      type: String,
      default: "gemini-1.5-flash",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

/**
 * Auto-generate conversation title from the first user message.
 * Truncates to 60 characters for a clean sidebar display.
 */
ConversationSchema.methods.generateTitle = function () {
  const firstUserMsg = this.messages.find((m) => m.role === "user");
  if (firstUserMsg) {
    this.title =
      firstUserMsg.content.length > 60
        ? firstUserMsg.content.substring(0, 57) + "..."
        : firstUserMsg.content;
  }
};

module.exports = mongoose.model("Conversation", ConversationSchema);
