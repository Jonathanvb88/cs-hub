"use client";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/Toast";

interface AttendanceRecord {
  id: string;
  user_id: string;
  user_name: string;
  avatar_initials: string;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  last_activity_at: string | null;
  status: string;
  is_manual: boolean;
  notes: string | null;
  hours_worked: number | null;
  overtime_hours: number | null;
  project_id: string | null;
  project_name: string | null;
  break_minutes: number | null;
  location: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  present: "Present", absent: "Absent", leave: "Leave", half_day: "Half Day", overtime: "Overtime",
};
const STATUS_BADGE: Record<string, string> = {
  present: "badge-green", absent: "badge-red", leave: "badge-amber", half_day: "badge-blue", overtime: "badge-purple",
};

// South Africa is UTC+2 year-round (no daylight saving), so this is a
// fixed offset rather than something that needs a timezone library.
const SAST_TZ = "Africa/Johannesburg";

// Returns "YYYY-MM-DD" for what the date actually is in SAST right now,
// regardless of what timezone the device itself is set to.
function getSASTDateString(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SAST_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

// Takes a "HH:MM" value from a <input type="time"> and treats it as SAST
// (not the browser's local time, which might not be SAST at all), then
// converts to a proper UTC instant for storage.
function sastTimeToISO(dateStr: string, time: string): string | null {
  if (!time) return null;
  return new Date(`${dateStr}T${time}:00+02:00`).toISOString();
}

// Extracts "HH:MM" in SAST from a stored UTC timestamp, for pre-filling
// the edit form - deliberately not just slicing .toISOString(), which
// would show the UTC hour instead.
function isoToSASTTimeInput(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone: SAST_TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

function monthBounds(offset: number) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const from = new Date(target.getFullYear(), target.getMonth(), 1);
  const to = new Date(target.getFullYear(), target.getMonth() + 1, 0);
  return {
    from: getSASTDateString(from),
    to: getSASTDateString(to),
    label: target.toLocaleDateString("en-ZA", { month: "long", year: "numeric" }),
  };
}

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-ZA", { timeZone: SAST_TZ, hour: "2-digit", minute: "2-digit" });
}

