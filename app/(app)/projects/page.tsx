"use client";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";
import { mockProjects, mockClients } from "@/lib/mockData";

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
  return (
    <AppLayout>
      <Header
        title="Projects"
        subtitle={`${mockProjects.length} projects`}
        actions={
          <button className="btn-primary">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        }
      />
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.5fr 100px 100px 140px 80px",
            padding: "10px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-elevated)",
          }}>
            {["Project", "Client", "Status", "Priority", "Target Date", ""].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>
          {mockProjects.map(project => {
            const client = mockClients.find(c => c.id === project.clientId);
            return (
              <div key={project.id} className="table-row" style={{
                gridTemplateColumns: "2fr 1.5fr 100px 100px 140px 80px",
                alignItems: "center",
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{project.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{client?.name}</div>
                <div><span className={`badge ${statusColor[project.status] || "badge-gray"}`}>{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span></div>
                <div><span className={`badge ${priorityColor[project.priority] || "badge-gray"}`}>{project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}</span></div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {new Date(project.targetDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div><button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Open</button></div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
