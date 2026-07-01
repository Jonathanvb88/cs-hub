"use client";
import { useState, useEffect } from "react";

import Header from "@/components/layout/Header";

interface ReportData {
  pipeline: { type: string; status: string; count: string; total_value: string }[];
  healthDistribution: { health_status: string; count: string }[];
  followUpStats: { status: string; count: string }[];
  quoteConversion: { status: string; count: string; total_value: string }[];
  projectStats: { status: string; count: string }[];
  topClients: { name: string; total_value: string; doc_count: string }[];
  totals: { total_clients: string; active_projects: string; pending_followups: string; won_value: string };
}

const healthColor: Record<string, string> = {
  active: "#15803d", steady: "#2563eb", quiet: "#b45309", at_risk: "#dc2626",
};
const healthLabel: Record<string, string> = {
  active: "Active", steady: "Steady", quiet: "Quiet", at_risk: "At Risk",
};
const statusColor: Record<string, string> = {
  draft: "#94a3b8", review: "#b45309", approved: "#2563eb", sent: "#7c3aed",
  accepted: "#15803d", rejected: "#dc2626", active: "#15803d", completed: "#2563eb",
  on_hold: "#b45309", cancelled: "#94a3b8", pending: "#b45309",
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/db/reports")
      .then(res => { if (!res.ok) throw new Error("Failed to load reports"); return res.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fmtCurrency = (val: string | number) => `R ${Number(val).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;

  const BarRow = ({ label, count, total, color }: { label: string; count: number; total: number; color: string }) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{count}</span>
        </div>
        <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 4 }}>
          <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: color, transition: "width 0.3s" }} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Header title="Reports" subtitle="Analytics across your client portfolio" />
        <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading reports...</div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header title="Reports" subtitle="Analytics across your client portfolio" />
        <div style={{ padding: 24 }}>
          <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "var(--accent-red)" }}>
            {error || "No data available"}
          </div>
        </div>
      </>
    );
  }

  const healthTotal = data.healthDistribution.reduce((s, h) => s + Number(h.count), 0);
  const followUpTotal = data.followUpStats.reduce((s, f) => s + Number(f.count), 0);
  const projectTotal = data.projectStats.reduce((s, p) => s + Number(p.count), 0);
  const quoteTotal = data.quoteConversion.reduce((s, q) => s + Number(q.count), 0);

  return (
    <>
      <Header title="Reports" subtitle="Analytics across your client portfolio — computed from live data" />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Top-level totals */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Total Clients", value: data.totals.total_clients, color: "var(--accent-green)" },
            { label: "Active Projects", value: data.totals.active_projects, color: "var(--accent-blue)" },
            { label: "Pending Follow-ups", value: data.totals.pending_followups, color: "var(--accent-amber)" },
            { label: "Won Value", value: fmtCurrency(data.totals.won_value), color: "var(--accent-green)" },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Health distribution */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Client Health Distribution</div>
            {data.healthDistribution.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No client data yet</div>
            ) : (
              data.healthDistribution.map(h => (
                <BarRow key={h.health_status} label={healthLabel[h.health_status] || h.health_status} count={Number(h.count)} total={healthTotal} color={healthColor[h.health_status] || "#94a3b8"} />
              ))
            )}
          </div>

          {/* Follow-up completion */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Follow-up Status</div>
            {data.followUpStats.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No follow-ups yet</div>
            ) : (
              data.followUpStats.map(f => (
                <BarRow key={f.status} label={f.status.charAt(0).toUpperCase() + f.status.slice(1)} count={Number(f.count)} total={followUpTotal} color={statusColor[f.status] || "#94a3b8"} />
              ))
            )}
          </div>

          {/* Project status */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Project Status</div>
            {data.projectStats.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No projects yet</div>
            ) : (
              data.projectStats.map(p => (
                <BarRow key={p.status} label={p.status.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())} count={Number(p.count)} total={projectTotal} color={statusColor[p.status] || "#94a3b8"} />
              ))
            )}
          </div>

          {/* Quote conversion */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Quote Conversion</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16 }}>By status and value</div>
            {data.quoteConversion.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No quotes yet</div>
            ) : (
              data.quoteConversion.map(q => (
                <div key={q.status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <span className="badge badge-gray" style={{ marginRight: 8 }}>{q.status}</span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{q.count} quote{Number(q.count) !== 1 ? "s" : ""}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-green)" }}>{fmtCurrency(q.total_value)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top clients by value */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            Top Clients by Document Value
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 100px 150px",
            padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)",
          }}>
            {["Client", "Documents", "Total Value"].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>
          {data.topClients.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No client data yet</div>
          ) : (
            data.topClients.map(c => (
              <div key={c.name} className="table-row" style={{ gridTemplateColumns: "2fr 100px 150px", alignItems: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.doc_count}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-green)" }}>{fmtCurrency(c.total_value)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

