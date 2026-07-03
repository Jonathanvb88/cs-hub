"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { mockFollowUps, mockClients, getHealthBadgeClass, getHealthLabel } from "@/lib/mockData";

interface Communication {
  id: string;
  client_id: string | null;
  client_name: string;
  subject: string;
  body: string | null;
  received_at: string;
  action_required: boolean;
  action_status: string;
  type: string;
}

interface FollowUp {
  id: string;
  client_name: string;
  title: string;
  due_date: string | null;
  priority: string;
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [comms, setComms] = useState<Communication[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [clients, setClients] = useState<typeof mockClients>([]);
  const [loadingComms, setLoadingComms] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const today = new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    // Load real communications
    fetch("/api/db/communications")
      .then(r => r.json())
      .then(d => setComms(d.communications || []))
      .catch(() => setComms([]))
      .finally(() => setLoadingComms(false));

    // Load real follow-ups
    fetch("/api/db/followups")
      .then(r => r.json())
      .then(d => setFollowUps((d.followUps || []).filter((f: FollowUp) => f.status === "pending")))
      .catch(() => setFollowUps([]));

    // Load real clients for at-risk section
    fetch("/api/db/clients")
      .then(r => r.json())
      .then(d => setClients(d.clients || []))
      .catch(() => setClients(mockClients));
  }, []);

  const pendingComms = comms.filter(c => !dismissed.includes(c.id) && c.action_required && c.action_status === "pending");
  const atRiskClients = clients.filter((c: { health_status?: string; healthStatus?: string }) =>
    (c.health_status || c.healthStatus) === "at_risk" || (c.health_status || c.healthStatus) === "quiet"
  );

  const todayStr = new Date().toISOString().split("T")[0];
  const dueTodayFollowUps = followUps.filter(f => f.due_date === todayStr);
  const overdueFollowUps = followUps.filter(f => f.due_date && f.due_date < todayStr);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={today}
        actions={
          <Link href="/clients">
            <button className="btn-primary">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Client
            </button>
          </Link>
        }
      />

      <div className="page-content-pad" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Quick Stats — real data */}
        <div className="stat-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Active Clients", value: clients.length || mockClients.length, color: "var(--accent-blue)", href: "/clients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
            { label: "Comms to Action", value: pendingComms.length, color: "var(--accent-amber)", href: "/communications", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
            { label: "Follow-ups Due", value: followUps.length, color: "var(--accent-green)", href: "/followups", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
            { label: "At Risk / Quiet", value: atRiskClients.length, color: "var(--accent-red)", href: "/health", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
              <div className="stat-card" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", minHeight: 88 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: stat.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="18" height="18" fill="none" stroke={stat.color} strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.02em" }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{stat.label}</div>
                </div>
                <svg width="12" height="12" fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="two-col-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* Work Inbox — real Communications from DB */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Communications</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Logged emails and meeting notes</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {pendingComms.length > 0 && <span className="badge badge-amber">{pendingComms.length} action required</span>}
                <Link href="/communications" style={{ fontSize: 12, color: "var(--accent-green)", fontWeight: 500, textDecoration: "none" }}>View all →</Link>
              </div>
            </div>
            {loadingComms ? (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: "flex", gap: 10 }}>
                    <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 12, width: "55%", marginBottom: 6 }} />
                      <div className="skeleton" style={{ height: 13, width: "80%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : comms.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px 20px" }}>
                <div className="empty-state-icon">
                  <svg width="20" height="20" fill="none" stroke="var(--text-muted)" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="empty-state-title" style={{ fontSize: 13 }}>No communications logged yet</div>
                <div className="empty-state-subtitle">Log emails and meeting notes under Communications to see them here.</div>
                <Link href="/communications"><button className="btn-primary" style={{ fontSize: 12 }}>Log Communication</button></Link>
              </div>
            ) : (
              comms.slice(0, 4).map((comm) => (
                <div
                  key={comm.id}
                  style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  onClick={() => router.push("/communications")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    {comm.action_required && comm.action_status === "pending" && (
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-amber)", flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-blue)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{comm.client_name || "—"}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>{new Date(comm.received_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{comm.subject}</div>
                </div>
              ))
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Microsoft Graph — meetings pending */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Today&apos;s Meetings</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{today}</div>
              </div>
              <div style={{ padding: "20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" fill="none" stroke="var(--accent-amber)" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Microsoft 365 Calendar</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      Live calendar sync is pending admin consent approval. Once enabled, your Teams meetings and Outlook calendar will appear here automatically.
                    </div>
                    <Link href="/settings">
                      <button className="btn-secondary" style={{ fontSize: 11, marginTop: 10 }}>View Integration Status</button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow-ups — real data */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Follow-ups</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {followUps.length > 0 && <span className="badge badge-blue">{followUps.length}</span>}
                  <Link href="/followups" style={{ fontSize: 12, color: "var(--accent-green)", fontWeight: 500, textDecoration: "none" }}>View all →</Link>
                </div>
              </div>
              {followUps.length === 0 ? (
                <div style={{ padding: "16px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                  No pending follow-ups — all clear!
                </div>
              ) : (
                followUps.slice(0, 4).map((fu) => (
                  <div
                    key={fu.id}
                    style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    onClick={() => router.push("/followups")}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fu.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{fu.client_name}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: fu.due_date === todayStr ? "var(--accent-red)" : fu.due_date && fu.due_date < todayStr ? "var(--accent-amber)" : "var(--text-muted)", flexShrink: 0 }}>
                      {fu.due_date === todayStr ? "Today" : fu.due_date && fu.due_date < todayStr ? "Overdue" : fu.due_date ? new Date(fu.due_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }) : "No date"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* At Risk Clients — real data */}
        {atRiskClients.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="16" height="16" fill="none" stroke="var(--accent-red)" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Clients Needing Attention</div>
              </div>
              <Link href="/health" style={{ fontSize: 12, color: "var(--accent-green)", fontWeight: 500, textDecoration: "none" }}>View Health Dashboard →</Link>
            </div>
            <div className="three-col-layout" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
              {atRiskClients.slice(0, 3).map((client: Record<string, unknown>, i: number) => (
                <div
                  key={client.id as string}
                  style={{ padding: "16px 20px", borderRight: i < 2 ? "1px solid var(--border)" : "none", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{client.name as string}</span>
                    <span className={getHealthBadgeClass((client.health_status || client.healthStatus) as string)}>{getHealthLabel((client.health_status || client.healthStatus) as string)}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: "var(--bg-elevated)", marginBottom: 12 }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${client.health_score || client.healthScore}%`, background: (client.health_status || client.healthStatus) === "at_risk" ? "var(--accent-red)" : "var(--accent-amber)" }} />
                  </div>
                  <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                    <Link href={`/clients/${client.id}`}><button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Open Profile</button></Link>
                    <Link href="/intelligence/capture"><button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Draft Check-in</button></Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}


