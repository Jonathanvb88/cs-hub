"use client";
import { useState, useEffect } from "react";
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

interface TeamMember {
  id: string;
  name: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [savingDesc, setSavingDesc] = useState(false);

  const fetchProject = async () => {
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
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/db/users");
      const data = await res.json();
      setTeam(data.users || []);
    } catch {}
  };

  useEffect(() => { if (id) { fetchProject(); fetchTeam(); } }, [id]);

  const updateField = async (field: string, value: string) => {
    if (!project) return;
    setProject({ ...project, [field === "assignedUserId" ? "assigned_user_id" : field]: value });
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

  if (loading) {
    return (
      <>
        <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid var(--border)" }}>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Loading project...</h1>
        </div>
      </>
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

  return (
    <>
      <div style={{
        minHeight: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", paddingTop: "env(safe-area-inset-top, 0px)", borderBottom: "1px solid var(--border)", background: "var(--bg-base)",
        position: "sticky", top: 0, zIndex: 40,
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
        <Link href="/projects"><button className="btn-secondary" style={{ fontSize: 12 }}>Back to Projects</button></Link>
      </div>

      <div className="two-col-layout" style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Description</div>
            <textarea
              className="input"
              rows={4}
              style={{ resize: "vertical" }}
              placeholder="Add a project description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={() => { if (description !== (project?.description || "")) updateField("description", description); }}
            />
          </div>

          {project.client_id && (
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>Client</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: "var(--accent-green-bg)",
                  border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: "var(--accent-green)",
                }}>
                  {project.client_name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{project.client_name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{project.client_industry}</div>
                </div>
                <Link href={`/clients/${project.client_id}`} style={{ marginLeft: "auto" }}>
                  <button className="btn-secondary" style={{ fontSize: 11 }}>View Client</button>
                </Link>
              </div>
            </div>
          )}

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
                <select
                  value={project.status}
                  onChange={e => updateField("status", e.target.value)}
                  className={`badge ${statusColor[project.status] || "badge-gray"}`}
                  style={{ border: "none", cursor: "pointer", width: "100%" }}
                >
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Priority</label>
                <select
                  value={project.priority}
                  onChange={e => updateField("priority", e.target.value)}
                  className={`badge ${priorityColor[project.priority] || "badge-gray"}`}
                  style={{ border: "none", cursor: "pointer", width: "100%" }}
                >
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
            <select
              value={project.assigned_user_id || ""}
              onChange={e => updateField("assignedUserId", e.target.value)}
              className="input"
              style={{ background: "var(--bg-elevated)" }}
            >
              <option value="">Unassigned</option>
              {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
