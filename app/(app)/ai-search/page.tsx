"use client";
import { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/Toast";

interface DraftFollowUp {
  title: string;
  clientName: string;
  dueDate: string | null;
  priority: string;
}
interface DraftEmail {
  to: string;
  clientName: string;
  subject: string;
  body: string;
}
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  draftFollowUp?: DraftFollowUp | null;
  draftEmail?: DraftEmail | null;
  draftStatus?: "pending" | "accepted" | "discarded";
}

const SUGGESTIONS = [
  "Which clients haven't been contacted in the last 30 days?",
  "Remind me to follow up with ABC Retail next Friday",
  "Draft a check-in email for a quiet client",
  "Which clients are at risk or quiet?",
  "What quotes are currently awaiting approval?",
  "Which projects are behind schedule?",
];

export default function AISearchPage() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi 👋 I'm your CS Hub assistant. Ask me anything about your clients, follow-ups, documents, projects or communications - and I can also draft a follow-up or an email for you to review and create with one click.\n\nTry something like *\"Remind me to follow up with X next week\"* or *\"Show me overdue follow-ups.\"*",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [activeClientId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/db/clients").then(r => r.json()).then(d => setClients(d.clients || [])).catch(() => {});
  }, []);

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
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, activeClientId }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.error ? "Something went wrong reaching the assistant. Try again in a moment." : (data.message || "I didn't quite catch that - could you rephrase?"),
        timestamp: new Date(),
        draftFollowUp: data.draftFollowUp || null,
        draftEmail: data.draftEmail || null,
        draftStatus: (data.draftFollowUp || data.draftEmail) ? "pending" : undefined,
      };
      setMessages(m => [...m, assistantMsg]);
    } catch {
      setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: "assistant", content: "Connection error. Please try again.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const acceptFollowUp = async (msgId: string, draft: DraftFollowUp) => {
    try {
      const matchedClient = clients.find(c => c.name.toLowerCase() === draft.clientName?.toLowerCase());
      const res = await fetch("/api/db/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: matchedClient?.id || null,
          clientName: draft.clientName,
          title: draft.title,
          dueDate: draft.dueDate,
          priority: draft.priority || "medium",
          aiSuggested: true,
        }),
      });
      if (!res.ok) throw new Error();
      showToast("Follow-up created", "success");
      setMessages(m => m.map(msg => msg.id === msgId ? { ...msg, draftStatus: "accepted" } : msg));
    } catch {
      showToast("Couldn't create the follow-up - try again", "error");
    }
  };

  const discardDraft = (msgId: string) => {
    setMessages(m => m.map(msg => msg.id === msgId ? { ...msg, draftStatus: "discarded" } : msg));
  };

  const copyEmail = (draft: DraftEmail) => {
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
    showToast("Email copied to clipboard", "success");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <>
      <Header title="AI Assistant" subtitle="Ask about your real data, or ask it to draft a follow-up or email" />

      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", overflow: "hidden" }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {messages.map(msg => (
            <div key={msg.id} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: msg.role === "user" ? "var(--accent-green)" : "linear-gradient(135deg, #1a1a2e, #16213e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "white",
                border: msg.role === "assistant" ? "2px solid rgba(21,128,61,0.3)" : "none",
              }}>
                {msg.role === "user" ? "You" : (
                  <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                )}
              </div>

              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{
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

                {msg.draftFollowUp && (
                  <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-green)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Draft Follow-up</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{msg.draftFollowUp.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {msg.draftFollowUp.clientName} {msg.draftFollowUp.dueDate ? `· Due ${new Date(msg.draftFollowUp.dueDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}` : ""} · {msg.draftFollowUp.priority} priority
                    </div>
                    {msg.draftStatus === "pending" && (
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button className="btn-primary" style={{ fontSize: 11 }} onClick={() => acceptFollowUp(msg.id, msg.draftFollowUp!)}>Create Follow-up</button>
                        <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => discardDraft(msg.id)}>Discard</button>
                      </div>
                    )}
                    {msg.draftStatus === "accepted" && <div style={{ fontSize: 11, color: "var(--accent-green)", marginTop: 8, fontWeight: 600 }}>✓ Created</div>}
                    {msg.draftStatus === "discarded" && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>Discarded</div>}
                  </div>
                )}

                {msg.draftEmail && (
                  <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-blue)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Draft Email</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{msg.draftEmail.subject}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>To: {msg.draftEmail.to || msg.draftEmail.clientName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "pre-wrap", padding: 10, background: "var(--bg-surface)", borderRadius: 8, marginBottom: 10, maxHeight: 160, overflowY: "auto" }}>
                      {msg.draftEmail.body}
                    </div>
                    {msg.draftStatus === "pending" && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-primary" style={{ fontSize: 11 }} onClick={() => { copyEmail(msg.draftEmail!); setMessages(m => m.map(mm => mm.id === msg.id ? { ...mm, draftStatus: "accepted" } : mm)); }}>Copy Email</button>
                        <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => discardDraft(msg.id)}>Discard</button>
                      </div>
                    )}
                    {msg.draftStatus === "accepted" && <div style={{ fontSize: 11, color: "var(--accent-green)", fontWeight: 600 }}>✓ Copied</div>}
                    {msg.draftStatus === "discarded" && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Discarded</div>}
                  </div>
                )}
              </div>
            </div>
          ))}

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
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16, padding: "10px 14px", boxShadow: "var(--shadow-sm)" }}>
            <svg width="16" height="16" fill="none" stroke="var(--accent-green)" strokeWidth={1.8} viewBox="0 0 24 24" style={{ flexShrink: 0, marginBottom: 4 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask a question, or ask me to draft a follow-up or email..."
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
            Reads your real CS Hub data and can draft real follow-ups and emails · Press Enter to send
          </div>
        </div>
      </div>
    </>
  );
}
