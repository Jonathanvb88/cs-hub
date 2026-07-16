"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";

interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  status: string;
  type: string;
  priority: string;
  target_date: string | null;
  created_at: string;
  client_id: string | null;
  client_name: string | null;
  client_industry: string | null;
  assigned_user_id: string | null;
  assigned_user_name: string | null;
  assigned_user_initials: string | null;
}
interface TeamMember { id: string; name: string; }
interface Milestone {
  id: string; title: string; description: string | null; due_date: string | null;
  status: string; completed_at: string | null;
}
interface Task {
  id: string; title: string; description: string | null; type: string; status: string;
  assigned_user_id: string | null; assigned_user_name: string | null; due_date: string | null; completed_at: string | null;
}

const statusColor: Record<string, string> = {
  active: "badge-green", completed: "badge-blue", on_hold: "badge-amber", cancelled: "badge-gray", draft: "badge-gray",
};
const priorityColor: Record<string, string> = {
  critical: "badge-red", high: "badge-red", medium: "badge-amber", low: "badge-gray",
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [savingDesc, setSavingDesc] = useState(false);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [mTitle, setMTitle] = useState("");
  const [mDueDate, setMDueDate] = useState("");
  const [savingMilestone, setSavingMilestone] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [tTitle, setTTitle] = useState("");
  const [tType, setTType] = useState("task");
  const [tAssignee, setTAssignee] = useState("");
  const [tDueDate, setTDueDate] = useState("");
  const [savingTask, setSavingTask] = useState(false);
  const [closing, setClosing] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/db/projects?id=${id}`);
      if (!res.ok) throw new Error("Failed to load project");
      const data = await res.json();
      if (!data.project) throw new Error("Project not found");
      setProject(data.project);
      setDescription(data.project.description || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMilestones = useCallback(async () => {
    try {
      const res = await fetch(`/api/db/project-milestones?projectId=${id}`);
      const data = await res.json();
      setMilestones(data.milestones || []);
    } catch { setMilestones([]); }
  }, [id]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/db/project-tasks?projectId=${id}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch { setTasks([]); }
  }, [id]);

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/db/users");
      const data = await res.json();
      setTeam(data.users || []);
    } catch {}
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/db/clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch {}
  };

  useEffect(() => { if (id) { fetchProject(); fetchTeam(); fetchClients(); fetchMilestones(); fetchTasks(); } }, [id, fetchProject, fetchMilestones, fetchTasks]);

  const updateField = async (field: string, value: string) => {
    if (!project) return;
    const localField = field === "assignedUserId" ? "assigned_user_id" : field === "clientId" ? "client_id" : field;
    setProject({ ...project, [localField]: value || null });
    try {
      const res = await fetch("/api/db/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id, [field]: value }),
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("Saved", "success");
      fetchProject();
    } catch {
      showToast("Couldn't save - check your connection and try again", "error");
      fetchProject();
    }
  };

  const closeProject = async () => {
    if (!project) return;
    setClosing(true);
    try {
      await fetch("/api/db/projects", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id, status: "completed" }),
      });
      showToast("Project closed", "success");
      fetchProject();
    } catch {
      showToast("Couldn't close project - try again", "error");
    } finally {
      setClosing(false);
    }
  };

  const addMilestone = async () => {
    if (!mTitle.trim() || !id) return;
    setSavingMilestone(true);
    try {
      await fetch("/api/db/project-milestones", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id, title: mTitle, dueDate: mDueDate || null }),
      });
      setMTitle(""); setMDueDate(""); setShowAddMilestone(false);
      fetchMilestones();
      showToast("Milestone added", "success");
    } catch {
      showToast("Couldn't add milestone", "error");
    } finally {
      setSavingMilestone(false);
    }
  };

  const toggleMilestone = async (m: Milestone) => {
    const newStatus = m.status === "completed" ? "pending" : "completed";
    setMilestones(prev => prev.map(x => x.id === m.id ? { ...x, status: newStatus } : x));
    try {
      await fetch("/api/db/project-milestones", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id, status: newStatus }),
      });
    } catch {
      showToast("Couldn't update milestone", "error");
      fetchMilestones();
    }
  };

  const deleteMilestone = async (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
    try { await fetch(`/api/db/project-milestones?id=${id}`, { method: "DELETE" }); } catch {}
  };

  const addTask = async () => {
    if (!tTitle.trim() || !id) return;
    setSavingTask(true);
    try {
      await fetch("/api/db/project-tasks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id, title: tTitle, type: tType, assignedUserId: tAssignee || null, dueDate: tDueDate || null }),
      });
      setTTitle(""); setTType("task"); setTAssignee(""); setTDueDate(""); setShowAddTask(false);
      fetchTasks();
      showToast(tType === "additional_work" ? "Additional work logged" : "Task added", "success");
    } catch {
      showToast("Couldn't add task", "error");
    } finally {
      setSavingTask(false);
    }
  };

  const updateTaskStatus = async (task: Task, status: string) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status } : t));
    try {
      await fetch("/api/db/project-tasks", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, status }),
      });
    } catch {
      showToast("Couldn't update task", "error");
      fetchTasks();
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try { await fetch(`/api/db/project-tasks?id=${id}`, { method: "DELETE" }); } catch {}
  };

  if (loading) {
    return (
      <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Loading project...</h1>
      </div>
    );
  }

  if (error || !project) {
    return (
      <>
        <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid var(--border)" }}>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Project Not Found</h1>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "var(--accent-red)", marginBottom: 16 }}>
            {error || "This project could not be found."}
          </div>
          <Link href="/projects"><button className="btn-secondary">Back to Projects</button></Link>
        </div>
      </>
    );
  }

  const totalItems = milestones.length + tasks.length;
  const completedItems = milestones.filter(m => m.status === "completed").length + tasks.filter(t => t.status === "done").length;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const openTasksCount = tasks.filter(t => t.status !== "done").length;
  const additionalWorkCount = tasks.filter(t => t.type === "additional_work").length;

  return (
    <>
      <div style={{
        minHeight: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", paddingTop: "env(safe-area-inset-top, 0px)", borderBottom: "1px solid var(--border)", background: "var(--bg-base)",
        position: "sticky", top: 0, zIndex: 40, flexWrap: "wrap", gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>
            <Link href="/projects" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Projects</Link>
            <span> / </span>
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{project.name}</span>
          </div>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{project.name}</h1>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{project.client_name || "No client linked"}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {project.status !== "completed" && (
            <button className="btn-primary" style={{ fontSize: 12, opacity: closing ? 0.7 : 1 }} onClick={closeProject} disabled={closing}>
              {closing ? "Closing..." : "Close Project"}
            </button>
          )}
          <Link href="/projects"><button className="btn-secondary" style={{ fontSize: 12 }}>Back to Projects</button></Link>
        </div>
      </div>

      <div className="two-col-layout" style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Progress</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{completedItems}/{totalItems} complete{openTasksCount > 0 ? ` · ${openTasksCount} open task${openTasksCount !== 1 ? "s" : ""}` : ""}</span>
            </div>
            <div style={{ width: "100%", height: 8, background: "var(--bg-elevated)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${progressPct}%`, height: "100%", background: "var(--accent-green)", borderRadius: 4, transition: "width 0.3s" }} />
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Description</div>
            <textarea
              className="input" rows={4} style={{ resize: "vertical" }}
              placeholder="Add a project description..." value={description} onChange={e => setDescription(e.target.value)}
            />
            {description !== (project?.description || "") && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn-primary" style={{ fontSize: 12, opacity: savingDesc ? 0.7 : 1 }} disabled={savingDesc}
                  onClick={async () => { setSavingDesc(true); await updateField("description", description); setSavingDesc(false); }}>
                  {savingDesc ? "Saving..." : "Save Description"}
                </button>
                <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setDescription(project?.description || "")}>Discard</button>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Milestones</div>
              <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => setShowAddMilestone(o => !o)}>{showAddMilestone ? "Cancel" : "+ Add"}</button>
            </div>
            {showAddMilestone && (
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 8, marginBottom: 12 }}>
                <input className="input" placeholder="Milestone title" value={mTitle} onChange={e => setMTitle(e.target.value)} />
                <input className="input" type="date" value={mDueDate} onChange={e => setMDueDate(e.target.value)} />
                <button className="btn-primary" style={{ fontSize: 12, gridColumn: "1 / -1", opacity: savingMilestone ? 0.7 : 1 }} onClick={addMilestone} disabled={savingMilestone}>
                  {savingMilestone ? "Saving..." : "Save Milestone"}
                </button>
              </div>
            )}
            {milestones.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>No milestones yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {milestones.map(m => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--bg-elevated)", borderRadius: 8 }}>
                    <input type="checkbox" checked={m.status === "completed"} onChange={() => toggleMilestone(m)} style={{ width: 16, height: 16, cursor: "pointer", flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: m.status === "completed" ? "var(--text-muted)" : "var(--text-primary)", textDecoration: m.status === "completed" ? "line-through" : "none" }}>{m.title}</span>
                    {m.due_date && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(m.due_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</span>}
                    <button onClick={() => deleteMilestone(m.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 15 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                Tasks {additionalWorkCount > 0 && <span style={{ fontSize: 11, color: "var(--accent-amber)", fontWeight: 500 }}>({additionalWorkCount} additional work)</span>}
              </div>
              <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => setShowAddTask(o => !o)}>{showAddTask ? "Cancel" : "+ Add"}</button>
            </div>
            {showAddTask && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                <input className="input" placeholder="Task title" value={tTitle} onChange={e => setTTitle(e.target.value)} />
                <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <select className="input" value={tType} onChange={e => setTType(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                    <option value="task">Task</option>
                    <option value="additional_work">Additional Work</option>
                  </select>
                  <select className="input" value={tAssignee} onChange={e => setTAssignee(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                    <option value="">Unassigned</option>
                    {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <input className="input" type="date" value={tDueDate} onChange={e => setTDueDate(e.target.value)} />
                </div>
                <button className="btn-primary" style={{ fontSize: 12, opacity: savingTask ? 0.7 : 1 }} onClick={addTask} disabled={savingTask}>
                  {savingTask ? "Saving..." : "Save Task"}
                </button>
              </div>
            )}
            {tasks.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>No tasks logged yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {tasks.map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--bg-elevated)", borderRadius: 8, flexWrap: "wrap" }}>
                    <input type="checkbox" checked={t.status === "done"} onChange={() => updateTaskStatus(t, t.status === "done" ? "open" : "done")} style={{ width: 16, height: 16, cursor: "pointer", flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 100, fontSize: 13, color: t.status === "done" ? "var(--text-muted)" : "var(--text-primary)", textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</span>
                    {t.type === "additional_work" && <span className="badge badge-amber" style={{ fontSize: 10 }}>Additional Work</span>}
                    {t.assigned_user_name && <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{t.assigned_user_name}</span>}
                    {t.due_date && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(t.due_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</span>}
                    <button onClick={() => deleteTask(t.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 15 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>Client</div>
            {project.client_id ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: "var(--accent-green-bg)",
                  border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: "var(--accent-green)",
                }}>
                  {project.client_name?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{project.client_name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{project.client_industry}</div>
                </div>
                <Link href={`/clients/${project.client_id}`}>
                  <button className="btn-secondary" style={{ fontSize: 11 }}>View Client</button>
                </Link>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Not linked to a client yet.</div>
            )}
            <select
              className="input" value={project.client_id || ""} onChange={e => updateField("clientId", e.target.value)}
              style={{ background: "var(--bg-elevated)", marginTop: project.client_id ? 12 : 0 }}
            >
              <option value="">No client (internal)</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Activity</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Created {new Date(project.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Status</label>
                <select value={project.status} onChange={e => updateField("status", e.target.value)}
                  className={`badge ${statusColor[project.status] || "badge-gray"}`} style={{ border: "none", cursor: "pointer", width: "100%" }}>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Priority</label>
                <select value={project.priority} onChange={e => updateField("priority", e.target.value)}
                  className={`badge ${priorityColor[project.priority] || "badge-gray"}`} style={{ border: "none", cursor: "pointer", width: "100%" }}>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Type</label>
                <div style={{ fontSize: 13, color: "var(--text-primary)", textTransform: "capitalize" }}>{project.type?.replace("_", " ")}</div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Target Date</label>
                <div style={{ fontSize: 13, color: "var(--text-primary)" }}>
                  {project.target_date ? new Date(project.target_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : "Not set"}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Assigned To</div>
            <select value={project.assigned_user_id || ""} onChange={e => updateField("assignedUserId", e.target.value)} className="input" style={{ background: "var(--bg-elevated)" }}>
              <option value="">Unassigned</option>
              {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
