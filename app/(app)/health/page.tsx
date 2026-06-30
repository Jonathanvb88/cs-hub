"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { mockClients, getHealthBadgeClass, getHealthLabel, getHealthColor } from "@/lib/mockData";

export default function HealthPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, string>>({});
  const sorted = [...mockClients].sort((a, b) => a.healthScore - b.healthScore);

  const counts = {
    active: mockClients.filter(c => c.healthStatus === "active").length,
    steady: mockClients.filter(c => c.healthStatus === "steady").length,
    quiet: mockClients.filter(c => c.healthStatus === "quiet").length,
    at_risk: mockClients.filter(c => c.healthStatus === "at_risk").length,
  };

  const getAIRecommendation = async (client: typeof mockClients[0]) => {
    if (recommendations[client.id]) return;
    setLoadingId(client.id);
    try {
      const system = `You are a Client Success Intelligence assistant. Based on customer engagement data, recommend a specific next action in ONE concise sentence (max 20 words). Be direct and actionable. South African business context.`;
      const user = `Client: ${client.name}. Health: ${client.healthStatus}. Score: ${client.healthScore}/100. Last contact: ${client.lastContact}. Active projects: ${client.activeProjects}. Recommend one specific next action.`;
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, user, maxTokens: 60 }),
      });
      const data = await res.json();
      setRecommendations(p => ({ ...p, [client.id]: data.content?.trim() || "Schedule a check-in call this week." }));
    } catch {
      setRecommendations(p => ({ ...p, [client.id]: "Schedule a check-in call this week." }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
          <Header title="Customer Health" subtitle="Monitor and improve engagement across all clients" />
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Summary bands */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { key: "active", label: "Active", desc: "Weekly engagement", color: "#10b981" },
            { key: "steady", label: "Steady", desc: "Monthly contact", color: "#3b82f6" },
            { key: "quiet", label: "Quiet", desc: "No meeting 45+ days", color: "#f59e0b" },
            { key: "at_risk", label: "At Risk", desc: "No contact 90+ days", color: "#ef4444" },
          ].map(band => (
            <div key={band.key} className="card" style={{ borderLeft: `3px solid ${band.color}` }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: band.color, lineHeight: 1 }}>{counts[band.key as keyof typeof counts]}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>{band.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{band.desc}</div>
            </div>
          ))}
        </div>

        {/* Client health table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>All Clients by Health Score</div>
            <button
              className="btn-secondary"
              style={{ fontSize: 12 }}
              onClick={() => sorted.forEach(c => !recommendations[c.id] && getAIRecommendation(c))}
            >
              Generate All AI Recommendations
            </button>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 80px 160px 100px 120px 1fr 120px",
            padding: "10px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-elevated)",
          }}>
            {["Client", "Score", "Health", "Status", "Last Contact", "AI Recommendation", ""].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>
          {sorted.map(client => (
            <div key={client.id} className="table-row" style={{
              gridTemplateColumns: "2fr 80px 160px 100px 120px 1fr 120px",
              alignItems: "center",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{client.name}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: getHealthColor(client.healthStatus) }}>{client.healthScore}</div>
              <div>
                <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 3, width: "90%", marginBottom: 3 }}>
                  <div style={{ height: "100%", borderRadius: 3, width: `${client.healthScore}%`, background: getHealthColor(client.healthStatus) }} />
                </div>
              </div>
              <div><span className={getHealthBadgeClass(client.healthStatus)}>{getHealthLabel(client.healthStatus)}</span></div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{client.lastContact}</div>
              <div style={{ fontSize: 12, paddingRight: 12 }}>
                {loadingId === client.id ? (
                  <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Generating...</span>
                ) : recommendations[client.id] ? (
                  <span style={{ color: "var(--text-secondary)" }}>{recommendations[client.id]}</span>
                ) : (
                  <button
                    onClick={() => getAIRecommendation(client)}
                    style={{ background: "none", border: "none", color: "var(--accent-blue)", fontSize: 12, cursor: "pointer", padding: 0 }}
                  >
                    Get AI recommendation
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Link href={`/clients/${client.id}`}>
                  <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 8px" }}>View</button>
                </Link>
                <Link href={`/clients/${client.id}/coach`}>
                  <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 8px" }}>Coach</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
