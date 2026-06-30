"use client";
import { useState, useRef, useEffect } from "react";
import { useActiveClient } from "@/lib/clientContext";

interface DraftFollowUp {
  title: string;
  clientName: string;
  dueDate: string | null;
  priority: "high" | "medium" | "low";
}

interface DraftEmail {
  to: string;
  clientName: string;
  subject: string;
  body: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  draftFollowUp?: DraftFollowUp | null;
  draftEmail?: DraftEmail | null;
  saved?: boolean;
}

const SUGGESTIONS = [
  "How many clients are at risk?",
  "What follow-ups are due this week?",
  "Draft a follow-up for this client",
  "Draft an email checking in",
];

export default function AIAssistant() {
  const { activeClient } = useActiveClient();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;
    setInput("");
    setMessages(p => [...p, { role: "user", content: messageText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          activeClientId: activeClient?.id || null,
          activeClientName: activeClient?.name || null,
        }),
      });
      const data = await res.json();
      setMessages(p => [...p, {
        role: "assistant",
        content: data.message || "Sorry, I couldn't process that.",
        draftFollowUp: data.draftFollowUp || null,
        draftEmail: data.draftEmail || null,
      }]);
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "Something went wrong reaching the assistant. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const saveFollowUp = async (draft: DraftFollowUp, msgIndex: number) => {
    try {
      await fetch("/api/db/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          clientName: draft.clientName,
          dueDate: draft.dueDate,
          priority: draft.priority,
        }),
      });
      setMessages(p => p.map((m, i) => i === msgIndex ? { ...m, saved: true } : m));
    } catch {}
  };

  const copyEmail = (draft: DraftEmail) => {
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        className="ai-assistant-bubble"
        onClick={() => setOpen(p => !p)}
        style={{
          position: "fixed", bottom: 24, left: 24, zIndex: 70,
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--accent-green)", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 4px 16px rgba(21,128,61,0.35)",
          transition: "transform 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? (
          <svg width="22" height="22" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" fill="none" stroke="white" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="ai-assistant-panel" style={{
          position: "fixed", bottom: 88, left: 24, zIndex: 70,
          width: 380, maxHeight: "70vh",
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent-green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>CS Hub Assistant</div>
              {activeClient && <div style={{ fontSize: 11, color: "var(--accent-green)" }}>Context: {activeClient.name}</div>}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14, minHeight: 200 }}>
            {messages.length === 0 && (
              <div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, lineHeight: 1.6 }}>
                  Ask me about your clients, follow-ups, or projects — or ask me to draft a follow-up or email.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      style={{
                        textAlign: "left", padding: "8px 12px", borderRadius: 8,
                        background: "var(--bg-elevated)", border: "1px solid var(--border)",
                        fontSize: 12, color: "var(--text-secondary)", cursor: "pointer",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  background: m.role === "user" ? "var(--accent-green)" : "var(--bg-elevated)",
                  color: m.role === "user" ? "white" : "var(--text-primary)",
                  padding: "8px 12px", borderRadius: 12, fontSize: 13, lineHeight: 1.5,
                }}>
                  {m.content}
                </div>

                {/* Draft follow-up card */}
                {m.draftFollowUp && (
                  <div style={{
                    border: "1px solid var(--border)", borderRadius: 10, padding: 12,
                    background: "var(--accent-green-bg)", maxWidth: "90%",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-green-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                      Draft Follow-up
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{m.draftFollowUp.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
                      {m.draftFollowUp.clientName} · {m.draftFollowUp.priority} priority{m.draftFollowUp.dueDate ? ` · due ${m.draftFollowUp.dueDate}` : ""}
                    </div>
                    {m.saved ? (
                      <span className="badge badge-green">Saved to Follow-ups</span>
                    ) : (
                      <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => saveFollowUp(m.draftFollowUp!, i)}>
                        Save Follow-up
                      </button>
                    )}
                  </div>
                )}

                {/* Draft email card */}
                {m.draftEmail && (
                  <div style={{
                    border: "1px solid var(--border)", borderRadius: 10, padding: 12,
                    background: "var(--bg-elevated)", maxWidth: "90%",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-blue)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                      Draft Email — {m.draftEmail.clientName}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{m.draftEmail.subject}</div>
                    <div style={{
                      fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6,
                      whiteSpace: "pre-wrap", maxHeight: 160, overflowY: "auto",
                      background: "var(--bg-surface)", borderRadius: 8, padding: 10, marginBottom: 10,
                    }}>
                      {m.draftEmail.body}
                    </div>
                    <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => copyEmail(m.draftEmail!)}>
                      Copy Email
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: "flex-start", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth={2} style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <input
              className="input"
              placeholder="Ask or tell me what to draft..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              disabled={loading}
            />
            <button
              className="btn-primary"
              style={{ padding: "8px 12px", opacity: loading ? 0.6 : 1 }}
              onClick={() => send()}
              disabled={loading}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
