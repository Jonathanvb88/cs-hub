"use client";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Link from "next/link";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  user_name: string;
  user_email: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const ACTION_COLORS: Record<string, { bg: string; color: string; icon: string }> = {
  created:  { bg: "#f0fdf4", color: "#15803d", icon: "M12 4v16m8-8H4" },
  updated:  { bg: "#eff6ff", color: "#2563eb", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  deleted:  { bg: "#fef2f2", color: "#dc2626", icon: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" },
  signed_in:{ bg: "#fdf4ff", color: "#7c3aed", icon: "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" },
  viewed:   { bg: "#f8fafc", color: "#64748b", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
  exported: { bg: "#fffbeb", color: "#d97706", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
  sent:     { bg: "#f0fdf4", color: "#15803d", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
};

const ENTITY_ICONS: Record<string, string> = {
  client: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  document: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  followup: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  communication: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  project: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  system: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

function getActionStyle(action: string) {
  const key = Object.keys(ACTION_COLORS).find(k => action.toLowerCase().includes(k));
  return ACTION_COLORS[key || "updated"] || ACTION_COLORS.updated;
}

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function groupByDate(logs: AuditLog[]) {
  const groups: Record<string, AuditLog[]> = {};
  logs.forEach(l => {
    const d = new Date(l.created_at).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    if (!groups[d]) groups[d] = [];
    groups[d].push(l);
  });
  return groups;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entity, setEntity] = useState("");
  const [days, setDays] = useState("30");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams({ days });
    if (search) params.set("search", search);
    if (entity) params.set("entity", entity);
    try {
      const r = await fetch(`/api/db/audit?${params}`);
      const d = await r.json();
      setLogs(d.logs || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [days, entity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const groups = groupByDate(logs);

  return (
    <>
      <Header
        title="Audit Log"
        subtitle="Complete record of all actions across CS Hub"
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select className="input" value={days} onChange={e => setDays(e.target.value)} style={{ fontSize: 12, width: "auto" }}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last 12 months</option>
            </select>
          </div>
        }
      />

      <div style={{ padding: 24, maxWidth: 860 }}>

        {/* Search + filter bar */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <svg width="15" height="15" fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="input"
              style={{ paddingLeft: 38 }}
              placeholder="Search actions, clients, users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input" value={entity} onChange={e => setEntity(e.target.value)} style={{ width: "auto", fontSize: 12 }}>
            <option value="">All types</option>
            <option value="client">Clients</option>
            <option value="document">Documents</option>
            <option value="followup">Follow-ups</option>
            <option value="communication">Communications</option>
            <option value="project">Projects</option>
            <option value="calendar">Calendar</option>
            <option value="system">System</option>
          </select>
          <button type="submit" className="btn-primary" style={{ fontSize: 12 }}>Search</button>
        </form>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Actions", value: logs.length },
            { label: "Clients", value: logs.filter(l => l.entity_type === "client").length },
            { label: "Documents", value: logs.filter(l => l.entity_type === "document").length },
            { label: "Today", value: logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 13, width: "40%", marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 11, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="22" height="22" fill="none" stroke="var(--text-muted)" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="empty-state-title">No audit records yet</div>
            <div className="empty-state-subtitle">Actions across CS Hub will be logged here automatically as you use the platform.</div>
          </div>
        ) : (
          Object.entries(groups).map(([date, items]) => (
            <div key={date} style={{ marginBottom: 28 }}>
              {/* Date header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", padding: "2px 12px", background: "var(--bg-elevated)", borderRadius: 20, border: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                  {date}
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>

              {/* Log entries */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
                {/* Vertical timeline line */}
                <div style={{ position: "absolute", left: 17, top: 18, bottom: 18, width: 2, background: "var(--border)", zIndex: 0 }} />

                {items.map((log, idx) => {
                  const style = getActionStyle(log.action);
                  const entityIcon = ENTITY_ICONS[log.entity_type] || ENTITY_ICONS.system;
                  const isExpanded = expanded === log.id;

                  return (
                    <div key={log.id} style={{ display: "flex", gap: 14, paddingBottom: 16, position: "relative", zIndex: 1 }}>
                      {/* Timeline dot */}
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: style.bg, border: `2px solid ${style.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 0 3px white",
                      }}>
                        <svg width="14" height="14" fill="none" stroke={style.color} strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={style.icon} />
                        </svg>
                      </div>

                      {/* Content */}
                      <div
                        style={{ flex: 1, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", cursor: log.details ? "pointer" : "default", transition: "box-shadow 0.15s" }}
                        onClick={() => log.details && setExpanded(isExpanded ? null : log.id)}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = "var(--shadow-sm)")}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {/* Entity type badge */}
                            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: 6 }}>
                              <svg width="10" height="10" fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d={entityIcon} />
                              </svg>
                              <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "capitalize", fontWeight: 600 }}>{log.entity_type}</span>
                            </div>
                            {/* Action */}
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>{log.action}</span>
                            {log.entity_name && (
                              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>— <span style={{ color: style.color, fontWeight: 500 }}>{log.entity_name}</span></span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatTime(log.created_at)}</span>
                            {log.details && (
                              <svg width="12" height="12" fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* User */}
                        <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--accent-green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "white" }}>
                            {log.user_name?.charAt(0) || "J"}
                          </div>
                          {log.user_name} · {new Date(log.created_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                        </div>

                        {/* Expanded details */}
                        {isExpanded && log.details && (
                          <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: 8, fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)", lineHeight: 1.6, wordBreak: "break-all" }}>
                            {JSON.stringify(log.details, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
