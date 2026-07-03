"use client";
import { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/Header";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "Which clients haven't been contacted in the last 30 days?",
  "Show me all pending follow-ups that are overdue",
  "What quotes are currently awaiting approval?",
  "Which clients are at risk or quiet?",
  "Summarise all communications this week",
  "Which projects are behind schedule?",
];

export default function AISearchPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi Jonathan 👋 I'm your CS Hub AI assistant. Ask me anything about your clients, follow-ups, documents, projects or communications — I'll search your real data and give you a straight answer.\n\nTry asking something like *\"Which clients haven't been contacted this month?\"* or *\"Show me overdue follow-ups.\"*",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (query: string) => {
    if (!query.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: query, timestamp: new Date() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.pending
          ? "⚠️ AI search is not yet configured. Ask your admin to add the GEMINI_API_KEY to Vercel environment variables."
          : data.answer || data.error || "Something went wrong.",
        timestamp: new Date(),
      };
      setMessages(m => [...m, assistantMsg]);
    } catch {
      setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: "assistant", content: "Connection error. Please try again.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <>
      <Header title="AI Assistant" subtitle="Ask anything about your clients, documents and communications" />

      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", overflow: "hidden" }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {messages.map(msg => (
            <div key={msg.id} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 12, alignItems: "flex-start" }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: msg.role === "user" ? "var(--accent-green)" : "linear-gradient(135deg, #1a1a2e, #16213e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "white",
                border: msg.role === "assistant" ? "2px solid rgba(21,128,61,0.3)" : "none",
              }}>
                {msg.role === "user" ? "JV" : (
                  <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                )}
              </div>

              {/* Bubble */}
              <div style={{
                maxWidth: "72%",
                background: msg.role === "user" ? "var(--accent-green)" : "var(--bg-surface)",
                color: msg.role === "user" ? "white" : "var(--text-primary)",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "12px 16px",
                border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                boxShadow: "var(--shadow-sm)",
                fontSize: 13,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}>
                {msg.content}
                <div style={{ fontSize: 10, opacity: 0.5, marginTop: 6, textAlign: msg.role === "user" ? "right" : "left" }}>
                  {msg.timestamp.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "2px solid rgba(21,128,61,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "18px 18px 18px 4px", padding: "14px 18px", display: "flex", gap: 6, alignItems: "center" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", animation: `bounce 1.2s ease infinite ${i * 0.2}s` }} />
                ))}
                <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
              </div>
            </div>
          )}

          {/* Suggestions — only on first message */}
          {messages.length === 1 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Try asking</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} style={{
                    background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 20,
                    padding: "6px 14px", fontSize: 12, color: "var(--text-secondary)", cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-green)"; e.currentTarget.style.color = "var(--accent-green)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{ padding: "16px 24px 24px", borderTop: "1px solid var(--border)", background: "var(--bg-surface)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16, padding: "10px 14px", transition: "border-color 0.15s", boxShadow: "var(--shadow-sm)" }}
            onFocus={() => {}} >
            <svg width="16" height="16" fill="none" stroke="var(--accent-green)" strokeWidth={1.8} viewBox="0 0 24 24" style={{ flexShrink: 0, marginBottom: 4 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about your clients, follow-ups, documents..."
              rows={1}
              style={{
                flex: 1, border: "none", background: "transparent", resize: "none",
                fontSize: 13, color: "var(--text-primary)", outline: "none", lineHeight: 1.6,
                maxHeight: 120, overflowY: "auto", fontFamily: "Inter, sans-serif",
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              style={{
                width: 32, height: 32, borderRadius: 10, border: "none", flexShrink: 0,
                background: input.trim() && !loading ? "var(--accent-green)" : "var(--border)",
                color: "white", cursor: input.trim() && !loading ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              <svg width="14" height="14" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
            Powered by Google Gemini · Searches your real CS Hub data · Press Enter to send
          </div>
        </div>
      </div>
    </>
  );
}
