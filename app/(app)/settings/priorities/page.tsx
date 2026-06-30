"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface Priority {
  id: string;
  key: string;
  label: string;
  color: string;
  sort_order: number;
  is_default: boolean;
}

const PRESET_COLORS = ["#dc2626", "#b45309", "#15803d", "#2563eb", "#7c3aed", "#db2777", "#0891b2", "#94a3b8"];

export default function PrioritiesSettingsPage() {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[3]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editColor, setEditColor] = useState("");

  const fetchPriorities = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/db/priorities");
      if (!res.ok) throw new Error("Failed to load priorities");
      const data = await res.json();
      setPriorities(data.priorities || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPriorities(); }, []);

  const addPriority = async () => {
    if (!newLabel.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/db/priorities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel, color: newColor }),
      });
      if (!res.ok) throw new Error("Failed to add priority");
      await fetchPriorities();
      setNewLabel(""); setNewColor(PRESET_COLORS[3]); setShowAdd(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add priority");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: Priority) => {
    setEditingId(p.id); setEditLabel(p.label); setEditColor(p.color);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await fetch("/api/db/priorities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, label: editLabel, color: editColor }),
      });
      await fetchPriorities();
      setEditingId(null);
    } catch (e) {
      setError("Failed to save changes");
    }
  };

  const deletePriority = async (id: string) => {
    setError("");
    try {
      const res = await fetch(`/api/db/priorities?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to delete"); return; }
      await fetchPriorities();
    } catch {
      setError("Failed to delete priority");
    }
  };

  return (
    <>
      <Header
        title="Priority Categories"
        subtitle="Customize the priority labels used across Follow-ups and Projects"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/settings"><button className="btn-secondary" style={{ fontSize: 12 }}>Back to Settings</button></Link>
            <button className="btn-primary" onClick={() => setShowAdd(p => !p)}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Priority
            </button>
          </div>
        }
      />

      <div style={{ padding: 24, maxWidth: 700 }}>
        {error && (
          <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "var(--accent-red)", marginBottom: 16 }}>
            {error}
          </div>
        )}

        {showAdd && (
          <div className="card" style={{ border: "1px solid var(--accent-green)", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>New Priority Category</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Label</label>
                <input className="input" placeholder="e.g. Urgent, Strategic, Low Effort" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Color</label>
              <div style={{ display: "flex", gap: 8 }}>
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                      border: newColor === c ? "3px solid var(--text-primary)" : "1px solid var(--border)",
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" style={{ fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={addPriority} disabled={saving}>
                {saving ? "Saving..." : "Save Priority"}
              </button>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
          ) : (
            priorities.map(p => (
              <div key={p.id} style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 14 }}>
                {editingId === p.id ? (
                  <>
                    <div style={{ display: "flex", gap: 6 }}>
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          style={{
                            width: 20, height: 20, borderRadius: "50%", background: c, cursor: "pointer",
                            border: editColor === c ? "2px solid var(--text-primary)" : "1px solid var(--border)",
                          }}
                        />
                      ))}
                    </div>
                    <input className="input" style={{ flex: 1 }} value={editLabel} onChange={e => setEditLabel(e.target.value)} />
                    <button className="btn-primary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={saveEdit}>Save</button>
                    <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>{p.label}</span>
                    {p.is_default && <span className="badge badge-gray" style={{ fontSize: 10 }}>Default</span>}
                    <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => startEdit(p)}>Edit</button>
                    {!p.is_default && (
                      <button
                        onClick={() => deletePriority(p.id)}
                        style={{ background: "none", border: "none", color: "var(--accent-red)", fontSize: 11, cursor: "pointer" }}
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.6 }}>
          Default priorities (Critical, High, Medium, Low) can be relabeled and recolored but not deleted, since they're used as fallback values throughout the platform. Custom priorities you add here will appear as options on Follow-ups and Projects.
        </div>
      </div>
    </>
  );
}
