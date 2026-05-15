/**
 * @file MessageBubble.jsx
 * @description Renders an individual chat message with role-based styling,
 * markdown support, code highlighting, and entrance animations.
 *
 * - User messages: right-aligned gradient bubble
 * - AI messages: left-aligned glass card with markdown rendering
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, Copy, Check } from "lucide-react";
import { useState, memo } from "react";

/**
 * Formats a timestamp into a human-readable time string.
 */
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Code block renderer with copy-to-clipboard support.
 */
function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded text-purple-300 bg-purple-500/15 font-mono text-[0.82em]"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-white/8">
      {/* Language badge + copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5">
        <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
          {className?.replace("language-", "") || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/80 transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">Copied!</span></>
          ) : (
            <><Copy className="w-3 h-3" />Copy</>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-black/30">
        <code className={`${className} text-sm font-mono text-slate-300 leading-relaxed`} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

/**
 * Main MessageBubble component.
 */
const MessageBubble = memo(({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 items-start w-full ${
        isUser ? "flex-row-reverse animate-slide-right" : "flex-row animate-slide-left"
      }`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg ${
          isUser
            ? "bg-gradient-to-br from-purple-500 to-blue-600"
            : "bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-purple-300" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl leading-relaxed ${
            isUser
              ? "bg-gradient-to-br from-purple-600 to-blue-700 text-white text-sm shadow-lg shadow-purple-900/30 rounded-tr-sm"
              : "glass-light text-white/90 text-sm rounded-tl-sm prose-dark"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: CodeBlock,
                // Style markdown elements
                h1: ({ children }) => <h1 className="text-lg font-bold text-white mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold text-white/90 mb-1.5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold text-white/80 mb-1">{children}</h3>,
                p: ({ children }) => <p className="text-white/85 leading-relaxed mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2 text-white/80">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2 text-white/80">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                em: ({ children }) => <em className="text-purple-300 italic">{children}</em>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-purple-500 pl-3 my-2 italic text-white/60">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="min-w-full text-xs border border-white/10 rounded-lg overflow-hidden">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => <th className="px-3 py-2 bg-purple-900/30 text-purple-300 font-semibold border border-white/10">{children}</th>,
                td: ({ children }) => <td className="px-3 py-2 border border-white/5 text-white/70">{children}</td>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <span className="text-[10px] text-white/25 px-1">
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
