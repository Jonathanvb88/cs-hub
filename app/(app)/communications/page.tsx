"use client";
import { useState } from "react";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";
import { mockCommunications } from "@/lib/mockDataSprint2";
import { mockClients } from "@/lib/mockData";

export default function CommunicationsPage() {
  const [selected, setSelected] = useState<string | null>(mockCommunications[0].id);
  const [newEmailOpen, setNewEmailOpen] = useState(false);
  const [emailText, setEmailText] = useState("");
  const [clientId, setClientId] = useState("");
  const [subject, setSubject] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [analysing, setAnalysing] = useState(false);

  const selectedComm = mockCommunications.find(c => c.id === selected);

  const typeIcon = (type: string) => type === "email"
    ? "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    : "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z";

  const handleAnalyse = () => {
    if (!emailText.trim()) return;
    setAnalysing(true);
    setTimeout(() => {
      setAiSummary("AI has detected this as a Feature Enhancement request. Priority: High. Client: " +
        (mockClients.find(c => c.id === clientId)?.name || "Unknown") +
        ". Requirements extracted — navigate to Intelligence to review and generate developer tickets.");
      setAnalysing(false);
    }, 1800);
  };

  return (
    <AppLayout>
      <Header
        title="Communications"
        subtitle="Emails and meeting notes"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setNewEmailOpen(true)}>Log Meeting Notes</button>
            <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => setNewEmailOpen(true)}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Email
            </button>
          </div>
        }
      />

      <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
        {/* List pane */}
        <div style={{ width: 340, borderRight: "1px solid var(--border)", overflowY: "auto", flexShrink: 0 }}>
          {mockCommunications.map(comm => (
            <div
              key={comm.id}
              onClick={() => setSelected(comm.id)}
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                background: selected === comm.id ? "var(--bg-elevated)" : "transparent",
                borderLeft: selected === comm.id ? "2px solid var(--accent-blue)" : "2px solid transparent",
                transition: "all 0.1s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  background: comm.type === "email" ? "rgba(59,130,246,0.12)" : "rgba(139,92,246,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="12" height="12" fill="none" stroke={comm.type === "email" ? "var(--accent-blue)" : "var(--accent-purple)"} strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={typeIcon(comm.type)} />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-blue)", marginBottom: 1 }}>{comm.clientName}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {new Date(comm.receivedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {comm.actionRequired && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-amber)", flexShrink: 0 }} />}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{comm.subject}</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{comm.body.split("\n")[0]}</div>
            </div>
          ))}
        </div>

        {/* Detail pane */}
        {selectedComm && !newEmailOpen && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{selectedComm.subject}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {selectedComm.clientName} · {selectedComm.sender} · {new Date(selectedComm.receivedAt).toLocaleString("en-ZA")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ fontSize: 12 }}>Reply</button>
                <button className="btn-primary" style={{ fontSize: 12 }}>Extract Requirements</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              <div style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7, maxWidth: 680, marginBottom: 24 }}>
                {selectedComm.body}
              </div>

              {selectedComm.aiSummary && (
                <div style={{
                  background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 10, padding: 16, maxWidth: 680,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-blue)", marginBottom: 6 }}>AI Summary</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{selectedComm.aiSummary}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* New email pane */}
        {newEmailOpen && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Log Email or Meeting Notes</div>
              <button onClick={() => setNewEmailOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Client</label>
                  <select className="input" value={clientId} onChange={e => setClientId(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                    <option value="">Select client...</option>
                    {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Subject</label>
                  <input className="input" placeholder="Email subject or meeting title" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Email body or meeting notes</label>
                <textarea
                  className="input"
                  rows={12}
                  style={{ resize: "vertical" }}
                  placeholder="Paste the email content or type meeting notes here..."
                  value={emailText}
                  onChange={e => setEmailText(e.target.value)}
                />
              </div>

              {aiSummary && (
                <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-blue)", marginBottom: 6 }}>AI Analysis</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{aiSummary}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn-primary" style={{ fontSize: 12 }}>Extract Requirements</button>
                    <button className="btn-secondary" style={{ fontSize: 12 }}>Save & Close</button>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-primary"
                  style={{ fontSize: 12 }}
                  onClick={handleAnalyse}
                  disabled={analysing || !emailText.trim()}
                >
                  {analysing ? "Analysing..." : "Analyse with AI"}
                </button>
                <button className="btn-secondary" style={{ fontSize: 12 }}>Save without Analysis</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
