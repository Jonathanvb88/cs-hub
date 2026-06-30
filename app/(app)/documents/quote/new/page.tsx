"use client";
import { useState } from "react";
import Link from "next/link";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";
import { mockClients } from "@/lib/mockData";

interface LineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
}

const defaultItems: LineItem[] = [
  { id: "1", description: "Discovery & Requirements", qty: 1, unit: "project", rate: 15000 },
  { id: "2", description: "Development", qty: 1, unit: "project", rate: 45000 },
  { id: "3", description: "Testing & QA", qty: 1, unit: "project", rate: 10000 },
  { id: "4", description: "Deployment & Handover", qty: 1, unit: "project", rate: 5000 },
];

export default function NewQuotePage() {
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [includeVat, setIncludeVat] = useState(true);
  const [notes, setNotes] = useState("This quote is valid for 30 days from the date of issue. Work will commence upon written acceptance and receipt of deposit.");
  const [items, setItems] = useState<LineItem[]>(defaultItems);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const selectedClient = mockClients.find(c => c.id === clientId);

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const vat = includeVat ? subtotal * 0.15 : 0;
  const total = subtotal + vat;

  const addItem = () => setItems(p => [...p, { id: Date.now().toString(), description: "", qty: 1, unit: "project", rate: 0 }]);
  const removeItem = (id: string) => setItems(p => p.filter(i => i.id !== id));
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(p => p.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const fmt = (n: number) => `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleSaveQuote = async () => {
    setSaveError("");
    if (!title.trim()) { setSaveError("Please add a quote title before saving."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/db/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || null,
          type: "quote",
          title,
          version: "v1.0",
          status: "draft",
          contentJson: { items, notes, validUntil, includeVat },
          totalValue: total,
          currency: "ZAR",
          validUntil: validUntil || null,
          createdBy: "Jonathan",
        }),
      });
      if (!res.ok) throw new Error("Failed to save quote");
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save quote");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <Header
        title="New Quote"
        subtitle="Create a quote for a client"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/documents"><button className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button></Link>
            <button className="btn-secondary" style={{ fontSize: 12 }}>Preview PDF</button>
            <button className="btn-primary" style={{ fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={handleSaveQuote} disabled={saving}>
              {saving ? "Saving..." : "Save Quote"}
            </button>
          </div>
        }
      />

      {saveError && (
        <div style={{
          margin: "16px 24px 0", padding: "12px 16px",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 8, fontSize: 13, color: "var(--accent-red)",
        }}>
          {saveError}
        </div>
      )}

      {saved && (
        <div style={{
          margin: "16px 24px 0",
          padding: "12px 16px",
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 8,
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 13, color: "#10b981",
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quote saved to database. <a href="/documents" style={{ color: "#10b981", textDecoration: "underline" }}>View in Documents</a>
          <button onClick={() => setSaved(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#10b981", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>

        {/* Main form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Client & title */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Quote Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Client</label>
                <select
                  className="input"
                  value={clientId}
                  onChange={e => {
                    setClientId(e.target.value);
                    const c = mockClients.find(cl => cl.id === e.target.value);
                    if (c && !title) setTitle(`Quote — ${c.name}`);
                  }}
                  style={{ background: "var(--bg-elevated)" }}
                >
                  <option value="">Select a client...</option>
                  {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Quote Title</label>
                <input className="input" placeholder="e.g. Quote — Black Friday Campaign 2026" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Valid Until</label>
                <input className="input" type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Currency</label>
                <select className="input" style={{ background: "var(--bg-elevated)" }}>
                  <option>ZAR — South African Rand</option>
                  <option>USD — US Dollar</option>
                  <option>EUR — Euro</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Line Items</div>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={addItem}>+ Add Item</button>
            </div>

            {/* Header row */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 80px 100px 120px 130px 32px",
              padding: "8px 20px", background: "var(--bg-elevated)",
              borderBottom: "1px solid var(--border)",
            }}>
              {["Description", "Qty", "Unit", "Rate (ZAR)", "Amount", ""].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>

            {items.map((item, idx) => (
              <div key={item.id} style={{
                display: "grid", gridTemplateColumns: "1fr 80px 100px 120px 130px 32px",
                padding: "10px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", gap: 8,
              }}>
                <input
                  className="input"
                  style={{ padding: "6px 10px" }}
                  placeholder="Description"
                  value={item.description}
                  onChange={e => updateItem(item.id, "description", e.target.value)}
                />
                <input
                  className="input"
                  style={{ padding: "6px 10px" }}
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={e => updateItem(item.id, "qty", parseFloat(e.target.value) || 0)}
                />
                <input
                  className="input"
                  style={{ padding: "6px 10px" }}
                  value={item.unit}
                  onChange={e => updateItem(item.id, "unit", e.target.value)}
                />
                <input
                  className="input"
                  style={{ padding: "6px 10px" }}
                  type="number"
                  value={item.rate}
                  onChange={e => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                />
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", textAlign: "right" }}>
                  {fmt(item.qty * item.rate)}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}
                >×</button>
              </div>
            ))}

            {/* Totals */}
            <div style={{ padding: "16px 20px", background: "var(--bg-elevated)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 280, marginLeft: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{fmt(subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", cursor: "pointer" }}>
                    <input type="checkbox" checked={includeVat} onChange={e => setIncludeVat(e.target.checked)} />
                    VAT (15%)
                  </label>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{fmt(vat)}</span>
                </div>
                <hr className="divider" />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
                  <span style={{ color: "var(--text-primary)" }}>Total</span>
                  <span style={{ color: "var(--accent-green)" }}>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>Terms & Notes</div>
            <textarea
              className="input"
              rows={4}
              style={{ resize: "vertical" }}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Preview sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Client preview */}
          {selectedClient && (
            <div className="card">
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Bill To</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{selectedClient.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{selectedClient.industry}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{selectedClient.website}</div>
              {selectedClient.contacts[0] && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{selectedClient.contacts[0].name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{selectedClient.contacts[0].email}</div>
                </div>
              )}
            </div>
          )}

          {/* Quote summary */}
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Summary</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Line Items", value: items.length },
                { label: "Subtotal", value: fmt(subtotal) },
                { label: "VAT", value: fmt(vat) },
                { label: "Total", value: fmt(total) },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Save as Draft", "Send to Client", "Download PDF", "Download Word", "Duplicate Quote"].map(action => (
                <button key={action} className="btn-secondary" style={{ fontSize: 12, justifyContent: "flex-start" }}>
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

