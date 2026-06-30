"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { mockClients } from "@/lib/mockData";

const mockAssets = [
  { id: "a1", clientId: "1", clientName: "ABC Retail Group", type: "journey_url", label: "Black Friday Journey 2025", url: "https://journey.abcretail.co.za/bf2025", notes: "Full loyalty journey, tested and live", tags: ["black-friday", "loyalty"], createdAt: "2025-11-01" },
  { id: "a2", clientId: "1", clientName: "ABC Retail Group", type: "import_template", label: "Customer Import Template v3", url: "", notes: "Excel template, 12 columns, includes loyalty tier", tags: ["import", "excel"], createdAt: "2025-08-15" },
  { id: "a3", clientId: "1", clientName: "ABC Retail Group", type: "email_template", label: "Points Earned Notification", url: "", notes: "HTML email template, branded, mobile responsive", tags: ["email", "notifications"], createdAt: "2025-09-10" },
  { id: "a4", clientId: "1", clientName: "ABC Retail Group", type: "test_cases", label: "Black Friday Test Suite", url: "", notes: "100 test cases covering upload, notifications, redemption", tags: ["testing", "black-friday"], createdAt: "2025-10-20" },
  { id: "a5", clientId: "4", clientName: "Apex Bank Limited", type: "journey_url", label: "Digital Banking Dashboard v2", url: "https://digital.apexbank.co.za/dashboard", notes: "Production URL for v2 — v3 in development", tags: ["dashboard", "banking"], createdAt: "2025-12-01" },
  { id: "a6", clientId: "4", clientName: "Apex Bank Limited", type: "sow", label: "SOW — Mobile App Phase 1", url: "", notes: "Signed SOW, R280,000, delivered Q4 2025", tags: ["sow", "mobile"], createdAt: "2025-07-01" },
  { id: "a7", clientId: "2", clientName: "MedPharm SA", type: "sow", label: "SOW — POPIA Compliance Module", url: "", notes: "Signed and delivered. Client signed off June 2026.", tags: ["sow", "popia"], createdAt: "2026-04-10" },
  { id: "a8", clientId: "1", clientName: "ABC Retail Group", type: "lessons_learned", label: "Black Friday 2025 Retrospective", url: "", notes: "Key lesson: start bulk import testing 3 weeks earlier. Notification delays caused by queue backlog.", tags: ["lessons", "black-friday"], createdAt: "2025-12-10" },
];

const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
  journey_url: { label: "Journey URL", color: "var(--accent-blue)", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
  import_template: { label: "Import Template", color: "var(--accent-green)", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  email_template: { label: "Email Template", color: "var(--accent-purple)", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  test_cases: { label: "Test Cases", color: "var(--accent-amber)", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  sow: { label: "SOW", color: "var(--accent-blue)", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  lessons_learned: { label: "Lessons Learned", color: "var(--accent-red)", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
};

export default function KnowledgePage() {
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<typeof mockAssets[0] | null>(null);

  const filtered = mockAssets.filter(a => {
    const matchSearch = !search || a.label.toLowerCase().includes(search.toLowerCase()) ||
      a.notes.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t => t.includes(search.toLowerCase()));
    const matchClient = clientFilter === "all" || a.clientId === clientFilter;
    const matchType = typeFilter === "all" || a.type === typeFilter;
    return matchSearch && matchClient && matchType;
  });

  return (
          <Header
        title="Knowledge Library"
        subtitle="Reusable assets, templates, SOWs, and lessons learned across all clients"
        actions={
          <button className="btn-primary" style={{ fontSize: 12 }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Asset
          </button>
        }
      />

      <div style={{ padding: 24, display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Total Assets", value: mockAssets.length, color: "var(--accent-blue)" },
              { label: "Journey URLs", value: mockAssets.filter(a => a.type === "journey_url").length, color: "var(--accent-green)" },
              { label: "Templates", value: mockAssets.filter(a => a.type === "import_template" || a.type === "email_template").length, color: "var(--accent-purple)" },
              { label: "Lessons Learned", value: mockAssets.filter(a => a.type === "lessons_learned").length, color: "var(--accent-amber)" },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <svg width="13" height="13" fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24"
                style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input className="input" style={{ paddingLeft: 30 }} placeholder="Search assets, tags..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" style={{ background: "var(--bg-elevated)", width: 180 }} value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
              <option value="all">All Clients</option>
              {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="input" style={{ background: "var(--bg-elevated)", width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Asset grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {filtered.map(asset => {
              const cfg = typeConfig[asset.type] || { label: asset.type, color: "var(--accent-blue)", icon: "" };
              return (
                <div key={asset.id} className="card"
                  style={{ cursor: "pointer", borderColor: selected?.id === asset.id ? "var(--accent-blue)" : "var(--border)", transition: "border-color 0.15s" }}
                  onClick={() => setSelected(selected?.id === asset.id ? null : asset)}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="14" height="14" fill="none" stroke={cfg.color} strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={cfg.icon} />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{asset.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{asset.clientName}</div>
                    </div>
                    <span className="badge badge-gray" style={{ fontSize: 10, flexShrink: 0 }}>{cfg.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {asset.notes}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {asset.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 10, color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: 4 }}>#{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                No assets match your search
              </div>
            )}
          </div>
        </div>

        {/* Asset detail panel */}
        {selected && (() => {
          const cfg = typeConfig[selected.type] || { label: selected.type, color: "var(--accent-blue)", icon: "" };
          return (
    <>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card" style={{ borderTop: `3px solid ${cfg.color}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <span className="badge badge-gray" style={{ fontSize: 10, marginBottom: 8, display: "inline-block" }}>{cfg.label}</span>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{selected.label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{selected.clientName}</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}>×</button>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>{selected.notes}</div>
                {selected.url && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>URL</div>
                    <a href={selected.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--accent-blue)", textDecoration: "none", wordBreak: "break-all" }}>{selected.url}</a>
                  </div>
                )}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>Tags</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {selected.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, color: cfg.color, background: cfg.color + "12", padding: "3px 8px", borderRadius: 4 }}>#{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16 }}>
                  Added {new Date(selected.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selected.url && <button className="btn-primary" style={{ fontSize: 12, justifyContent: "flex-start" }}>Open URL</button>}
                  <button className="btn-secondary" style={{ fontSize: 12, justifyContent: "flex-start" }}>Reuse for New Project</button>
                  <button className="btn-secondary" style={{ fontSize: 12, justifyContent: "flex-start" }}>Edit Asset</button>
                  <Link href={`/clients/${selected.clientId}`}>
                    <button className="btn-secondary" style={{ fontSize: 12, justifyContent: "flex-start", width: "100%" }}>View Client Profile</button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
