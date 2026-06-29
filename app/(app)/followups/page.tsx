"use client";
import { useState } from "react";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";
import { mockFollowUpsFull } from "@/lib/mockDataSprint2";

type Status = "pending" | "completed" | "dismissed";

export default function FollowUpsPage() {
  const [items, setItems] = useState(mockFollowUpsFull);
  const [filter, setFilter] = useState("pending");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newPriority, setNewPriority] = useState("medium");

  const update = (id: string, status: Status) =>
    setItems(p => p.map(f => f.id === id ? { ...f, status } : f));

  const filtered = items.filter(f => filter === "all" || f.status === filter);

  const priorityColor: Record<string, string> = {
    high: "var(--accent-red)",
    medium: "var(--accent-amber)",
    low: "var(--accent-green)",
  };

  const today = new Date().toISOString().split("T")[0];

  const addNew = () => {
    if (!newTitle.trim()) return;
    setItems(p => [...p, {
      id: Date.now().toString(),
      clientId: "",
      clientName: newClient || "—",
      title: newTitle,
      description: "",
      dueDate: newDue,
      priority: newPriority as "high" | "medium" | "low",
      status: "pending",
      aiSuggested: false,
    }]);
    setNewTitle("");
    setNewClient("");
    setNewDue("");
    setNewPriority("medium");
    setShowAdd(false);
  };

  return (
    <AppLayout>
      <Header
        title="Follow-ups"
        subtitle={`${items.filter(f => f.status === "pending").length} pending`}
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

        {/* Add form */}
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
              <button className="btn-primary" style={{ fontSize: 12 }} onClick={addNew}>Save Follow-up</button>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {["pending", "completed", "dismissed", "all"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 500,
              border: "1px solid var(--border-light)", cursor: "pointer",
              background: filter === f ? "var(--accent-blue)" : "var(--bg-elevated)",
              color: filter === f ? "white" : "var(--text-secondary)",
              transition: "all 0.15s",
            }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== "all" && (
                <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.8 }}>
                  ({items.filter(i => i.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Follow-up list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)", fontSize: 13 }}>
              No {filter} follow-ups
            </div>
          )}
          {filtered.map(f => {
            const isOverdue = f.status === "pending" && f.dueDate < today;
            const isDueToday = f.dueDate === today;
            return (
              <div key={f.id} className="card" style={{
                padding: "14px 18px",
                display: "flex", alignItems: "flex-start", gap: 14,
                opacity: f.status !== "pending" ? 0.6 : 1,
              }}>
                {/* Checkbox */}
                <button
                  onClick={() => update(f.id, f.status === "completed" ? "pending" : "completed")}
                  style={{
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                    border: f.status === "completed" ? "none" : "2px solid var(--border-light)",
                    background: f.status === "completed" ? "var(--accent-green)" : "none",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {f.status === "completed" && (
                    <svg width="11" height="11" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Priority dot */}
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: priorityColor[f.priority], flexShrink: 0, marginTop: 5 }} />

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
                      textDecoration: f.status === "completed" ? "line-through" : "none",
                    }}>{f.title}</span>
                    {f.aiSuggested && (
                      <span style={{ fontSize: 10, color: "var(--accent-purple)", background: "rgba(139,92,246,0.1)", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>AI</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{f.clientName}</div>
                  {f.description && (
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{f.description}</div>
                  )}
                </div>

                {/* Due date */}
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600,
                    color: isOverdue ? "var(--accent-red)" : isDueToday ? "var(--accent-amber)" : "var(--text-secondary)",
                  }}>
                    {isOverdue ? "Overdue" : isDueToday ? "Today" : f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }) : "No date"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "capitalize", marginTop: 2 }}>{f.priority}</div>
                </div>

                {/* Actions */}
                {f.status === "pending" && (
                  <button
                    onClick={() => update(f.id, "dismissed")}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, flexShrink: 0, marginTop: 0 }}
                    title="Dismiss"
                  >×</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
