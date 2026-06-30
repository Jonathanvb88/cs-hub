"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { mockClients, mockProjects, mockTimeline, mockEmails, getHealthBadgeClass, getHealthLabel, getHealthColor } from "@/lib/mockData";

const TABS = ["Overview", "Contacts", "Timeline", "Projects", "Documents", "Health"];

export default function ClientProfilePage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const client = mockClients.find(c => c.id === id);

  if (!client) {
    return (
              <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
          Client not found. <Link href="/clients" style={{ color: "var(--accent-blue)" }}>Back to clients</Link>
        </div>
    );
  }

  const clientProjects = mockProjects.filter(p => p.clientId === id);
  const clientEmails = mockEmails.filter(e => e.clientId === id);

  return (
    <>
      <Header
        title={client.name}
        subtitle={client.industry}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </button>
            <button className="btn-primary">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>
        }
      />

      {/* Client summary bar */}
      <div style={{
        padding: "16px 24px",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, color: "var(--accent-blue)",
          }}>
            {client.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{client.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Client since {new Date(client.clientSince).getFullYear()}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, flex: 1, flexWrap: "wrap" }}>
          {[
            { label: "Health", value: <span className={getHealthBadgeClass(client.healthStatus)}>{getHealthLabel(client.healthStatus)}</span> },
            { label: "Score", value: <span style={{ color: getHealthColor(client.healthStatus), fontWeight: 700 }}>{client.healthScore}/100</span> },
            { label: "Active Projects", value: client.activeProjects },
            { label: "Last Contact", value: client.lastContact },
            { label: "Assigned CSM", value: client.assignedCsm },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0,
        padding: "0 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-base)",
        overflowX: "auto",
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-btn${activeTab === tab ? " active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: 24 }}>
        {activeTab === "Overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* AI Insight */}
              <div style={{
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: 12, padding: 16,
                display: "flex", gap: 12,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(59,130,246,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" fill="none" stroke="var(--accent-blue)" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-blue)", marginBottom: 4 }}>AI Insight</div>
                  {client.healthStatus === "at_risk" ? (
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {client.name} has had no meaningful contact in over 30 days and no active projects. This client is at risk of disengagement. Consider scheduling a check-in call this week.
                    </div>
                  ) : client.healthStatus === "quiet" ? (
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      Engagement has dropped over the past 18 days. No new requests have come through. A proactive reach-out is recommended before the relationship goes cold.
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {client.name} is an actively engaged client with {client.activeProjects} ongoing project{client.activeProjects !== 1 ? "s" : ""}. Last contact was {client.lastContact}. Relationship is healthy.
                    </div>
                  )}
                </div>
              </div>

              {/* URLs */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Environment URLs</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Production", url: client.productionUrl, color: "var(--accent-green)" },
                    { label: "UAT", url: client.uatUrl, color: "var(--accent-amber)" },
                    { label: "Website", url: client.website, color: "var(--accent-blue)" },
                  ].map(env => (
                    <div key={env.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: env.color, width: 72, flexShrink: 0 }}>{env.label}</span>
                      {env.url ? (
                        <a href={env.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--text-secondary)", textDecoration: "none", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-blue)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                        >{env.url}</a>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Not set</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>Notes</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{client.notes}</div>
              </div>

              {/* Recent emails */}
              {clientEmails.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    Recent Emails
                  </div>
                  {clientEmails.map(email => (
                    <div key={email.id} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>{email.subject}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{email.from} · {email.receivedAt}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Health score */}
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Health Score</div>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  border: `6px solid ${getHealthColor(client.healthStatus)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px",
                }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: getHealthColor(client.healthStatus) }}>{client.healthScore}</span>
                </div>
                <span className={getHealthBadgeClass(client.healthStatus)}>{getHealthLabel(client.healthStatus)}</span>
              </div>

              {/* Quick stats */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Quick Stats</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Active Projects", value: client.activeProjects },
                    { label: "Contacts", value: client.contacts.length },
                    { label: "Last Contact", value: client.lastContact },
                    { label: "Client Since", value: new Date(client.clientSince).toLocaleDateString("en-ZA", { month: "short", year: "numeric" }) },
                  ].map(stat => (
                    <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{stat.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Quick Actions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Draft Follow-up Email", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                    { label: "Create SOW", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                    { label: "Add Follow-up", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
                    { label: "Extract Requirements", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
                  ].map(action => (
                    <button key={action.label} className="btn-secondary" style={{ justifyContent: "flex-start", fontSize: 12 }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                      </svg>
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Contacts" && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button className="btn-primary" style={{ fontSize: 12 }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Contact
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {client.contacts.map(contact => (
                <div key={contact.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-light)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, color: "var(--accent-blue)",
                    flexShrink: 0,
                  }}>
                    {contact.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{contact.name}</span>
                      {contact.isPrimary && <span className="badge badge-blue">Primary</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{contact.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{contact.email}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Email</button>
                    <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Timeline" && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", left: 16, top: 0, bottom: 0,
                width: 1, background: "var(--border)",
              }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {mockTimeline.map((item, i) => (
                  <div key={item.id} style={{ display: "flex", gap: 20, paddingBottom: 24, position: "relative" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "var(--bg-elevated)",
                      border: "2px solid var(--border-light)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, zIndex: 1,
                    }}>
                      <svg width="12" height="12" fill="none" stroke="var(--accent-blue)" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={
                          item.type === "email" ? "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" :
                          item.type === "meeting" ? "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" :
                          item.type === "document" ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" :
                          "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        } />
                      </svg>
                    </div>
                    <div className="card" style={{ flex: 1, padding: "12px 16px" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Projects" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button className="btn-primary" style={{ fontSize: 12 }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </button>
            </div>
            {clientProjects.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>No projects yet</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {clientProjects.map(project => (
                  <div key={project.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{project.name}</span>
                        <span className={`badge ${project.status === "active" ? "badge-green" : project.status === "completed" ? "badge-blue" : "badge-gray"}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                        <span className={`badge ${project.priority === "high" ? "badge-red" : project.priority === "medium" ? "badge-amber" : "badge-gray"}`}>
                          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        Target: {new Date(project.targetDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Open</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Documents" && (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
            <svg width="40" height="40" fill="none" stroke="var(--text-muted)" strokeWidth={1.5} viewBox="0 0 24 24" style={{ margin: "0 auto 12px", display: "block" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div style={{ fontSize: 14, marginBottom: 8 }}>No documents yet</div>
            <div style={{ fontSize: 12, marginBottom: 16 }}>Create a Quote, SOW, or POC for this client</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button className="btn-secondary" style={{ fontSize: 12 }}>New Quote</button>
              <button className="btn-secondary" style={{ fontSize: 12 }}>New SOW</button>
              <button className="btn-secondary" style={{ fontSize: 12 }}>New POC</button>
            </div>
          </div>
        )}

        {activeTab === "Health" && (
          <div style={{ maxWidth: 600 }}>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Health Score Breakdown</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Last email contact", value: client.lastContact, score: client.healthScore > 70 ? 90 : 50, weight: "25%" },
                  { label: "Last meeting", value: "28 Jun 2026", score: client.healthScore > 70 ? 85 : 40, weight: "25%" },
                  { label: "Active projects", value: String(client.activeProjects), score: client.activeProjects > 0 ? 80 : 0, weight: "20%" },
                  { label: "Overdue follow-ups", value: "0", score: 100, weight: "15%" },
                  { label: "Completed projects (90d)", value: client.healthScore > 70 ? "2" : "0", score: client.healthScore > 70 ? 80 : 20, weight: "15%" },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{row.label}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{row.value} · weight {row.weight}</span>
                    </div>
                    <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: 2 }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        width: `${row.score}%`,
                        background: row.score > 70 ? "var(--accent-green)" : row.score > 40 ? "var(--accent-amber)" : "var(--accent-red)",
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-blue)", marginBottom: 8 }}>AI Recommendation</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {client.healthStatus === "at_risk"
                  ? "This client has been silent for over 30 days with no active work. Schedule a check-in call this week and consider sending a brief project showcase to re-engage interest."
                  : client.healthStatus === "quiet"
                  ? "Engagement has cooled over the past few weeks. A proactive touchpoint — a short email or a Teams message — would be enough to maintain the relationship score."
                  : "This client is healthy and engaged. Continue regular communication and consider proposing the next phase of work to maintain momentum."}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
