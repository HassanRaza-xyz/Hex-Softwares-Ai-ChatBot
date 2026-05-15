/**
 * @file ChatInput.jsx
 * @description The message input area with send button, keyboard shortcuts,
 * character counter, and auto-resize textarea.
 *
 * Features:
 *  - Auto-resizing textarea (grows with content, max 200px)
 *  - Send on Enter (Shift+Enter for newline)
 *  - Disabled state while AI is typing
 *  - Smooth focus animations via CSS class
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const MAX_CHARS = 4000;

export default function ChatInput() {
  const { sendChat, isLoading } = useChatStore();
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea as content grows
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [message, resizeTextarea]);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || isLoading || trimmed.length > MAX_CHARS) return;
    sendChat(trimmed);
    setMessage("");
    // Reset height after clearing
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [message, isLoading, sendChat]);

  const handleKeyDown = (e) => {
    // Send on Enter; Shift+Enter inserts newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCount = message.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSend = message.trim().length > 0 && !isLoading && !isOverLimit;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Main input card */}
        <div
          className={`glass rounded-2xl p-3 transition-all duration-300 ${
            isOverLimit ? "border-red-500/40" : ""
          }`}
          style={{ animation: "borderGlow 3s ease-in-out infinite" }}
        >
          <div className="flex items-end gap-3">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "ChaatBot is thinking..." : "Ask me anything... (Enter to send)"}
              disabled={isLoading}
              rows={1}
              className="chat-input flex-1 bg-transparent text-white/90 placeholder-white/25
                         text-sm leading-relaxed resize-none border border-white/8 rounded-xl
                         px-4 py-3 transition-all duration-200 min-h-[48px] max-h-[200px]
                         disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Chat message input"
            />

            {/* Send Button */}
            <button
              id="send-btn"
              onClick={handleSend}
              disabled={!canSend}
              className="send-btn shrink-0 w-11 h-11 rounded-xl flex items-center
                         justify-center text-white shadow-lg"
              aria-label="Send message"
              title="Send (Enter)"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Bottom row: hints + char counter */}
          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[10px] text-white/20">
              <kbd className="px-1 py-0.5 rounded border border-white/15 text-[9px]">Shift+Enter</kbd>
              {" "}for new line
            </p>
            <span
              className={`text-[10px] font-mono transition-colors ${
                isOverLimit
                  ? "text-red-400"
                  : charCount > MAX_CHARS * 0.8
                  ? "text-yellow-400/70"
                  : "text-white/20"
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Footer disclaimer */}
        <p className="text-center text-[10px] text-white/15 mt-3">
          ChaatBot may make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
