"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/Toast";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  csm: "Client Success Manager",
  manager: "Delivery Manager",
  sales_manager: "Sales Manager",
  project_manager: "Project Manager",
  key_accounts: "Key Accounts Manager",
  finance_admin: "Finance Administrator",
  visuals: "Visuals",
  executive_partner: "Executive Partner",
  readonly: "Read Only",
};

export default function ProfilePage() {
  const { showToast } = useToast();

  // Profile fields
  const [name, setName] = useState("Jonathan");
  const [email, setEmail] = useState("jonathanvb@urupconnect.com");
  const [role, setRole] = useState("csm");
  const [phone, setPhone] = useState("+27 82 000 0000");
  const [timezone, setTimezone] = useState("Africa/Johannesburg");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [followUpReminders, setFollowUpReminders] = useState(true);
  const [healthAlerts, setHealthAlerts] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    await new Promise(r => setTimeout(r, 600));
    setSavingProfile(false);
    showToast("Profile updated successfully");
  };

  const savePassword = async () => {
    setPasswordError("");
    if (!currentPassword) { setPasswordError("Please enter your current password"); return; }
    if (newPassword.length < 8) { setPasswordError("New password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match"); return; }
    setSavingPassword(true);
    await new Promise(r => setTimeout(r, 600));
    setSavingPassword(false);
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    showToast("Password updated successfully");
  };

  // Load preferences from DB on mount
  useEffect(() => {
    fetch("/api/db/user-preferences")
      .then(r => r.json())
      .then(d => {
        if (d.preferences) {
          setEmailNotifications(d.preferences.email_notifications ?? true);
          setFollowUpReminders(d.preferences.followup_reminders ?? true);
          setHealthAlerts(d.preferences.health_alerts ?? true);
        }
      })
      .catch(() => {});
  }, []);

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      await fetch("/api/db/user-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications, followupReminders: followUpReminders, healthAlerts }),
      });
      showToast("Preferences saved");
    } catch {
      showToast("Failed to save preferences", "error");
    } finally {
      setSavingPrefs(false);
    }
  };

  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <Header
        title="My Profile"
        subtitle="Manage your personal details, password, and preferences"
        actions={
          <Link href="/settings">
            <button className="btn-secondary" style={{ fontSize: 12 }}>Settings</button>
          </Link>
        }
      />

      <div className="two-col-layout" style={{ padding: 24, display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, maxWidth: 960 }}>

        {/* Left — avatar and quick info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ textAlign: "center", padding: 28 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "var(--accent-green)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, fontWeight: 800, color: "white",
              margin: "0 auto 14px",
            }}>
              {initials}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{name}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>{email}</div>
            <span className="badge badge-green">{ROLE_LABEL[role] || role}</span>
          </div>

          <div className="card">
            <div className="section-label" style={{ marginBottom: 12 }}>Account</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                <span>Status</span>
                <span className="badge badge-green">Active</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                <span>Organisation</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>URUP Connect</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", justifyContent: "space-between" }}>
                <span>Timezone</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>SAST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Personal details */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 18 }}>Personal Details</div>
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Full Name</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Email Address</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Phone Number</label>
                <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+27 82 000 0000" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Role</label>
                <select className="input" value={role} onChange={e => setRole(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                  {Object.entries(ROLE_LABEL).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Timezone</label>
                <select className="input" value={timezone} onChange={e => setTimezone(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                  <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </select>
              </div>
            </div>
            <button className="btn-primary" style={{ fontSize: 12, opacity: savingProfile ? 0.7 : 1 }} onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>

          {/* Password */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 18 }}>Change Password</div>
            {passwordError && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "var(--accent-red)", marginBottom: 14 }}>
                {passwordError}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Current Password</label>
                <div style={{ position: "relative" }}>
                  <input className="input" type={showCurrentPw ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" style={{ paddingRight: 40 }} />
                  <button onClick={() => setShowCurrentPw(p => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    {showCurrentPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <input className="input" type={showNewPw ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" style={{ paddingRight: 40 }} />
                    <button onClick={() => setShowNewPw(p => !p)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                      {showNewPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Confirm New Password</label>
                  <input className="input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
                </div>
              </div>
            </div>
            <button className="btn-primary" style={{ fontSize: 12, opacity: savingPassword ? 0.7 : 1 }} onClick={savePassword} disabled={savingPassword}>
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>

          {/* Notification preferences */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 18 }}>Notification Preferences</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
              {[
                { label: "Email notifications", desc: "Receive email alerts for new messages and updates", value: emailNotifications, set: setEmailNotifications },
                { label: "Follow-up reminders", desc: "Get reminded when follow-ups are due or overdue", value: followUpReminders, set: setFollowUpReminders },
                { label: "Client health alerts", desc: "Alert me when a client drops to At Risk or Quiet", value: healthAlerts, set: setHealthAlerts },
              ].map(pref => (
                <div key={pref.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{pref.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{pref.desc}</div>
                  </div>
                  <button
                    onClick={() => pref.set(v => !v)}
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                      background: pref.value ? "var(--accent-green)" : "var(--border-light)",
                      position: "relative", flexShrink: 0, transition: "background 0.2s",
                    }}
                  >
                    <span style={{
                      position: "absolute", top: 3, left: pref.value ? 22 : 3,
                      width: 18, height: 18, borderRadius: "50%",
                      background: "white", transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </button>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ fontSize: 12, opacity: savingPrefs ? 0.7 : 1 }} onClick={savePreferences} disabled={savingPrefs}>
              {savingPrefs ? "Saving..." : "Save Preferences"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

