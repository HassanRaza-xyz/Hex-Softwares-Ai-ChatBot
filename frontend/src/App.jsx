/**
 * @file App.jsx
 * @description Root application component.
 * Sets up the full-screen layout with glassmorphic orbs,
 * the sidebar, and the main chat window.
 */

import { ChatProvider } from "./store/useChatStore";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  return (
    <ChatProvider>
      {/* ─── Background Decoration Orbs ─────────────────── */}
      <div aria-hidden="true">
        <div
          className="orb w-96 h-96 top-[-10%] left-[-5%] opacity-30"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)", animationDelay: "0s" }}
        />
        <div
          className="orb w-80 h-80 bottom-[-10%] right-[5%] opacity-20"
          style={{ background: "radial-gradient(circle, #1d4ed8, transparent 70%)", animationDelay: "-4s" }}
        />
        <div
          className="orb w-64 h-64 top-[40%] right-[25%] opacity-15"
          style={{ background: "radial-gradient(circle, #be185d, transparent 70%)", animationDelay: "-8s" }}
        />
      </div>

      {/* ─── Main App Shell ──────────────────────────────── */}
      <div className="relative z-10 flex h-screen w-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Chat Window */}
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}
