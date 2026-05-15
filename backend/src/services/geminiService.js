/**
 * @file geminiService.js
 * @description Service layer for Google Gemini API integration.
 * Abstracts all AI logic away from the route handlers.
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini client with the API key from env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * System instruction that shapes the AI's persona.
 * Customize this to match your chatbot's purpose.
 */
const SYSTEM_INSTRUCTION = `You are ChaatBot, a brilliant and friendly AI assistant. 
You provide clear, concise, and thoughtful answers. 
You format your responses with markdown when helpful (code blocks, bullet points, headers).
You are helpful, honest, and harmless.`;

/**
 * Converts our internal message format to Gemini's expected format.
 * @param {Array} messages - Array of { role, content } objects
 * @returns {Array} Gemini-formatted history array
 */
const formatHistoryForGemini = (messages) => {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
};

/**
 * Sends a message to the Gemini API using multi-turn chat session.
 *
 * @param {string} userMessage - The latest user message
 * @param {Array}  history     - Previous messages for context
 * @param {string} modelName   - Gemini model to use (default: gemini-1.5-flash)
 * @returns {Promise<string>}  The AI's text response
 */
const sendMessageToGemini = async (
  userMessage,
  history = [],
  modelName = "gemini-1.5-flash"
) => {
  // Get the generative model
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  // Format previous messages as Gemini history (exclude the last user message)
  const formattedHistory = formatHistoryForGemini(history);

  // Start a multi-turn chat session with context
  const chat = model.startChat({
    history: formattedHistory,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,        // Balanced creativity
      topP: 0.9,
      topK: 40,
    },
  });

  // Send the current message and await response
  const result = await chat.sendMessage(userMessage);
  const response = result.response;

  return response.text();
};

module.exports = { sendMessageToGemini };
