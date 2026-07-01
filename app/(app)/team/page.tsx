"use client";
import { useState, useEffect } from "react";

import Header from "@/components/layout/Header";

interface User {
  id: string;
  name: string;
  email: string | null;
  role: string;
  avatar_initials: string;
  is_active: boolean;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  csm: "Client Success Manager",
  manager: "Delivery Manager",
  sales_manager: "Sales Manager",
  project_manager: "Project Manager",
  key_accounts: "Key Accounts Manager",
  readonly: "Read Only",
};

const ROLE_COLOR: Record<string, string> = {
  admin: "badge-red",
  csm: "badge-green",
  manager: "badge-blue",
  sales_manager: "badge-purple",
  project_manager: "badge-blue",
  key_accounts: "badge-amber",
  readonly: "badge-gray",
};

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("csm");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/db/users");
      if (!res.ok) throw new Error("Failed to load team");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const addUser = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/db/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, email: newEmail, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to add team member");
      await fetchUsers();
      setNewName(""); setNewEmail(""); setNewRole("csm"); setShowAdd(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add team member");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header
        title="Team"
        subtitle={`${users.length} team member${users.length !== 1 ? "s" : ""}`}
        actions={
          <button className="btn-primary" onClick={() => setShowAdd(p => !p)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Team Member
          </button>
        }
      />

      <div style={{ padding: 24 }}>
        {error && (
          <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "var(--accent-red)", marginBottom: 16 }}>
            {error}
          </div>
        )}

        {showAdd && (
          <div className="card" style={{ border: "1px solid var(--accent-green)", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>New Team Member</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Full Name</label>
                <input className="input" placeholder="e.g. Sarah Mkhize" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Email</label>
                <input className="input" placeholder="sarah@urupconnect.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Role</label>
                <select className="input" value={newRole} onChange={e => setNewRole(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                  <option value="csm">Client Success Manager</option>
                  <option value="key_accounts">Key Accounts Manager</option>
                  <option value="sales_manager">Sales Manager</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="manager">Delivery Manager</option>
                  <option value="admin">Administrator</option>
                  <option value="readonly">Read Only</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" style={{ fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={addUser} disabled={saving}>
                {saving ? "Adding..." : "Add Team Member"}
              </button>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)", fontSize: 13 }}>Loading team...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {users.map(user => (
              <div key={user.id} className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "var(--accent-green)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, color: "white", flexShrink: 0,
                  }}>
                    {user.avatar_initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{user.email || "No email"}</div>
                  </div>
                </div>
                <span className={`badge ${ROLE_COLOR[user.role] || "badge-gray"}`}>{ROLE_LABEL[user.role] || user.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}


