"use client";
import { useState } from "react";
import Link from "next/link";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";
import { mockClients, getHealthBadgeClass, getHealthLabel, getHealthColor } from "@/lib/mockData";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [filterHealth, setFilterHealth] = useState("all");

  const filtered = mockClients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    const matchHealth = filterHealth === "all" || c.healthStatus === filterHealth;
    return matchSearch && matchHealth;
  });

  return (
    <AppLayout>
      <Header
        title="Clients"
        subtitle={`${mockClients.length} clients`}
        actions={
          <button className="btn-primary">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Client
          </button>
        }
      />

      <div style={{ padding: 24 }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
            <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="input"
              style={{ paddingLeft: 32 }}
              placeholder="Search clients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "active", "steady", "quiet", "at_risk"].map(f => (
              <button
                key={f}
                onClick={() => setFilterHealth(f)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  border: "1px solid var(--border-light)",
                  cursor: "pointer",
                  background: filterHealth === f ? "var(--accent-blue)" : "var(--bg-elevated)",
                  color: filterHealth === f ? "white" : "var(--text-secondary)",
                  transition: "all 0.15s",
                }}
              >
                {f === "all" ? "All" : f === "at_risk" ? "At Risk" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Client Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filtered.map(client => (
            <Link key={client.id} href={`/clients/${client.id}`} style={{ textDecoration: "none" }}>
              <div className="card" style={{ cursor: "pointer", transition: "border-color 0.15s", borderColor: "var(--border)" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-light)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-light)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 700, color: "var(--accent-blue)",
                      flexShrink: 0,
                    }}>
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{client.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{client.industry}</div>
                    </div>
                  </div>
                  <span className={getHealthBadgeClass(client.healthStatus)}>{getHealthLabel(client.healthStatus)}</span>
                </div>

                {/* Health bar */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Health Score</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: getHealthColor(client.healthStatus) }}>{client.healthScore}</span>
                  </div>
                  <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: 2 }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${client.healthScore}%`,
                      background: getHealthColor(client.healthStatus),
                      transition: "width 0.3s",
                    }} />
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{client.activeProjects}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Projects</div>
                  </div>
                  <div style={{ textAlign: "center", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{client.contacts.length}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Contacts</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{client.lastContact}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Last contact</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>No clients match your filters</div>
            <button className="btn-secondary" onClick={() => { setSearch(""); setFilterHealth("all"); }}>Clear filters</button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
