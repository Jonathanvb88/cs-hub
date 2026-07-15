"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { getHealthBadgeClass, getHealthLabel, getHealthColor } from "@/lib/mockData";
import OneDriveFiles from "@/components/OneDriveFiles";

interface Contact {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  title?: string | null;
  isPrimary?: boolean;
}

interface ClientRecord {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  notes: string | null;
  health_score: number;
  health_status: string;
  client_since: string | null;
  clientSince: string | null;
  production_url: string | null;
  productionUrl: string | null;
  uat_url: string | null;
  uatUrl: string | null;
  activeProjects: number;
  lastContact: string | null;
  assignedCsm: string | null;
  contacts: {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
}[];
[key: string]: unknown;
}



interface ProjectRow { id: string; name: string; status: string; priority: string; target_date: string | null; client_id: string | null; }

function RealProjectsTab({ clientId }: { clientId: string }) {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`/api/db/projects?clientId=${clientId}`)
      .then(r => r.json())
      .then(d => setProjects((d.projects || []).filter((p: ProjectRow) => p.client_id === clientId)))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [clientId]);
  if (loading) return <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>{[1,2].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}</div>;
  if (projects.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon"><svg width="20" height="20" fill="none" stroke="var(--text-muted)" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
      <div className="empty-state-title">No projects yet</div>
      <div className="empty-state-subtitle">Create a project and link it to this client.</div>
      <Link href={`/projects?clientId=${clientId}`}><button className="btn-primary" style={{ fontSize: 12 }}>New Project</button></Link>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {projects.map(p => (
        <div key={p.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</span>
              <span className={`badge ${p.status === "active" ? "badge-green" : p.status === "completed" ? "badge-blue" : "badge-gray"}`}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
              <span className={`badge ${p.priority === "high" || p.priority === "critical" ? "badge-red" : p.priority === "medium" ? "badge-amber" : "badge-gray"}`}>{p.priority.charAt(0).toUpperCase() + p.priority.slice(1)}</span>
            </div>
            {p.target_date && <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Target: {new Date(p.target_date as string).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</div>}
          </div>
          <Link href={`/projects/${p.id}`}><button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Open</button></Link>
        </div>
      ))}
    </div>
  );
}

interface DocRow { id: string; title: string; type: string; version: string; status: string; total_value: number; client_id: string | null; created_at: string; }

function RealDocumentsTab({ clientId }: { clientId: string }) {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/db/documents")
      .then(r => r.json())
      .then(d => setDocs((d.documents || []).filter((doc: DocRow) => doc.client_id === clientId)))
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, [clientId]);
  if (loading) return <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>{[1,2].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />)}</div>;
  if (docs.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon"><svg width="20" height="20" fill="none" stroke="var(--text-muted)" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
      <div className="empty-state-title">No documents yet</div>
      <div className="empty-state-subtitle">Create a Quote, SOW, POC, or UAT Sign-off for this client.</div>
      <Link href="/documents"><button className="btn-primary" style={{ fontSize: 12 }}>Create Document</button></Link>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {docs.map(doc => (
        <div key={doc.id} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 18px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{doc.title}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{doc.type.toUpperCase()} · {doc.version} · {new Date(doc.created_at as string).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
          {doc.total_value > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-green)" }}>R {Number(doc.total_value).toLocaleString("en-ZA")}</span>}
          <span className={`badge ${doc.status === "accepted" ? "badge-green" : doc.status === "draft" ? "badge-gray" : "badge-amber"}`}>{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span>
          <Link href={`/documents/view?id=${doc.id}`}><button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>View</button></Link>
        </div>
      ))}
    </div>
  );
}

const TABS = ["Overview", "Contacts", "Timeline", "Projects", "Documents", "Conversations", "Files", "Health"];

export default function ClientProfilePage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [timelineEvents, setTimelineEvents] = useState<{ type: string; title: string; date: string; meta: string }[]>([]);
  const [showQuickFollowUp, setShowQuickFollowUp] = useState(false);
  const [quickFollowUpTitle, setQuickFollowUpTitle] = useState("");
  const [quickFollowUpDate, setQuickFollowUpDate] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const saveQuickFollowUp = async () => {
    if (!quickFollowUpTitle.trim()) return;
    setSavingFollowUp(true);
    try {
      await fetch("/api/db/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: id,
          clientName: (client?.name as string) || "",
          title: quickFollowUpTitle,
          dueDate: quickFollowUpDate || null,
          priority: "medium",
        }),
      });
      setQuickFollowUpTitle(""); setQuickFollowUpDate(""); setShowQuickFollowUp(false);
    } catch {}
    finally { setSavingFollowUp(false); }
  };
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [clientLoading, setClientLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch("/api/db/clients")
      .then(r => r.json())
      .then(d => {
        const found = (d.clients || []).find((c: Record<string, unknown>) => c.id === id);
        setClient(found || null);
      })
      .catch(() => setClient(null))
      .finally(() => setClientLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeTab === "Timeline" && id) {
      setTimelineLoading(true);
      fetch(`/api/db/timeline?clientId=${id}`)
        .then(res => res.json())
        .then(data => setTimelineEvents(data.events || []))
        .catch(() => setTimelineEvents([]))
        .finally(() => setTimelineLoading(false));
    }
  }, [activeTab, id]);

  if (clientLoading) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        Loading client...
      </div>
    );
  }

  if (!client) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
        Client not found. <Link href="/clients" style={{ color: "var(--accent-blue)" }}>Back to clients</Link>
      </div>
    );
  }


  return (
    <>
      <Header
        title={client.name}
        subtitle={client.industry || undefined}
        breadcrumbs={[{ label: "Clients", href: "/clients" }, { label: client.name }]}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {client.contacts?.[0]?.email ? (
              <a href={`mailto:${client.contacts[0].email}`}>
                <button className="btn-secondary">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </button>
              </a>
            ) : (
              <button className="btn-secondary" disabled title="No contact email on file for this client" style={{ opacity: 0.5, cursor: "not-allowed" }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </button>
            )}
            <Link href={`/projects?clientId=${id}`}>
              <button className="btn-primary">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </button>
            </Link>
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
            {client.name?.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{client.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Client since {client.client_since ? new Date(client.client_since).getFullYear() : "—"}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, flex: 1, flexWrap: "wrap" }}>
          {[
            { label: "Health", value: <span className={getHealthBadgeClass(client.health_status)}>{getHealthLabel(client.health_status)}</span> },
            { label: "Score", value: <span style={{ color: getHealthColor(client.health_status), fontWeight: 700 }}>{client.health_score}/100</span> },
            { label: "Active Projects", value: String(client.activeProjects || "—") },
            { label: "Last Contact", value: String(client.lastContact || "—") },
            { label: "Assigned CSM", value: String(client.assignedCsm || "—") },
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
                  {client.health_status === "at_risk" ? (
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {client.name} has had no meaningful contact in over 30 days and no active projects. This client is at risk of disengagement. Consider scheduling a check-in call this week.
                    </div>
                  ) : client.health_status === "quiet" ? (
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
                    { label: "Production", url: client.production_url, color: "var(--accent-green)" },
                    { label: "UAT", url: client.uat_url, color: "var(--accent-amber)" },
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
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{client.notes || undefined}</div>
              </div>

              {/* Recent communications */}
              <div className="card" style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 12 }}>
                  View all logged communications for this client
                </div>
                <Link href="/communications">
                  <button className="btn-secondary" style={{ fontSize: 12 }}>Open Communications</button>
                </Link>
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Health score */}
              <div className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Health Score</div>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  border: `6px solid ${getHealthColor(client.health_status)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 12px",
                }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: getHealthColor(client.health_status) }}>{client.health_score}</span>
                </div>
                <span className={getHealthBadgeClass(client.health_status)}>{getHealthLabel(client.health_status)}</span>
              </div>

              {/* Quick stats */}
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Quick Stats</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Active Projects", value: client.activeProjects },
                    { label: "Contacts", value: client.contacts.length },
                    { label: "Last Contact", value: client.lastContact },
                    { label: "Client Since", value: client.client_since ? new Date(client.client_since).toLocaleDateString("en-ZA", { month: "short", year: "numeric" }) : "—" },
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
                  <Link href={`/clients/${id}/conversations`}>
                    <button className="btn-secondary" style={{ justifyContent: "flex-start", fontSize: 12, width: "100%" }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Draft Follow-up Email
                    </button>
                  </Link>
                  <Link href={`/documents/sow/new`}>
                    <button className="btn-secondary" style={{ justifyContent: "flex-start", fontSize: 12, width: "100%" }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Create SOW
                    </button>
                  </Link>
                  <button
                    className="btn-secondary"
                    style={{ justifyContent: "flex-start", fontSize: 12 }}
                    onClick={() => setShowQuickFollowUp(p => !p)}
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Add Follow-up
                  </button>
                  {showQuickFollowUp && (
                    <div style={{ background: "var(--bg-elevated)", borderRadius: 8, padding: 12, border: "1px solid var(--border)" }}>
                      <input
                        className="input"
                        style={{ marginBottom: 8, fontSize: 12 }}
                        placeholder="Follow-up title..."
                        value={quickFollowUpTitle}
                        onChange={e => setQuickFollowUpTitle(e.target.value)}
                      />
                      <input className="input" type="date" style={{ marginBottom: 8, fontSize: 12 }} value={quickFollowUpDate} onChange={e => setQuickFollowUpDate(e.target.value)} />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn-primary" style={{ fontSize: 11 }} onClick={saveQuickFollowUp} disabled={savingFollowUp}>
                          {savingFollowUp ? "Saving..." : "Save"}
                        </button>
                        <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => setShowQuickFollowUp(false)}>Cancel</button>
                      </div>
                    </div>
                  )}
                  <Link href="/intelligence/capture">
                    <button className="btn-secondary" style={{ justifyContent: "flex-start", fontSize: 12, width: "100%" }}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Extract Requirements
                    </button>
                  </Link>
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
              {client.contacts.map((contact: Contact) => (
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
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{(contact as Contact).title || (contact as Contact).role || '—'}</div>
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
            {timelineLoading ? (
              <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 13 }}>Loading timeline...</div>
            ) : timelineEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)", fontSize: 13 }}>
                No activity recorded yet for this client. Communications, documents, follow-ups, and projects will appear here automatically.
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", left: 16, top: 0, bottom: 0,
                  width: 1, background: "var(--border)",
                }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {timelineEvents.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 20, paddingBottom: 24, position: "relative" }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "var(--bg-elevated)",
                        border: "2px solid var(--border-light)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, zIndex: 1,
                      }}>
                        <svg width="12" height="12" fill="none" stroke="var(--accent-green)" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={
                            item.type === "communication" ? "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" :
                            item.type === "document" ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" :
                            item.type === "project" ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" :
                            "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          } />
                        </svg>
                      </div>
                      <div className="card" style={{ flex: 1, padding: "12px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {new Date(item.date as string).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })} · {item.meta}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Projects" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <Link href={`/projects?clientId=${id}`}>
                <button className="btn-primary" style={{ fontSize: 12 }}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Project
                </button>
              </Link>
            </div>
            <RealProjectsTab clientId={id as string} />
          </div>
        )}

        {activeTab === "Documents" && (
          <RealDocumentsTab clientId={id as string} />
        )}

        {activeTab === "Conversations" && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ padding: 24, background: "var(--bg-elevated)", borderRadius: 12, border: "1px solid var(--border)", textAlign: "center" }}>
              <svg width="48" height="48" fill="none" stroke="var(--accent-green)" strokeWidth={1.5} viewBox="0 0 24 24" style={{ margin: "0 auto 12px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>WhatsApp, SMS & Other Conversations</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
                Paste raw conversations from any channel and convert them into formal email records with a full audit trail.
              </div>
              <Link href={`/clients/${id}/conversations`}>
                <button className="btn-primary">Open Conversation Capture</button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "Files" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: "14px 16px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, display: "flex", gap: 10, alignItems: "center" }}>
              <svg width="16" height="16" fill="none" stroke="var(--accent-blue)" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span style={{ fontSize: 12, color: "var(--accent-blue)", fontWeight: 500 }}>
                Showing OneDrive and SharePoint files matching this client name. Open any file directly or link it to this client record.
              </span>
            </div>
            <OneDriveFiles
              clientName={(client?.name as string) || ""}
              showSearch={true}
              onLinkFile={(file) => {
                // Save to knowledge assets linked to this client
                fetch("/api/db/knowledge", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    label: file.name,
                    type: "onedrive",
                    clientName: (client?.name as string) || "",
                    url: file.webUrl,
                    notes: `Linked from OneDrive — ${file.parentPath || ""}`,
                    tags: [file.extension || "file"],
                  }),
                });
                alert(`"${file.name}" linked to ${(client?.name as string) || "client"} in Knowledge Library`);
              }}
            />
          </div>
        )}

        {activeTab === "Health" && (
          <div style={{ maxWidth: 600 }}>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Health Score Breakdown</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Last email contact", value: client.lastContact, score: client.health_score > 70 ? 90 : 50, weight: "25%" },
                  { label: "Last meeting", value: "28 Jun 2026", score: client.health_score > 70 ? 85 : 40, weight: "25%" },
                  { label: "Active projects", value: String(client.activeProjects), score: client.activeProjects > 0 ? 80 : 0, weight: "20%" },
                  { label: "Overdue follow-ups", value: "0", score: 100, weight: "15%" },
                  { label: "Completed projects (90d)", value: client.health_score > 70 ? "2" : "0", score: client.health_score > 70 ? 80 : 20, weight: "15%" },
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
                {client.health_status === "at_risk"
                  ? "This client has been silent for over 30 days with no active work. Schedule a check-in call this week and consider sending a brief project showcase to re-engage interest."
                  : client.health_status === "quiet"
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
















