"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface Project {
  id: string;
  client_id: string | null;
  client_name: string | null;
  name: string;
  status: string;
  type: string;
  priority: string;
  target_date: string | null;
  created_at: string;
  assigned_user_id: string | null;
  assigned_user_name: string | null;
}

interface TeamMember {
  id: string;
  name: string;
}

const statusColor: Record<string, string> = {
  active: "badge-green",
  completed: "badge-blue",
  on_hold: "badge-amber",
  cancelled: "badge-gray",
  draft: "badge-gray",
};

const priorityColor: Record<string, string> = {
  critical: "badge-red",
  high: "badge-red",
  medium: "badge-amber",
  low: "badge-gray",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("new_build");
  const [newPriority, setNewPriority] = useState("medium");
  const [newTargetDate, setNewTargetDate] = useState("");
  const [newAssignedUserId, setNewAssignedUserId] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/db/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/db/users");
      const data = await res.json();
      setTeam(data.users || []);
    } catch {}
  };

  useEffect(() => { fetchProjects(); fetchTeam(); }, []);

  const addProject = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/db/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, type: newType, priority: newPriority, targetDate: newTargetDate || null, assignedUserId: newAssignedUserId || null }),
      });
      if (!res.ok) throw new Error("Failed to save project");
      await fetchProjects();
      setNewName(""); setNewType("new_build"); setNewPriority("medium"); setNewTargetDate(""); setNewAssignedUserId(""); setShowAdd(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setProjects(p => p.map(proj => proj.id === id ? { ...proj, status } : proj));
    try {
      await fetch("/api/db/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      fetchProjects();
    }
  };

  const reassignProject = async (id: string, userId: string) => {
    setProjects(p => p.map(proj => proj.id === id ? { ...proj, assigned_user_id: userId } : proj));
    try {
      await fetch("/api/db/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, assignedUserId: userId }),
      });
      fetchProjects();
    } catch {
      fetchProjects();
    }
  };

  return (
    <>
      <Header
        title="Projects"
        subtitle={`${projects.length} projects — saved to database`}
        actions={
          <button className="btn-primary" onClick={() => setShowAdd(p => !p)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Project
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
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>New Project</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1.2fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Project Name</label>
                <input className="input" placeholder="e.g. Loyalty Programme Phase 2" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Type</label>
                <select className="input" value={newType} onChange={e => setNewType(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                  <option value="new_build">New Build</option>
                  <option value="enhancement">Enhancement</option>
                  <option value="support">Support</option>
                  <option value="annual_recurring">Annual Recurring</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Priority</label>
                <select className="input" value={newPriority} onChange={e => setNewPriority(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Target Date</label>
                <input className="input" type="date" value={newTargetDate} onChange={e => setNewTargetDate(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Assign To</label>
                <select className="input" value={newAssignedUserId} onChange={e => setNewAssignedUserId(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                  <option value="">Unassigned</option>
                  {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" style={{ fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={addProject} disabled={saving}>
                {saving ? "Saving..." : "Save Project"}
              </button>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1.8fr 1.3fr 90px 90px 110px 1.1fr 70px",
            padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)",
          }}>
            {["Project", "Client", "Status", "Priority", "Target Date", "Assigned To", ""].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading from database...</div>
          ) : projects.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No projects yet — create one above to get started
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} className="table-row" style={{
                gridTemplateColumns: "1.8fr 1.3fr 90px 90px 110px 1.1fr 70px",
                alignItems: "center",
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{project.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{project.client_name || "—"}</div>
                <div>
                  <select
                    value={project.status}
                    onChange={e => updateStatus(project.id, e.target.value)}
                    className={`badge ${statusColor[project.status] || "badge-gray"}`}
                    style={{ border: "none", cursor: "pointer", appearance: "none", paddingRight: 8 }}
                  >
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div><span className={`badge ${priorityColor[project.priority] || "badge-gray"}`}>{project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}</span></div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {project.target_date ? new Date(project.target_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </div>
                <div>
                  <select
                    value={project.assigned_user_id || ""}
                    onChange={e => reassignProject(project.id, e.target.value)}
                    style={{
                      fontSize: 11, padding: "3px 6px", borderRadius: 6, width: "100%",
                      border: "1px solid var(--border)", background: "var(--bg-elevated)",
                      color: project.assigned_user_name ? "var(--text-primary)" : "var(--text-muted)",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">Unassigned</option>
                    {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <Link href={`/projects/${project.id}`}>
                    <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Open</button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
