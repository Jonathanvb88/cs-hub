"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface Milestone {
  clientId: string; clientName: string; key: string
  title: string; description: string; actionLabel: string; color: string; draft: string;
}
interface Reminder {
  clientId: string; clientName: string; key: string; reminder: string; urgency: string;
}
interface ClientSnapshot {
  id: string; health_score: number; health_status: string;
}

const urgencyColor: Record<string, string> = {
  critical: "var(--accent-red)", high: "var(--accent-amber)", medium: "var(--accent-blue)", low: "var(--accent-green)",
};
const healthColor: Record<string, string> = {
  active: "#15803d", steady: "#2563eb", quiet: "#b45309", at_risk: "#dc2626",
};

export default function RemindersPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [clients, setClients] = useState<ClientSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () => {
    Promise.all([
      fetch("/api/db/milestones").then(r => r.json()),
      fetch("/api/db/clients").then(r => r.json()),
    ]).then(([m, c]) => {
      setMilestones(m.milestones || []);
      setReminders(m.reminders || []);
      setClients(c.clients || []);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const dismiss = async (clientId: string, key: string) => {
    setMilestones(p => p.filter(m => !(m.clientId === clientId && m.key === key)));
    setReminders(p => p.filter(r => !(r.clientId === clientId && r.key === key)));
    if (selectedMilestone?.clientId === clientId && selectedMilestone?.key === key) setSelectedMilestone(null);
    try {
      await fetch("/api/db/milestones", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, key }),
      });
    } catch {}
  };

  const selectedClient = selectedMilestone ? clients.find(c => c.id === selectedMilestone.clientId) : null;

  return (
    <>
      <Header
        title="Smart Reminders"
        subtitle="Real milestones and proactive engagement prompts, computed from your actual client data"
        actions={
          <span className="badge badge-red" style={{ fontSize: 12 }}>
            {milestones.length + reminders.length} actions
          </span>
        }
      />

      <div className="two-col-layout" style={{ padding: 24, display: "grid", gridTemplateColumns: selectedMilestone ? "1fr 400px" : "1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
          ) : (
            <>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Client Milestones</div>
                <div className="two-col-layout" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {milestones.map(m => (
                    <div key={m.clientId + m.key} className="card" style={{ borderLeft: `3px solid ${m.color}`, cursor: "pointer" }}
                      onClick={() => setSelectedMilestone(m === selectedMilestone ? null : m)}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 11, color: m.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{m.clientName}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{m.title}</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); dismiss(m.clientId, m.key); }}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1, flexShrink: 0 }}>×</button>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>{m.description}</div>
                      <button className="btn-secondary" style={{ fontSize: 12 }} onClick={e => { e.stopPropagation(); setSelectedMilestone(m); }}>{m.actionLabel}</button>
                    </div>
                  ))}
                  {milestones.length === 0 && (
                    <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                      <div className="empty-state-title">No active milestones</div>
                      <div className="empty-state-subtitle">Milestones are detected automatically from client anniversaries, project counts, and engagement levels.</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Smart Reminders</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {reminders.map(r => (
                    <div key={r.clientId + r.key} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14, borderLeft: `3px solid ${urgencyColor[r.urgency]}`, flexWrap: "wrap" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: urgencyColor[r.urgency] + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" fill="none" stroke={urgencyColor[r.urgency]} strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: urgencyColor[r.urgency], marginBottom: 3 }}>{r.clientName}</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{r.reminder}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <Link href={`/clients/${r.clientId}`}><button className="btn-secondary" style={{ fontSize: 11, padding: "4px 8px" }}>View</button></Link>
                        <button onClick={() => dismiss(r.clientId, r.key)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}>×</button>
                      </div>
                    </div>
                  ))}
                  {reminders.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-state-title">No active reminders</div>
                      <div className="empty-state-subtitle">All caught up. Reminders appear here when a client goes quiet or a renewal is approaching.</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {selectedMilestone && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card" style={{ background: selectedMilestone.color + "0a", border: `1px solid ${selectedMilestone.color}30` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: selectedMilestone.color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{selectedMilestone.clientName}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{selectedMilestone.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{selectedMilestone.description}</div>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Drafted Email</div>
                <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}
                  onClick={() => { navigator.clipboard.writeText(selectedMilestone.draft); setCopied(true); setTimeout(() => setCopied(false), 2500); }}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div style={{ padding: "16px 18px" }}>
                <textarea className="input" rows={14} style={{ resize: "vertical", fontFamily: "inherit", fontSize: 13, lineHeight: 1.7 }} defaultValue={selectedMilestone.draft} />
              </div>
              <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link href="/communications"><button className="btn-primary" style={{ fontSize: 12 }}>Send via Outlook</button></Link>
                <Link href="/communications"><button className="btn-secondary" style={{ fontSize: 12 }}>Save as Draft</button></Link>
                <button onClick={() => dismiss(selectedMilestone.clientId, selectedMilestone.key)}
                  style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>
                  Dismiss milestone
                </button>
              </div>
            </div>

            {selectedClient && (
              <div className="card">
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Client Snapshot</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Health Score</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: healthColor[selectedClient.health_status] }}>{selectedClient.health_score}/100</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Link href={`/clients/${selectedClient.id}`}>
                    <button className="btn-secondary" style={{ fontSize: 12, width: "100%", justifyContent: "center" }}>Open Client Profile</button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
