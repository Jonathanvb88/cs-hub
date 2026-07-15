"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface ClientHealth {
  id: string;
  name: string;
  industry: string | null;
  healthScore: number;
  healthStatus: string;
  daysSinceLastContact: number | null;
  overdueFollowUps: number;
  pendingFollowUps: number;
  activeProjects: number;
  stalledProjects: number;
  recentDocuments: number;
}

const healthBadge: Record<string, string> = {
  active: "badge-green", steady: "badge-blue", quiet: "badge-amber", at_risk: "badge-red",
};
const healthLabel: Record<string, string> = {
  active: "Active", steady: "Steady", quiet: "Quiet", at_risk: "At Risk",
};
const healthColor: Record<string, string> = {
  active: "#15803d", steady: "#2563eb", quiet: "#b45309", at_risk: "#dc2626",
};

export default function HealthPage() {
  const [clients, setClients] = useState<ClientHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/db/health-calculate");
      if (!res.ok) throw new Error("Failed to calculate health scores");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHealth(); }, []);

  const counts = {
    active: clients.filter(c => c.healthStatus === "active").length,
    steady: clients.filter(c => c.healthStatus === "steady").length,
    quiet: clients.filter(c => c.healthStatus === "quiet").length,
    at_risk: clients.filter(c => c.healthStatus === "at_risk").length,
  };

  const getAIRecommendation = async (client: ClientHealth) => {
    if (recommendations[client.id]) return;
    setLoadingId(client.id);
    try {
      const system = `You are a Client Success Intelligence assistant. Based on customer engagement data, recommend a specific next action in ONE concise sentence (max 20 words). Be direct and actionable. South African business context.`;
      const user = `Client: ${client.name}. Health: ${client.healthStatus}. Score: ${client.healthScore}/100. Days since last contact: ${client.daysSinceLastContact ?? "never"}. Overdue follow-ups: ${client.overdueFollowUps}. Active projects: ${client.activeProjects}. Recommend one specific next action.`;
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, user, maxTokens: 60 }),
      });
      const data = await res.json();
      setRecommendations(p => ({ ...p, [client.id]: data.content?.trim() || "AI unavailable — check API key configuration." }));
    } catch {
      setRecommendations(p => ({ ...p, [client.id]: "AI unavailable right now." }));
    } finally {
      setLoadingId(null);
    }
  };

  const lastContactLabel = (days: number | null) => {
    if (days === null) return "No contact logged";
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <>
      <Header
        title="Customer Health"
        subtitle="Calculated live from real activity — communications, follow-ups, projects, documents"
        actions={
          <button className="btn-secondary" style={{ fontSize: 12 }} onClick={fetchHealth} disabled={loading}>
            {loading ? "Recalculating..." : "Recalculate Scores"}
          </button>
        }
      />
      <div className="page-content-pad" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

        {error && (
          <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "var(--accent-red)" }}>
            {error}
          </div>
        )}

        <div className="stat-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { key: "active", label: "Active", desc: "Strong recent engagement", color: "#15803d" },
            { key: "steady", label: "Steady", desc: "Healthy, regular contact", color: "#2563eb" },
            { key: "quiet", label: "Quiet", desc: "Engagement slowing down", color: "#b45309" },
            { key: "at_risk", label: "At Risk", desc: "Needs attention now", color: "#dc2626" },
          ].map(band => (
            <div key={band.key} className="card" style={{ borderLeft: `3px solid ${band.color}` }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: band.color, lineHeight: 1 }}>{counts[band.key as keyof typeof counts]}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>{band.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{band.desc}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>All Clients by Health Score</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "var(--accent-amber)", background: "#fffbeb", border: "1px solid #fde68a", padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>
                AI paused — API key required to enable recommendations
              </span>
            </div>
          </div>
          <div className="table-scroll-wrapper">
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 70px 140px 100px 130px 1fr 110px",
            padding: "10px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            minWidth: 760,
          }}>
            {["Client", "Score", "Health", "Status", "Last Contact", "AI Recommendation", ""].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 70px 140px 100px 130px 1fr 110px", padding: "13px 16px", borderBottom: "1px solid var(--border)", gap: 16, alignItems: "center", minWidth: 760 }}>
                  <div className="skeleton" style={{ height: 13, width: "60%" }} />
                  <div className="skeleton" style={{ height: 22, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 6, borderRadius: 3 }} />
                  <div className="skeleton" style={{ height: 20, borderRadius: 20 }} />
                  <div className="skeleton" style={{ height: 11 }} />
                  <div className="skeleton" style={{ height: 11, width: "70%" }} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <div className="skeleton" style={{ height: 28, width: 40, borderRadius: 8 }} />
                    <div className="skeleton" style={{ height: 28, width: 52, borderRadius: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="22" height="22" fill="none" stroke="var(--text-muted)" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="empty-state-title">No clients to score yet</div>
              <div className="empty-state-subtitle">Add clients first, then health scores will calculate automatically from their activity.</div>
            </div>
          ) : (
            clients.map(client => (
              <div key={client.id}>
                <div
                  className="table-row"
                  style={{ gridTemplateColumns: "2fr 70px 140px 100px 130px 1fr 110px", alignItems: "center", cursor: "pointer", minWidth: 760 }}
                  onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{client.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: healthColor[client.healthStatus] }}>{client.healthScore}</div>
                  <div>
                    <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 3, width: "90%", marginBottom: 3 }}>
                      <div style={{ height: "100%", borderRadius: 3, width: `${client.healthScore}%`, background: healthColor[client.healthStatus] }} />
                    </div>
                  </div>
                  <div><span className={`badge ${healthBadge[client.healthStatus]}`}>{healthLabel[client.healthStatus]}</span></div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{lastContactLabel(client.daysSinceLastContact)}</div>
                  <div style={{ fontSize: 12, paddingRight: 12 }} onClick={e => e.stopPropagation()}>
                    {loadingId === client.id ? (
                      <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Generating...</span>
                    ) : recommendations[client.id] ? (
                      <span style={{ color: "var(--text-secondary)" }}>{recommendations[client.id]}</span>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--accent-amber)", fontStyle: "italic" }}>
                        AI paused
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                    <Link href={`/clients/${client.id}`}>
                      <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 8px" }}>View</button>
                    </Link>
                    <Link href={`/clients/${client.id}/coach`}>
                      <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 8px" }}>Coach</button>
                    </Link>
                  </div>
                </div>

                {expandedId === client.id && (
                  <div style={{ padding: "14px 20px 18px 20px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                      Why this score — calculated from real activity
                    </div>
                    <div className="stat-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Last Contact</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{lastContactLabel(client.daysSinceLastContact)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Overdue Follow-ups</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: client.overdueFollowUps > 0 ? "var(--accent-red)" : "var(--text-primary)" }}>{client.overdueFollowUps}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Active Projects</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{client.activeProjects}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Stalled Projects</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: client.stalledProjects > 0 ? "var(--accent-amber)" : "var(--text-primary)" }}>{client.stalledProjects}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          </div>
        </div>
      </div>
    </>
  );
}




