"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface Client {
  id: string;
  name: string;
  industry: string | null;
  health_status: string;
  contract_value: number | null;
  contract_start_date: string | null;
  renewal_date: string | null;
}

const healthColor: Record<string, string> = {
  active: "#15803d", steady: "#2563eb", quiet: "#b45309", at_risk: "#dc2626",
};

function urgency(renewalDate: string | null): { label: string; color: string; sortKey: number } {
  if (!renewalDate) return { label: "No renewal date set", color: "var(--text-muted)", sortKey: 999999 };
  const days = Math.floor((new Date(renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: `Overdue by ${Math.abs(days)}d`, color: "var(--accent-red)", sortKey: -100000 + days };
  if (days <= 30) return { label: `Renews in ${days}d`, color: "var(--accent-red)", sortKey: days };
  if (days <= 90) return { label: `Renews in ${days}d`, color: "var(--accent-amber)", sortKey: days };
  return { label: `Renews in ${days}d`, color: "var(--text-secondary)", sortKey: days };
}

export default function RenewalsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editRenewal, setEditRenewal] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/db/clients").then(r => r.json()).then(d => setClients(d.clients || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (c: Client) => {
    setEditingId(c.id);
    setEditValue(c.contract_value?.toString() || "");
    setEditStart(c.contract_start_date || "");
    setEditRenewal(c.renewal_date || "");
  };

  const save = async (id: string) => {
    setSaving(true);
    try {
      await fetch("/api/db/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          contractValue: editValue ? parseFloat(editValue) : null,
          contractStartDate: editStart || null,
          renewalDate: editRenewal || null,
        }),
      });
      load();
    } catch {}
    setSaving(false);
    setEditingId(null);
  };

  const sorted = [...clients].sort((a, b) => urgency(a.renewal_date).sortKey - urgency(b.renewal_date).sortKey);
  const totalContractValue = clients.reduce((s, c) => s + (Number(c.contract_value) || 0), 0);
  const dueWithin90 = clients.filter(c => c.renewal_date && urgency(c.renewal_date).sortKey <= 90).length;

  return (
    <>
      <Header title="Renewals" subtitle="Contract value and upcoming renewal dates across all clients" />

      <div style={{ padding: 24 }}>
        <div className="stat-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          <div className="stat-card card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Total Contract Value</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>R {totalContractValue.toLocaleString("en-ZA")}</div>
          </div>
          <div className="stat-card card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Due Within 90 Days</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: dueWithin90 > 0 ? "var(--accent-amber)" : "var(--text-primary)" }}>{dueWithin90}</div>
          </div>
          <div className="stat-card card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Clients Tracked</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{clients.length}</div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map(c => {
              const u = urgency(c.renewal_date);
              const isEditing = editingId === c.id;
              return (
                <div key={c.id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: healthColor[c.health_status] || "var(--text-muted)" }} />
                      <Link href={`/clients/${c.id}`} style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }}>{c.name}</Link>
                      {c.industry && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.industry}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {c.contract_value ? `R ${Number(c.contract_value).toLocaleString("en-ZA")}` : "No value set"}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: u.color }}>{u.label}</span>
                      {!isEditing && (
                        <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => startEdit(c)}>Edit</button>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Contract Value (ZAR)</label>
                        <input className="input" type="number" value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="0" />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Contract Start</label>
                        <input className="input" type="date" value={editStart} onChange={e => setEditStart(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Renewal Date</label>
                        <input className="input" type="date" value={editRenewal} onChange={e => setEditRenewal(e.target.value)} />
                      </div>
                      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
                        <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setEditingId(null)}>Cancel</button>
                        <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => save(c.id)} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
