"use client";
import Link from "next/link";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";
import { mockClients, getHealthBadgeClass, getHealthLabel, getHealthColor } from "@/lib/mockData";

export default function HealthPage() {
  const sorted = [...mockClients].sort((a, b) => a.healthScore - b.healthScore);

  const counts = {
    active: mockClients.filter(c => c.healthStatus === "active").length,
    steady: mockClients.filter(c => c.healthStatus === "steady").length,
    quiet: mockClients.filter(c => c.healthStatus === "quiet").length,
    at_risk: mockClients.filter(c => c.healthStatus === "at_risk").length,
  };

  return (
    <AppLayout>
      <Header title="Customer Health" subtitle="Monitor engagement across all clients" />
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
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            All Clients by Health Score
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 120px 180px 120px 120px 1fr 120px",
            padding: "10px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-elevated)",
          }}>
            {["Client", "Score", "Health Bar", "Status", "Last Contact", "AI Recommendation", ""].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>
          {sorted.map(client => (
            <div key={client.id} className="table-row" style={{
              gridTemplateColumns: "2fr 120px 180px 120px 120px 1fr 120px",
              alignItems: "center",
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{client.name}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: getHealthColor(client.healthStatus) }}>{client.healthScore}</div>
              <div>
                <div style={{ height: 6, background: "var(--bg-elevated)", borderRadius: 3, width: "80%" }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    width: `${client.healthScore}%`,
                    background: getHealthColor(client.healthStatus),
                  }} />
                </div>
              </div>
              <div><span className={getHealthBadgeClass(client.healthStatus)}>{getHealthLabel(client.healthStatus)}</span></div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{client.lastContact}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", paddingRight: 16 }}>
                {client.healthStatus === "at_risk" ? "Schedule check-in call urgently" :
                 client.healthStatus === "quiet" ? "Send a proactive touchpoint" :
                 client.healthStatus === "steady" ? "Maintain regular contact" :
                 "Relationship healthy — consider upsell"}
              </div>
              <div>
                <Link href={`/clients/${client.id}`}>
                  <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>View</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
