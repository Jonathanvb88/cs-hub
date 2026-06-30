"use client";
import { useState } from "react";
import Header from "@/components/layout/Header";
import { mockEmails, mockFollowUps, mockMeetings, mockClients, getHealthBadgeClass, getHealthLabel } from "@/lib/mockData";

export default function DashboardPage() {
  const [completedFollowUps, setCompletedFollowUps] = useState<string[]>([]);
  const [dismissedEmails, setDismissedEmails] = useState<string[]>([]);

  const pendingEmails = mockEmails.filter(e => !dismissedEmails.includes(e.id));
  const pendingFollowUps = mockFollowUps.filter(f => !completedFollowUps.includes(f.id));
  const atRiskClients = mockClients.filter(c => c.healthStatus === "at_risk" || c.healthStatus === "quiet");

  const today = new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
          <Header
        title="Dashboard"
        subtitle={today}
        actions={
          <button className="btn-primary">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Client
          </button>
        }
      />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Quick Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Active Clients", value: mockClients.length, color: "var(--accent-blue)", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
            { label: "Emails to Action", value: pendingEmails.length, color: "var(--accent-amber)", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
            { label: "Follow-ups Due", value: pendingFollowUps.length, color: "var(--accent-green)", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
            { label: "At Risk / Quiet", value: atRiskClients.length, color: "var(--accent-red)", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: stat.color + "18",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="20" height="20" fill="none" stroke={stat.color} strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Work Inbox */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Work Inbox</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Emails requiring your action</div>
              </div>
              <span className="badge badge-amber">{pendingEmails.length} pending</span>
            </div>
            <div>
              {pendingEmails.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  All clear — no emails require action
                </div>
              ) : (
                pendingEmails.map((email) => (
                  <div key={email.id} style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                            background: email.priority === "high" ? "var(--accent-red)" : email.priority === "medium" ? "var(--accent-amber)" : "var(--accent-green)",
                          }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {email.clientName}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto", flexShrink: 0 }}>{email.receivedAt}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>{email.subject}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email.preview}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Reply</button>
                      <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Extract Requirements</button>
                      <button
                        onClick={() => setDismissedEmails(p => [...p, email.id])}
                        style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", fontSize: 11, cursor: "pointer", padding: "4px 8px" }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Todays meetings */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Today&apos;s Meetings</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Monday, 29 June 2026</div>
              </div>
              {mockMeetings.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No meetings scheduled today</div>
              ) : (
                mockMeetings.map((meeting) => (
                  <div key={meeting.id} style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: "var(--accent-purple)" + "18",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <svg width="16" height="16" fill="none" stroke="var(--accent-purple)" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{meeting.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{meeting.clientName} · {meeting.time}</div>
                    </div>
                    <span className="badge badge-purple">{meeting.platform}</span>
                  </div>
                ))
              )}
            </div>

            {/* Follow-ups */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Follow-ups</div>
                <span className="badge badge-blue">{pendingFollowUps.length}</span>
              </div>
              {pendingFollowUps.map((fu) => (
                <div key={fu.id} style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <button
                    onClick={() => setCompletedFollowUps(p => [...p, fu.id])}
                    style={{
                      width: 18, height: 18, borderRadius: 4, border: "2px solid var(--border-light)",
                      background: "none", cursor: "pointer", flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fu.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{fu.clientName}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: fu.dueDate === "Today" ? "var(--accent-red)" : "var(--text-secondary)", fontWeight: fu.dueDate === "Today" ? 600 : 400 }}>{fu.dueDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* At Risk Clients */}
        {atRiskClients.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="16" height="16" fill="none" stroke="var(--accent-red)" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Clients Needing Attention</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
              {atRiskClients.map((client, i) => (
                <div key={client.id} style={{
                  padding: "16px 20px",
                  borderRight: i < atRiskClients.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{client.name}</span>
                    <span className={getHealthBadgeClass(client.healthStatus)}>{getHealthLabel(client.healthStatus)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
                    Last contact: {client.lastContact}
                  </div>
                  <div style={{
                    height: 4, borderRadius: 2,
                    background: "var(--bg-elevated)",
                    marginBottom: 12,
                  }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${client.healthScore}%`,
                      background: client.healthStatus === "at_risk" ? "var(--accent-red)" : "var(--accent-amber)",
                    }} />
                  </div>
                  <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>
                    Draft Check-in Email
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
