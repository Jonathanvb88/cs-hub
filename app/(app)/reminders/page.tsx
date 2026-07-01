"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { mockClients, getHealthColor } from "@/lib/mockData";

interface Milestone {
  clientId: string;
  clientName: string;
  type: "first_project" | "tenth_project" | "anniversary" | "large_project" | "quiet";
  title: string;
  description: string;
  actionLabel: string;
  color: string;
  draft?: string;
}

const mockMilestones: Milestone[] = [
  {
    clientId: "4",
    clientName: "Apex Bank Limited",
    type: "large_project",
    title: "5 Active Projects",
    description: "Apex Bank now has 5 projects running simultaneously — your highest engagement client.",
    actionLabel: "Send appreciation note",
    color: "var(--accent-green)",
    draft: "Hi Zanele,\n\nI just wanted to take a moment to say thank you for the continued trust you place in our team. With five active projects running concurrently, it's been a busy but incredibly rewarding partnership.\n\nWe're committed to delivering each one to the highest standard. Looking forward to our next catch-up.\n\nWarm regards,\nJonathan",
  },
  {
    clientId: "1",
    clientName: "ABC Retail Group",
    type: "anniversary",
    title: "4 Years as a Client",
    description: "ABC Retail Group has been a client since 2022. Four years of successful delivery.",
    actionLabel: "Send anniversary message",
    color: "var(--accent-blue)",
    draft: "Hi Sarah,\n\nI can hardly believe it has been four years since we first started working together. From the early loyalty programme builds to this year's Black Friday campaign planning, it has been a fantastic journey.\n\nThank you for your trust and partnership. Here's to many more years ahead.\n\nWarm regards,\nJonathan",
  },
  {
    clientId: "3",
    clientName: "FastFreight Logistics",
    type: "quiet",
    title: "34 Days Without Contact",
    description: "No meaningful interaction in over a month. Risk of disengagement is high.",
    actionLabel: "Draft re-engagement email",
    color: "var(--accent-red)",
    draft: "Hi Mike,\n\nI hope all is well at FastFreight. I realise it has been a while since we last connected and I wanted to reach out to see how things are going on your end.\n\nWe have some exciting new capabilities I would love to walk you through when you have 30 minutes. Would any time next week work for a quick call?\n\nLooking forward to reconnecting.\n\nWarm regards,\nJonathan",
  },
  {
    clientId: "5",
    clientName: "ConnectTel",
    type: "quiet",
    title: "No New Work in 3 Months",
    description: "The Self-Service Portal went live in Q2 but no new requests have come through since.",
    actionLabel: "Propose next phase",
    color: "var(--accent-amber)",
    draft: "Hi Lungelo,\n\nThe self-service portal has been live for a few months now and I wanted to check in on how it is performing for your users.\n\nWe have been thinking about some natural next steps — including the chat widget you mentioned earlier and a few performance improvements. Would you be open to a brief call to explore what Phase 2 could look like?\n\nLooking forward to hearing from you.\n\nWarm regards,\nJonathan",
  },
];

