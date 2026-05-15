/**
 * @file TypingIndicator.jsx
 * @description Animated shimmer loading indicator displayed while
 * the AI is generating a response. Shows three pulsing dots
 * and a shimmer skeleton to hint at content loading.
 */

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start animate-fade-in">
      {/* AI Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center">
        <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-11h2v6h-2zm0-4h2v2h-2z" />
        </svg>
      </div>

      <div className="flex flex-col gap-2.5 max-w-xs">
        {/* Pulsing dots container */}
        <div className="glass-light px-5 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="ml-2 text-xs text-white/30 font-medium">Thinking...</span>
        </div>

        {/* Shimmer skeleton lines — hint at upcoming content */}
        <div className="space-y-2 pl-1">
          <div className="shimmer h-3 w-56 rounded" />
          <div className="shimmer h-3 w-40 rounded" />
          <div className="shimmer h-3 w-48 rounded" />
        </div>
      </div>
    </div>
  );
}
