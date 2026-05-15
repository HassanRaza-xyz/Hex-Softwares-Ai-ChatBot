/**
 * @file api.js
 * @description Centralized Axios instance and API service functions.
 * All backend calls go through this module.
 */

import axios from "axios";

// Create a configured Axios instance
const apiClient = axios.create({
  baseURL: "/api", // Uses Vite's proxy config in dev; replace with full URL in prod
  timeout: 60000,  // 60s — AI responses can take a moment
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      "An unknown error occurred.";
    return Promise.reject(new Error(message));
  }
);

// ─────────────────────────────────────────────────────────────
// API Service Functions
// ─────────────────────────────────────────────────────────────

/**
 * Sends a user message to the backend and returns the AI response.
 * @param {string} message   - The user's message text
 * @param {string} sessionId - The current session/conversation ID (can be null for new chat)
 * @param {string} model     - Gemini model name
 */
export const sendMessage = (message, sessionId = null, model = "gemini-1.5-flash") =>
  apiClient.post("/chat/message", { message, sessionId, model });

/**
 * Fetches all conversations for the sidebar history.
 */
export const getConversations = () => apiClient.get("/chat/conversations");

/**
 * Fetches the full message history for a specific conversation.
 * @param {string} sessionId
 */
export const getConversation = (sessionId) =>
  apiClient.get(`/chat/${sessionId}`);

/**
 * Soft-deletes a conversation.
 * @param {string} sessionId
 */
export const deleteConversation = (sessionId) =>
  apiClient.delete(`/chat/${sessionId}`);

/**
 * Health check to verify backend connectivity.
 */
export const healthCheck = () => apiClient.get("/health");
