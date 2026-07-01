"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/Toast";

interface Communication {
  id: string;
  client_id: string | null;
  client_name: string;
  type: string;
  direction: string;
  subject: string;
  body: string | null;
  sender: string | null;
  received_at: string;
  action_required: boolean;
  action_status: string;
  ai_summary: string | null;
}

interface ClientOption {
  id: string;
  name: string;
}

export default function CommunicationsPage() {
  const [comms, setComms] = useState<Communication[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [type, setType] = useState("email");
  const [aiSummary, setAiSummary] = useState("");
  const [analysing, setAnalysing] = useState(false);

  const fetchComms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/db/communications");
      if (!res.ok) throw new Error("Failed to load communications");
      const data = await res.json();
      setComms(data.communications || []);
      if (data.communications?.length > 0 && !selected) setSelected(data.communications[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/db/clients");
      const data = await res.json();
      setClients((data.clients || []).map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
    } catch {}
  };

  useEffect(() => { fetchComms(); fetchClients(); }, []);

  const selectedComm = comms.find(c => c.id === selected);
  const selectedClientForNew = clients.find(c => c.id === selectedClientId);

  const typeIcon = (t: string) => t === "email"
    ? "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    : "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z";

  const handleAnalyse = async () => {
    if (!bodyText.trim()) return;
    setAnalysing(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: "You are a Business Analyst assistant. In 1-2 concise sentences, classify this customer communication and note its priority and main ask. South African business context.",
          user: `Client: ${selectedClientForNew?.name || "Unknown"}\nSubject: ${subject}\n\nContent:\n${bodyText}`,
          maxTokens: 150,
        }),
      });
      const data = await res.json();
      setAiSummary(data.content?.trim() || "");
    } catch {
      setAiSummary("AI analysis unavailable right now.");
    } finally {
      setAnalysing(false);
    }
  };

  const handleSave = async () => {
    if (!subject.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/db/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId || null,
          clientName: selectedClientForNew?.name || "",
          type, direction: "inbound", subject, body: bodyText,
          actionRequired: true, aiSummary: aiSummary || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      await fetchComms();
      setSelectedClientId(""); setSubject(""); setBodyText(""); setAiSummary(""); setNewOpen(false);
      showToast("Communication saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save communication");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header
        title="Communications"
        subtitle="Emails and meeting notes — saved to database"
        actions={
          <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => setNewOpen(true)}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Log Communication
          </button>
        }
      />

      <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
        <div style={{ width: 340, borderRight: "1px solid var(--border)", overflowY: "auto", flexShrink: 0 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10 }}>
                  <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 12, width: "55%", marginBottom: 6 }} />
                    <div className="skeleton" style={{ height: 13, width: "80%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : comms.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="22" height="22" fill="none" stroke="var(--text-muted)" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="empty-state-title">No communications logged yet</div>
              <div className="empty-state-subtitle">Log your first email or meeting note to start building the client history.</div>
              <button className="btn-primary" onClick={() => setNewOpen(true)}>Log Communication</button>
            </div>
          ) : (
            comms.map(comm => (
              <div
                key={comm.id}
                onClick={() => setSelected(comm.id)}
                style={{
                  padding: "14px 18px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                  background: selected === comm.id ? "var(--bg-elevated)" : "transparent",
                  borderLeft: selected === comm.id ? "2px solid var(--accent-blue)" : "2px solid transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: comm.type === "email" ? "rgba(59,130,246,0.12)" : "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" fill="none" stroke={comm.type === "email" ? "var(--accent-blue)" : "var(--accent-purple)"} strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={typeIcon(comm.type)} />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-blue)" }}>{comm.client_name || "—"}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(comm.received_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  {comm.action_required && comm.action_status === "pending" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-amber)", flexShrink: 0 }} />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{comm.subject}</div>
              </div>
            ))
          )}
        </div>

        {selectedComm && !newOpen && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{selectedComm.subject}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {selectedComm.client_name} · {selectedComm.sender || "—"} · {new Date(selectedComm.received_at).toLocaleString("en-ZA")}
                </div>
              </div>
              {selectedComm.client_id ? (
                <Link href={`/clients/${selectedComm.client_id}`}>
                  <button className="btn-secondary" style={{ fontSize: 11, whiteSpace: "nowrap" }}>View Client Profile</button>
                </Link>
              ) : (
                <span className="badge badge-gray" style={{ whiteSpace: "nowrap" }}>No client linked</span>
              )}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              <div style={{ whiteSpace: "pre-wrap", fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7, maxWidth: 680, marginBottom: 24 }}>
                {selectedComm.body || "No content recorded."}
              </div>
              {selectedComm.ai_summary && (
                <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: 16, maxWidth: 680 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-blue)", marginBottom: 6 }}>AI Summary</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{selectedComm.ai_summary}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {newOpen && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Log Email or Meeting Notes</div>
              <button onClick={() => setNewOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {error && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--accent-red)" }}>
                  {error}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Client</label>
                  <select className="input" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                    <option value="">Select a client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Type</label>
                  <select className="input" value={type} onChange={e => setType(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting Notes</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Subject</label>
                  <input className="input" placeholder="Subject or title" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Content</label>
                <textarea className="input" rows={12} style={{ resize: "vertical" }} placeholder="Paste the email content or type meeting notes here..." value={bodyText} onChange={e => setBodyText(e.target.value)} />
              </div>

              {aiSummary && (
                <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-blue)", marginBottom: 6 }}>AI Analysis</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{aiSummary}</div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ fontSize: 12, opacity: analysing ? 0.7 : 1 }} onClick={handleAnalyse} disabled={analysing || !bodyText.trim()}>
                  {analysing ? "Analysing..." : "Analyse with AI"}
                </button>
                <button className="btn-primary" style={{ fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving || !subject.trim()}>
                  {saving ? "Saving..." : "Save Communication"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