// Formats a plain "YYYY-MM-DD" value directly, without going through
// Date parsing at all - avoids the UTC-midnight-then-shift-to-local bug
// that plain-date columns are prone to in timezones behind UTC.
function fmtDateOnly(dateStr: string) {
  const [, month, day] = dateStr.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[parseInt(month, 10) - 1]}`;
}

export default function AttendancePage() {
  const { showToast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [viewUserId, setViewUserId] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [fDate, setFDate] = useState(getSASTDateString());
  const [fClockIn, setFClockIn] = useState("");
  const [fClockOut, setFClockOut] = useState("");
  const [fStatus, setFStatus] = useState("present");
  const [fNotes, setFNotes] = useState("");
  const [fOvertimeHours, setFOvertimeHours] = useState("");
  const [fProjectId, setFProjectId] = useState("");
  const [fBreakMinutes, setFBreakMinutes] = useState("");
  const [fLocation, setFLocation] = useState("");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const { from, to, label } = monthBounds(monthOffset);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ from, to });
    if (viewUserId) params.set("userId", viewUserId);
    fetch(`/api/db/attendance?${params}`)
      .then(r => r.json())
      .then(d => {
        // The database driver returns DATE columns as full timestamp
        // strings ("2026-07-22T00:00:00.000Z"), not plain "YYYY-MM-DD" -
        // normalize once here so every downstream comparison and display
        // can safely assume a clean date string.
        const normalized = (d.records || []).map((r: AttendanceRecord) => ({ ...r, date: r.date.slice(0, 10) }));
        setRecords(normalized);
        setIsOwner(d.isOwner || false);
        setCurrentUserId(d.currentUserId || "");
        setUsers(d.users || []);
        setProjects(d.projects || []);
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [from, to, viewUserId]);

  useEffect(() => { load(); }, [load]);

  const openNewEntry = () => {
    setEditing(null);
    setFDate(getSASTDateString());
    setFClockIn(""); setFClockOut(""); setFStatus("present"); setFNotes(""); setFOvertimeHours("");
    setFProjectId(""); setFBreakMinutes(""); setFLocation("");
    setShowModal(true);
  };

  const openEdit = (r: AttendanceRecord) => {
    setEditing(r);
    setFDate(r.date);
    setFClockIn(isoToSASTTimeInput(r.clock_in));
    setFClockOut(isoToSASTTimeInput(r.clock_out));
    setFStatus(r.status);
    setFNotes(r.notes || "");
    setFOvertimeHours(r.overtime_hours ? String(r.overtime_hours) : "");
    setFProjectId(r.project_id || "");
    setFBreakMinutes(r.break_minutes ? String(r.break_minutes) : "");
    setFLocation(r.location || "");
    setShowModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/db/attendance", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editing?.user_id || viewUserId || undefined,
          date: fDate, clockIn: sastTimeToISO(fDate, fClockIn), clockOut: sastTimeToISO(fDate, fClockOut),
          status: fStatus, notes: fNotes, overtimeHours: fOvertimeHours ? parseFloat(fOvertimeHours) : null,
          projectId: fProjectId, breakMinutes: fBreakMinutes ? parseFloat(fBreakMinutes) : null, location: fLocation,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Save failed"); }
      showToast("Attendance saved", "success");
      setShowModal(false);
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't save", "error");
    } finally {
      setSaving(false);
    }
  };

  const totalHours = records.reduce((s, r) => s + (Number(r.hours_worked) || 0), 0);
  const daysPresent = records.filter(r => r.status === "present").length;
  const todayStr = getSASTDateString();
  const today = records.find(r => r.date === todayStr && r.user_id === (viewUserId || currentUserId));

  return (
    <>
      <Header
        title="Attendance Register"
        subtitle="Auto-tracked from real app activity, editable when you need to correct it"
        actions={<button className="btn-primary" style={{ fontSize: 12 }} onClick={openNewEntry}>+ Manual Entry</button>}
      />

      <div style={{ padding: 24 }}>
        <div className="stat-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
          <div className="stat-card card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Hours This Month</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{totalHours.toFixed(1)}</div>
          </div>
          <div className="stat-card card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Days Present</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-green)" }}>{daysPresent}</div>
          </div>
          <div className="stat-card card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Today</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: today ? "var(--accent-green)" : "var(--text-muted)" }}>
              {today ? `Since ${fmtTime(today.clock_in)}${today.is_manual ? " (manual)" : ""}` : "Not started yet"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setMonthOffset(o => o - 1)}>← Prev</button>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", minWidth: 140, textAlign: "center" }}>{label}</div>
          <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setMonthOffset(o => o + 1)} disabled={monthOffset >= 0}>Next →</button>
          {isOwner && (
            <select className="input" style={{ maxWidth: 200, background: "var(--bg-elevated)", marginLeft: "auto" }} value={viewUserId} onChange={e => setViewUserId(e.target.value)}>
              <option value="">My attendance</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No attendance recorded for {label}</div>
            <div className="empty-state-subtitle">Records appear automatically as the app is used, or add one manually.</div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-scroll-wrapper">
              <div style={{ display: "grid", gridTemplateColumns: "100px 1.1fr 80px 80px 70px 60px 100px 1fr 60px 1fr 1fr 60px", padding: "10px 20px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)", minWidth: 1100 }}>
                {["Date", "Person", "In", "Out", "Hours", "OT", "Status", "Project", "Break", "Location", "Notes", ""].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
                ))}
              </div>
              {records.map(r => (
                <div key={r.id} style={{ display: "grid", gridTemplateColumns: "100px 1.1fr 80px 80px 70px 60px 100px 1fr 60px 1fr 1fr 60px", padding: "10px 20px", borderBottom: "1px solid var(--border)", alignItems: "center", minWidth: 1100 }}>
                  <div style={{ fontSize: 12, color: "var(--text-primary)" }}>{fmtDateOnly(r.date)}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{r.user_name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-primary)" }}>{fmtTime(r.clock_in)}</div>
                  <div style={{ fontSize: 12, color: "var(--text-primary)" }}>{r.clock_out ? fmtTime(r.clock_out) : r.date === todayStr ? "Active" : "—"}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{r.hours_worked ? Number(r.hours_worked).toFixed(1) : "—"}</div>
                  <div style={{ fontSize: 12, color: "var(--accent-purple)" }}>{r.overtime_hours ? Number(r.overtime_hours).toFixed(1) : "—"}</div>
                  <div><span className={`badge ${STATUS_BADGE[r.status] || "badge-gray"}`} style={{ fontSize: 10 }}>{STATUS_LABEL[r.status] || r.status}{r.is_manual && " ✎"}</span></div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.project_name || "—"}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.break_minutes ? `${r.break_minutes}m` : "—"}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.location || "—"}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.notes || "—"}</div>
                  <button className="btn-secondary" style={{ fontSize: 10, padding: "3px 8px" }} onClick={() => openEdit(r)}>Edit</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{editing ? "Edit Attendance" : "Manual Entry"}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 18, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Date</label>
                <input className="input" type="date" value={fDate} onChange={e => setFDate(e.target.value)} disabled={!!editing} />
              </div>
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Clock In</label>
                  <input className="input" type="time" value={fClockIn} onChange={e => setFClockIn(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Clock Out</label>
                  <input className="input" type="time" value={fClockOut} onChange={e => setFClockOut(e.target.value)} />
                </div>
              </div>
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Status</label>
                  <select className="input" value={fStatus} onChange={e => setFStatus(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="leave">Leave</option>
                    <option value="half_day">Half Day</option>
                    <option value="overtime">Overtime</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Overtime Hours</label>
                  <input className="input" type="number" step="0.5" min="0" placeholder="0" value={fOvertimeHours} onChange={e => setFOvertimeHours(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Project Worked On</label>
                <select className="input" value={fProjectId} onChange={e => setFProjectId(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                  <option value="">No specific project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Break Duration (min)</label>
                  <input className="input" type="number" step="5" min="0" placeholder="0" value={fBreakMinutes} onChange={e => setFBreakMinutes(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Location</label>
                  <input className="input" placeholder="e.g. Office, Client site" value={fLocation} onChange={e => setFLocation(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Notes</label>
                <textarea className="input" rows={2} value={fNotes} onChange={e => setFNotes(e.target.value)} style={{ resize: "vertical" }} placeholder="Optional" />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
