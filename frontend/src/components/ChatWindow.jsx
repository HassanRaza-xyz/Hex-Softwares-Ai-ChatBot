/**
 * @file ChatWindow.jsx
 * @description The main chat interface — the heart of ChaatBot.
 *
 * Layout:
 *  ┌─────────────────────────────────────────────┐
 *  │  Header (title, toggles, model badge)        │
 *  ├─────────────────────────────────────────────┤
 *  │                                              │
 *  │  Messages Area (auto-scroll, animations)     │
 *  │                                              │
 *  ├─────────────────────────────────────────────┤
 *  │  ChatInput (auto-resize textarea + send)     │
 *  └─────────────────────────────────────────────┘
 *
 * Features:
 *  - Auto-scroll to latest message
 *  - Shimmer typing indicator
 *  - Error toast with retry
 *  - Welcome screen for new sessions
 *  - Responsive header with sidebar toggles
 */

import { useEffect, useRef, useCallback } from "react";
import {
  PanelLeftOpen,
  PanelLeftClose,
  RotateCcw,
  Zap,
  Brain,
  Code2,
  Sparkles,
  AlertCircle,
  X,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";

// ─── Welcome Screen Suggestions ──────────────────────────────
const SUGGESTIONS = [
  { icon: <Code2 className="w-4 h-4" />, text: "Explain React hooks with examples", color: "from-blue-600/20 to-cyan-600/10 border-blue-500/30" },
  { icon: <Brain className="w-4 h-4" />, text: "Write a Python sorting algorithm", color: "from-purple-600/20 to-pink-600/10 border-purple-500/30" },
  { icon: <Zap className="w-4 h-4" />, text: "How does JWT authentication work?", color: "from-amber-600/20 to-orange-600/10 border-amber-500/30" },
  { icon: <Sparkles className="w-4 h-4" />, text: "Design a RESTful API for a blog app", color: "from-green-600/20 to-teal-600/10 border-green-500/30" },
];

export default function ChatWindow() {
  const {
    messages,
    isLoading,
    error,
    isSidebarOpen,
    selectedModel,
    sendChat,
    toggleSidebar,
    toggleMobileSidebar,
    clearError,
  } = useChatStore();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const isNewChat = messages.length === 0 && !isLoading;

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/5 glass-light">
        {/* Desktop sidebar toggle */}
        <button
          id="sidebar-toggle-desktop"
          onClick={toggleSidebar}
          className="hidden md:flex text-white/40 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/5"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>

        {/* Mobile menu button */}
        <button
          id="sidebar-toggle-mobile"
          onClick={toggleMobileSidebar}
          className="md:hidden text-white/40 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/5"
          aria-label="Open menu"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white/90 truncate">
            {isNewChat ? "New Conversation" : "ChaatBot"}
          </h2>
          <p className="text-[10px] text-white/30 truncate">
            {messages.length > 0 ? `${messages.length} messages` : "Start a conversation"}
          </p>
        </div>

        {/* Model badge */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-600/15 border border-purple-500/25">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-purple-300 font-medium">
              {selectedModel.includes("2.0") ? "2.0 Flash" : "1.5 Flash"}
            </span>
          </div>
        </div>
      </header>

      {/* ─── Messages Area ───────────────────────────────────── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 min-h-0"
        id="messages-container"
      >
        {/* ── Welcome Screen ── */}
        {isNewChat && (
          <div className="flex flex-col items-center justify-center min-h-full text-center animate-fade-in">
            {/* Logo glow */}
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600
                              flex items-center justify-center shadow-2xl glow-purple mx-auto">
                <Sparkles className="w-9 h-9 text-white" />
              </div>
              <div className="absolute -inset-4 bg-purple-500/10 rounded-full blur-xl -z-10" />
            </div>

            <h1 className="text-3xl font-bold gradient-text mb-3">
              Hi, I'm ChaatBot
            </h1>
            <p className="text-white/40 text-sm max-w-md leading-relaxed mb-10">
              Your AI-powered assistant. Ask me anything — code, concepts, analysis,
              or creative ideas. I'm here to help.
            </p>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendChat(s.text)}
                  className={`flex items-center gap-3 p-4 rounded-xl border
                               bg-gradient-to-br ${s.color}
                               text-white/70 hover:text-white/95 text-left text-sm
                               transition-all duration-200 hover:scale-[1.02]
                               hover:shadow-lg group`}
                >
                  <span className="text-purple-400 group-hover:text-purple-300 shrink-0">
                    {s.icon}
                  </span>
                  <span className="leading-snug">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Message List ── */}
        {messages.map((msg) => (
          <MessageBubble key={msg._id || msg.id} message={msg} />
        ))}

        {/* ── Typing Indicator ── */}
        {isLoading && <TypingIndicator />}

        {/* Invisible anchor for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Error Toast ─────────────────────────────────────── */}
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-3 px-4 py-3 rounded-xl
                        bg-red-500/10 border border-red-500/30 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-300 flex-1">{error}</p>
          <button
            onClick={clearError}
            className="text-red-400/60 hover:text-red-400 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── Chat Input ──────────────────────────────────────── */}
      <ChatInput />
    </main>
  );
}
