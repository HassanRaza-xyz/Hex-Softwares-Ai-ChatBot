/**
 * @file Sidebar.jsx
 * @description Glassmorphic sidebar with chat history, new chat button,
 * and model selector. Fully responsive with mobile overlay support.
 */

import { useEffect, useState } from "react";
import {
  MessageSquarePlus,
  History,
  Trash2,
  Bot,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";

// Available Gemini models
const MODELS = [
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", badge: "Stable" },
  { id: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash", badge: "Latest" },
];

export default function Sidebar() {
  const {
    conversations,
    sessionId,
    isSidebarOpen,
    isMobileSidebarOpen,
    selectedModel,
    fetchConversations,
    loadConversation,
    removeConversation,
    startNewChat,
    toggleMobileSidebar,
    setModel,
  } = useChatStore();

  const [deletingId, setDeletingId] = useState(null);

  // Load history on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const handleDelete = async (e, sid) => {
    e.stopPropagation();
    setDeletingId(sid);
    await removeConversation(sid);
    setDeletingId(null);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ─── Logo / Header ─── */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">ChaatBot</h1>
            <p className="text-[10px] text-purple-400">AI Assistant</p>
          </div>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden text-white/40 hover:text-white/80 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ─── New Chat Button ─── */}
      <div className="p-3">
        <button
          onClick={startNewChat}
          id="new-chat-btn"
          className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl
                     bg-gradient-to-r from-purple-600/20 to-blue-600/20
                     border border-purple-500/30 text-white/90 text-sm font-medium
                     hover:from-purple-600/30 hover:to-blue-600/30 hover:border-purple-500/50
                     transition-all duration-200 group"
        >
          <MessageSquarePlus className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
          New Chat
          <Sparkles className="w-3 h-3 ml-auto text-purple-400/60 group-hover:text-purple-300" />
        </button>
      </div>

      {/* ─── Model Selector ─── */}
      <div className="px-3 pb-2">
        <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold px-1 mb-1.5">
          Model
        </p>
        <div className="space-y-1">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150 ${
                selectedModel === m.id
                  ? "bg-purple-600/25 text-purple-300 border border-purple-500/40"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  selectedModel === m.id ? "bg-purple-400" : "bg-white/20"
                }`}
              />
              <span className="flex-1 text-left font-medium">{m.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                  selectedModel === m.id
                    ? "bg-purple-500/30 text-purple-300"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {m.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Chat History ─── */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 min-h-0">
        <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold px-1 mb-2 flex items-center gap-1.5">
          <History className="w-3 h-3" /> History
        </p>

        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquarePlus className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/25">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.sessionId}
              onClick={() => loadConversation(conv.sessionId)}
              className={`w-full group flex items-start gap-2 px-3 py-2.5 rounded-xl
                          border text-left transition-all duration-150
                          ${conv.sessionId === sessionId
                            ? "sidebar-item-active text-white/90"
                            : "border-transparent text-white/55 hover:bg-white/5 hover:text-white/80 hover:border-white/8"
                          }`}
            >
              <ChevronRight
                className={`w-3.5 h-3.5 mt-0.5 shrink-0 transition-opacity ${
                  conv.sessionId === sessionId ? "text-purple-400 opacity-100" : "opacity-0 group-hover:opacity-50"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate leading-snug">
                  {conv.title}
                </p>
                <p className="text-[10px] text-white/30 mt-0.5">
                  {formatDate(conv.updatedAt)}
                </p>
              </div>
              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, conv.sessionId)}
                className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400
                           transition-all duration-150 shrink-0 mt-0.5"
                aria-label="Delete conversation"
              >
                {deletingId === conv.sessionId ? (
                  <div className="w-3 h-3 border border-red-400/50 border-t-red-400 rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
              </button>
            </button>
          ))
        )}
      </div>

      {/* ─── Footer ─── */}
      <div className="p-3 border-t border-white/5">
        <p className="text-[10px] text-white/20 text-center">
          Powered by Google Gemini
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-full glass border-r border-white/5
                    transition-all duration-300 overflow-hidden
                    ${isSidebarOpen ? "w-64" : "w-0 opacity-0 pointer-events-none"}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay Sidebar */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={toggleMobileSidebar}
          />
          {/* Sidebar panel */}
          <aside className="relative z-10 w-72 h-full glass flex flex-col animate-slide-left">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
