"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";
import { getHealthBadgeClass, getHealthLabel, getHealthColor } from "@/lib/mockData";
import { useActiveClient } from "@/lib/clientContext";

interface Client {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  health_score: number;
  health_status: string;
  contacts: { id: string; name: string }[];
}

export default function ClientsPage() {
  const { setActiveClient } = useActiveClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterHealth, setFilterHealth] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newWebsite, setNewWebsite] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/db/clients");
      if (!res.ok) throw new Error("Failed to load clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const addClient = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/db/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, industry: newIndustry, website: newWebsite }),
      });
      if (!res.ok) throw new Error("Failed to save client");
      await fetchClients();
      setNewName(""); setNewIndustry(""); setNewWebsite(""); setShowAdd(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.industry || "").toLowerCase().includes(search.toLowerCase());
    const matchHealth = filterHealth === "all" || c.health_status === filterHealth;
    return matchSearch && matchHealth;
  });

  return (
    <AppLayout>
      <Header
        title="Clients"
        subtitle={`${clients.length} clients — saved to database`}
        actions={
          <button className="btn-primary" onClick={() => setShowAdd(p => !p)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Client
          </button>
        }
      />

      <div style={{ padding: 24 }}>
        {error && (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--accent-red)", marginBottom: 16 }}>
            {error}
          </div>
        )}

        {showAdd && (
          <div className="card" style={{ border: "1px solid var(--accent-blue)", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>New Client</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Client Name</label>
                <input className="input" placeholder="e.g. ABC Retail Group" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Industry</label>
                <input className="input" placeholder="e.g. Retail" value={newIndustry} onChange={e => setNewIndustry(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Website</label>
                <input className="input" placeholder="https://..." value={newWebsite} onChange={e => setNewWebsite(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" style={{ fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={addClient} disabled={saving}>
                {saving ? "Saving..." : "Save Client"}
              </button>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
            <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input className="input" style={{ paddingLeft: 32 }} placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "active", "steady", "quiet", "at_risk"].map(f => (
              <button key={f} onClick={() => setFilterHealth(f)} style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                border: "1px solid var(--border-light)", cursor: "pointer",
                background: filterHealth === f ? "var(--accent-blue)" : "var(--bg-elevated)",
                color: filterHealth === f ? "white" : "var(--text-secondary)",
              }}>
                {f === "all" ? "All" : f === "at_risk" ? "At Risk" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)", fontSize: 13 }}>Loading from database...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>
              {clients.length === 0 ? "No clients yet — add your first client above" : "No clients match your filters"}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {filtered.map(client => (
              <div
                key={client.id}
                className="card"
                style={{ cursor: "pointer", position: "relative" }}
                onClick={() => setActiveClient({ id: client.id, name: client.name, industry: client.industry || undefined, health_score: client.health_score, health_status: client.health_status })}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); window.location.href = `/clients/${client.id}`; }}
                  style={{
                    position: "absolute", top: 12, right: 12,
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 600,
                    color: "var(--text-secondary)", cursor: "pointer", zIndex: 2,
                  }}
                >
                  Open →
                </button>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: "var(--bg-elevated)", border: "1px solid var(--border-light)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 700, color: "var(--accent-blue)", flexShrink: 0,
                      }}>
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{client.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{client.industry || "—"}</div>
                      </div>
                    </div>
                    <span className={getHealthBadgeClass(client.health_status)}>{getHealthLabel(client.health_status)}</span>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Health Score</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: getHealthColor(client.health_status) }}>{client.health_score}</span>
                    </div>
                    <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: 2 }}>
                      <div style={{ height: "100%", borderRadius: 2, width: `${client.health_score}%`, background: getHealthColor(client.health_status) }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    {client.contacts?.length || 0} contact{client.contacts?.length !== 1 ? "s" : ""}
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

