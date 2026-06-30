"use client";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";

interface FollowUp {
  id: string;
  client_id: string | null;
  client_name: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "dismissed";
  ai_suggested: boolean;
}

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [saving, setSaving] = useState(false);

  const fetchFollowUps = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/db/followups");
      if (!res.ok) throw new Error("Failed to load follow-ups");
      const data = await res.json();
      setItems(data.followUps || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFollowUps(); }, []);

  const update = async (id: string, status: string) => {
    setItems(p => p.map(f => f.id === id ? { ...f, status: status as FollowUp["status"] } : f));
    try {
      await fetch("/api/db/followups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      fetchFollowUps();
    }
  };

  const filtered = items.filter(f => filter === "all" || f.status === filter);
  const priorityColor: Record<string, string> = { high: "var(--accent-red)", medium: "var(--accent-amber)", low: "var(--accent-green)" };
  const today = new Date().toISOString().split("T")[0];

  const addNew = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/db/followups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName: newClient || "—", title: newTitle, dueDate: newDue || null, priority: newPriority }),
      });
      if (!res.ok) throw new Error("Failed to save");
      await fetchFollowUps();
      setNewTitle(""); setNewClient(""); setNewDue(""); setNewPriority("medium"); setShowAdd(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save follow-up");
    } finally {
      setSaving(false);
    }
  };

  return (
          <Header
        title="Follow-ups"
        subtitle={`${items.filter(f => f.status === "pending").length} pending — saved to database`}
        actions={
          <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => setShowAdd(p => !p)}>
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Follow-up
          </button>
        }
      />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>

        {error && (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--accent-red)" }}>
            {error}
          </div>
        )}

        {showAdd && (
          <div className="card" style={{ border: "1px solid var(--accent-blue)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>New Follow-up</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Title</label>
                <input className="input" placeholder="What needs to be done?" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Client</label>
                <input className="input" placeholder="Client name" value={newClient} onChange={e => setNewClient(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Due Date</label>
                <input className="input" type="date" value={newDue} onChange={e => setNewDue(e.target.value)} min={today} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Priority</label>
                <select className="input" value={newPriority} onChange={e => setNewPriority(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" style={{ fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={addNew} disabled={saving}>
                {saving ? "Saving..." : "Save Follow-up"}
              </button>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 6 }}>
          {["pending", "completed", "dismissed", "all"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              border: "1px solid var(--border-light)", cursor: "pointer",
              background: filter === f ? "var(--accent-blue)" : "var(--bg-elevated)",
              color: filter === f ? "white" : "var(--text-secondary)",
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.8 }}>({items.filter(i => i.status === f).length})</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)", fontSize: 13 }}>Loading from database...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)", fontSize: 13 }}>
                No {filter} follow-ups{filter === "pending" ? " — add one above to test the database" : ""}
              </div>
            )}
            {filtered.map(f => {
              const isOverdue = f.status === "pending" && !!f.due_date && f.due_date < today;
              const isDueToday = f.due_date === today;
              return (
                <div key={f.id} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14, opacity: f.status !== "pending" ? 0.6 : 1 }}>
                  <button
                    onClick={() => update(f.id, f.status === "completed" ? "pending" : "completed")}
                    style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                      border: f.status === "completed" ? "none" : "2px solid var(--border-light)",
                      background: f.status === "completed" ? "var(--accent-green)" : "none",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {f.status === "completed" && <svg width="11" height="11" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </button>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: priorityColor[f.priority], flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", textDecoration: f.status === "completed" ? "line-through" : "none" }}>{f.title}</span>
                      {f.ai_suggested && <span style={{ fontSize: 10, color: "var(--accent-purple)", background: "rgba(139,92,246,0.1)", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>AI</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{f.client_name}</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isOverdue ? "var(--accent-red)" : isDueToday ? "var(--accent-amber)" : "var(--text-secondary)" }}>
                      {isOverdue ? "Overdue" : isDueToday ? "Today" : f.due_date ? new Date(f.due_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }) : "No date"}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "capitalize", marginTop: 2 }}>{f.priority}</div>
                  </div>
                  {f.status === "pending" && (
                    <button onClick={() => update(f.id, "dismissed")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>×</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}