const smartReminders = [
  { clientId: "1", clientName: "ABC Retail Group", reminder: "Black Friday campaigns typically kick off in July. Now is the ideal time to send the SOW.", urgency: "high", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { clientId: "2", clientName: "MedPharm SA", reminder: "POPIA Compliance Module deployed last week. Follow up to confirm everything is running smoothly.", urgency: "medium", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { clientId: "4", clientName: "Apex Bank Limited", reminder: "Monthly steering committee is recurring. Prepare updated project status for all 5 active projects.", urgency: "high", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 002 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { clientId: "3", clientName: "FastFreight Logistics", reminder: "No contact in 34 days. Proactive outreach needed before this client disengages completely.", urgency: "critical", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
];

const urgencyColor: Record<string, string> = {
  critical: "var(--accent-red)",
  high: "var(--accent-amber)",
  medium: "var(--accent-blue)",
  low: "var(--accent-green)",
};

export default function RemindersPage() {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const activeMilestones = mockMilestones.filter(m => !dismissed.includes(m.clientId + m.type));
  const activeReminders = smartReminders.filter(r => !dismissed.includes(r.clientId + r.reminder));

  return (
    <>
          <Header
        title="Smart Reminders"
        subtitle="AI-detected milestones and proactive engagement prompts"
        actions={
          <span className="badge badge-red" style={{ fontSize: 12 }}>
            {activeMilestones.length + activeReminders.length} actions
          </span>
        }
      />

      <div style={{ padding: 24, display: "grid", gridTemplateColumns: selectedMilestone ? "1fr 400px" : "1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Sample data notice */}
          <div style={{ padding: "12px 16px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" fill="none" stroke="var(--accent-blue)" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontSize: 12, color: "var(--accent-blue)", fontWeight: 500 }}>
              Showing sample milestone data. In the live version, reminders are generated automatically from your real client activity.
            </span>
          </div>

          {/* Milestones */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>
              Client Milestones
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {activeMilestones.map(m => (
                <div key={m.clientId + m.type} className="card" style={{ borderLeft: `3px solid ${m.color}`, cursor: "pointer" }}
                  onClick={() => setSelectedMilestone(m === selectedMilestone ? null : m)}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: m.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
                        {m.clientName}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{m.title}</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setDismissed(p => [...p, m.clientId + m.type]); if (selectedMilestone === m) setSelectedMilestone(null); }}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1, flexShrink: 0 }}
                    >×</button>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>{m.description}</div>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 12 }}
                    onClick={e => { e.stopPropagation(); setSelectedMilestone(m); }}
                  >
                    {m.actionLabel}
                  </button>
                </div>
              ))}
              {activeMilestones.length === 0 && (
                <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                  <div className="empty-state-icon">
                    <svg width="22" height="22" fill="none" stroke="var(--text-muted)" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="empty-state-title">No active milestones</div>
                  <div className="empty-state-subtitle">Milestones are detected automatically from client anniversaries, project counts, and quiet periods.</div>
                </div>
              )}
            </div>
          </div>

          {/* Smart reminders */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>
              Smart Reminders
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeReminders.map(r => (
                <div key={r.clientId + r.reminder} className="card" style={{
                  padding: "14px 18px",
                  display: "flex", alignItems: "flex-start", gap: 14,
                  borderLeft: `3px solid ${urgencyColor[r.urgency]}`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: urgencyColor[r.urgency] + "18",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="16" height="16" fill="none" stroke={urgencyColor[r.urgency]} strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: urgencyColor[r.urgency], marginBottom: 3 }}>{r.clientName}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{r.reminder}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <Link href={`/clients/${r.clientId}`}>
                      <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 8px" }}>View</button>
                    </Link>
                    <button
                      onClick={() => setDismissed(p => [...p, r.clientId + r.reminder])}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}
                    >×</button>
                  </div>
                </div>
              ))}
              {activeReminders.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg width="22" height="22" fill="none" stroke="var(--text-muted)" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="empty-state-title">No active reminders</div>
                  <div className="empty-state-subtitle">All caught up. Reminders will appear here when clients need re-engagement.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Draft email panel */}
        {selectedMilestone && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card" style={{ background: selectedMilestone.color + "0a", border: `1px solid ${selectedMilestone.color}30` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: selectedMilestone.color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                {selectedMilestone.clientName}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{selectedMilestone.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{selectedMilestone.description}</div>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>AI-Drafted Email</div>
                <button
                  className="btn-secondary"
                  style={{ fontSize: 11, padding: "4px 10px" }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedMilestone.draft || "");
                    setCopied(true); setTimeout(() => setCopied(false), 2500);
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div style={{ padding: "16px 18px" }}>
                <textarea
                  className="input"
                  rows={14}
                  style={{ resize: "vertical", fontFamily: "inherit", fontSize: 13, lineHeight: 1.7 }}
                  defaultValue={selectedMilestone.draft}
                />
              </div>
              <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                <Link href="/communications"><button className="btn-primary" style={{ fontSize: 12 }}>Send via Outlook</button></Link>
                <Link href="/communications"><button className="btn-secondary" style={{ fontSize: 12 }}>Save as Draft</button></Link>
                <button
                  onClick={() => { setDismissed(p => [...p, selectedMilestone.clientId + selectedMilestone.type]); setSelectedMilestone(null); }}
                  style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}
                >
                  Dismiss milestone
                </button>
              </div>
            </div>

            {/* Client health snapshot */}
            {(() => {
              const client = mockClients.find(c => c.id === selectedMilestone.clientId);
              if (!client) return null;
              return (
                <div className="card">
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                    Client Snapshot
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Health Score", value: `${client.healthScore}/100` },
                      { label: "Last Contact", value: client.lastContact },
                      { label: "Active Projects", value: client.activeProjects },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{row.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: getHealthColor(client.healthStatus) }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Link href={`/clients/${client.id}`}>
                      <button className="btn-secondary" style={{ fontSize: 12, width: "100%", justifyContent: "center" }}>
                        Open Client Profile
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </>
  );
}




