"use client";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";

interface CalEvent {
  id: string;
  title: string;
  client_name: string | null;
  client_id: string | null;
  event_date: string;
  start_hour: number;
  start_min: number;
  duration_mins: number;
  type: string;
  notes: string | null;
}

interface Client { id: string; name: string; }

const TYPE_CONFIG: Record<string, { bg: string; border: string; text: string; label: string }> = {
  meeting:       { bg: "#ede9fe", border: "#7c3aed", text: "#5b21b6", label: "Meeting" },
  communication: { bg: "#dbeafe", border: "#2563eb", text: "#1e40af", label: "Communication" },
  followup:      { bg: "#fef3c7", border: "#d97706", text: "#92400e", label: "Follow-up" },
  personal:      { bg: "#f0fdf4", border: "#15803d", text: "#166534", label: "Personal" },
  teams:         { bg: "#e0f2fe", border: "#0284c7", text: "#0c4a6e", label: "Teams Call" },
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);
const SLOT_H = 60;

function getWeekDays(base: Date): Date[] {
  const d = new Date(base);
  const dow = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 5 }, (_, i) => { const x = new Date(mon); x.setDate(mon.getDate() + i); return x; });
}
const toDs = (d: Date) => d.toISOString().split("T")[0];
const fmtHour = (h: number) => h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`;
const fmtTime = (h: number, m: number) => { const ap = h < 12 ? "AM" : "PM"; const hh = h % 12 || 12; return `${hh}:${m.toString().padStart(2, "0")} ${ap}`; };

const EMPTY: { title: string; clientId: string; clientName: string; type: string; eventDate: string; startHour: number; startMin: number; durationMins: number; notes: string } = { title: "", clientId: "", clientName: "", type: "meeting", eventDate: "", startHour: 9, startMin: 0, durationMins: 60, notes: "" };

export default function CalendarPage() {
  const [baseDate, setBaseDate] = useState(new Date());
  const [view, setView] = useState<"week" | "day">("week");
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: CalEvent | null; form: typeof EMPTY }>({ open: false, editing: null, form: EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const today = toDs(new Date());
  const days = view === "week" ? getWeekDays(baseDate) : [baseDate];

  const fetchEvents = async () => {
    setLoading(true);
    const from = toDs(days[0]);
    const to = toDs(days[days.length - 1]);
    try {
      const r = await fetch(`/api/db/calendar-events?from=${from}&to=${to}`);
      const d = await r.json();
      setEvents(d.events || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [baseDate, view]);
  useEffect(() => { fetch("/api/db/clients").then(r => r.json()).then(d => setClients(d.clients || [])).catch(() => {}); }, []);
  useEffect(() => { if (gridRef.current) gridRef.current.scrollTop = SLOT_H; }, []);

  const eventsForDay = (ds: string) => events.filter(e => e.event_date === ds);
  const setForm = (p: Partial<typeof EMPTY>) => setModal(m => ({ ...m, form: { ...m.form, ...p } }));
  const openNew = (ds: string, hour: number) => setModal({ open: true, editing: null, form: { ...EMPTY, eventDate: ds, startHour: hour } });
  const openEdit = (ev: CalEvent) => setModal({ open: true, editing: ev, form: { title: ev.title, clientId: ev.client_id || "", clientName: ev.client_name || "", type: ev.type, eventDate: ev.event_date, startHour: ev.start_hour, startMin: ev.start_min, durationMins: ev.duration_mins, notes: ev.notes || "" } });
  const closeModal = () => setModal({ open: false, editing: null, form: EMPTY });

  const handleSave = async () => {
    if (!modal.form.title.trim() || !modal.form.eventDate) return;
    setSaving(true);
    try {
      const client = clients.find(c => c.id === modal.form.clientId);
      const payload = { ...modal.form, clientName: client?.name || modal.form.clientName, ...(modal.editing ? { id: modal.editing.id } : {}) };
      await fetch("/api/db/calendar-events", { method: modal.editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      closeModal(); fetchEvents();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!modal.editing) return;
    setDeleting(true);
    try { await fetch(`/api/db/calendar-events?id=${modal.editing.id}`, { method: "DELETE" }); closeModal(); fetchEvents(); }
    catch {} finally { setDeleting(false); }
  };

  const weekLabel = view === "week"
    ? `${days[0].toLocaleDateString("en-ZA", { day: "numeric", month: "short" })} – ${days[4].toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}`
    : baseDate.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const c = (type: string) => TYPE_CONFIG[type] || TYPE_CONFIG.meeting;

  return (
    <>
      <Header title="Calendar" subtitle="Click any time slot to add an event"
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--accent-amber)", background: "#fffbeb", border: "1px solid #fde68a", padding: "3px 10px", borderRadius: 20, fontWeight: 500 }}>Teams sync pending admin consent</span>
            <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => openNew(today, 9)}>+ New Event</button>
          </div>
        }
      />

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)", gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setBaseDate(new Date())}>Today</button>
          <div style={{ display: "flex" }}>
            <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() - (view === "week" ? 7 : 1)); setBaseDate(d); }} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "6px 0 0 6px", padding: "5px 10px", cursor: "pointer", color: "var(--text-secondary)" }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => { const d = new Date(baseDate); d.setDate(d.getDate() + (view === "week" ? 7 : 1)); setBaseDate(d); }} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderLeft: "none", borderRadius: "0 6px 6px 0", padding: "5px 10px", cursor: "pointer", color: "var(--text-secondary)" }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{weekLabel}</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: v.border }} />
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{v.label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            {(["week", "day"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "5px 14px", fontSize: 12, border: "none", cursor: "pointer", background: view === v ? "var(--accent-green)" : "var(--bg-elevated)", color: view === v ? "white" : "var(--text-secondary)", fontWeight: view === v ? 600 : 400 }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: `56px repeat(${days.length}, 1fr)`, borderBottom: "1px solid var(--border)", background: "var(--bg-surface)", flexShrink: 0 }}>
          <div style={{ borderRight: "1px solid var(--border)" }} />
          {days.map(day => {
            const ds = toDs(day);
            const isToday = ds === today;
            const cnt = eventsForDay(ds).length;
            return (
              <div key={ds} onClick={() => { setBaseDate(day); setView("day"); }} style={{ padding: "8px 10px", textAlign: "center", borderRight: "1px solid var(--border)", cursor: "pointer" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: isToday ? "var(--accent-green)" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{day.toLocaleDateString("en-ZA", { weekday: "short" })}</div>
                <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.3, color: isToday ? "white" : "var(--text-primary)", background: isToday ? "var(--accent-green)" : "transparent", width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "2px auto 0" }}>{day.getDate()}</div>
                {cnt > 0 && <div style={{ fontSize: 9, color: "var(--accent-green)", marginTop: 2, fontWeight: 700 }}>{cnt} event{cnt !== 1 ? "s" : ""}</div>}
              </div>
            );
          })}
        </div>

        {/* Scrollable time grid */}
        <div ref={gridRef} style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
          <div style={{ position: "relative", minWidth: view === "week" ? 600 : 300 }}>
            {HOURS.map(hour => (
              <div key={hour} style={{ display: "grid", gridTemplateColumns: `56px repeat(${days.length}, 1fr)`, minHeight: SLOT_H, borderBottom: "1px solid var(--border-light)" }}>
                <div style={{ padding: "4px 8px 0 0", textAlign: "right", borderRight: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>{fmtHour(hour)}</span>
                </div>
                {days.map(day => {
                  const ds = toDs(day);
                  const dayEvs = eventsForDay(ds).filter(e => e.start_hour === hour);
                  return (
                    <div key={ds} onClick={() => openNew(ds, hour)} style={{ borderRight: "1px solid var(--border)", minHeight: SLOT_H, position: "relative", padding: "2px 3px", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", borderTop: "1px dashed var(--border-light)", pointerEvents: "none" }} />
                      {dayEvs.map(ev => {
                        const col = c(ev.type);
                        const h = Math.max((ev.duration_mins / 60) * SLOT_H - 4, 24);
                        return (
                          <div key={ev.id} onClick={e => { e.stopPropagation(); openEdit(ev); }}
                            style={{ background: col.bg, border: `1px solid ${col.border}`, borderLeft: `3px solid ${col.border}`, borderRadius: 6, padding: "3px 7px", marginBottom: 2, height: h, overflow: "hidden", cursor: "pointer", position: "relative", zIndex: 2 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: col.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                            <div style={{ fontSize: 10, color: col.text, opacity: 0.75 }}>{fmtTime(ev.start_hour, ev.start_min)} · {ev.client_name || col.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
            {/* Now indicator */}
            {(() => {
              const now = new Date();
              const nowDs = toDs(now);
              if (!days.some(d => toDs(d) === nowDs)) return null;
              const top = ((now.getHours() - 7) * SLOT_H) + (now.getMinutes() / 60) * SLOT_H;
              if (top < 0) return null;
              return (
                <div style={{ position: "absolute", left: 56, right: 0, top, height: 2, background: "#dc2626", zIndex: 10, pointerEvents: "none" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#dc2626", position: "absolute", left: -5, top: -4 }} />
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={closeModal} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
          <div style={{
            position: "relative", background: "var(--bg-surface)", borderRadius: 16,
            width: 440, maxWidth: "90vw", maxHeight: "90vh",
            display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)", zIndex: 1,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 28px 0", flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{modal.editing ? "Edit Event" : "New Event"}</div>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 22, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 28px", overflowY: "auto", minHeight: 0, flex: 1 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Title</label>
                <input className="input" placeholder="Meeting title..." autoFocus value={modal.form.title} onChange={e => setForm({ title: e.target.value })} onKeyDown={e => e.key === "Enter" && handleSave()} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Type</label>
                  <select className="input" value={modal.form.type} onChange={e => setForm({ type: e.target.value })} style={{ background: "var(--bg-elevated)" }}>
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Client</label>
                  <select className="input" value={modal.form.clientId} onChange={e => setForm({ clientId: e.target.value })} style={{ background: "var(--bg-elevated)" }}>
                    <option value="">No client</option>
                    {clients.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Date</label>
                  <input className="input" type="date" value={modal.form.eventDate} onChange={e => setForm({ eventDate: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Start</label>
                  <input className="input" type="time" value={`${modal.form.startHour.toString().padStart(2, "0")}:${modal.form.startMin.toString().padStart(2, "0")}`} onChange={e => { const [h, m] = e.target.value.split(":"); setForm({ startHour: parseInt(h), startMin: parseInt(m) }); }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Duration</label>
                  <select className="input" value={modal.form.durationMins} onChange={e => setForm({ durationMins: parseInt(e.target.value) })} style={{ background: "var(--bg-elevated)" }}>
                    {[15, 30, 45, 60, 90, 120, 180].map(m => <option key={m} value={m}>{m < 60 ? `${m} min` : `${m / 60}h${m % 60 ? ` ${m % 60}m` : ""}`}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Notes</label>
                <textarea className="input" rows={2} style={{ resize: "none" }} placeholder="Agenda, notes..." value={modal.form.notes} onChange={e => setForm({ notes: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", padding: "16px 28px 28px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
              <div>
                {modal.editing && (
                  <button onClick={handleDelete} disabled={deleting} style={{ background: "none", border: "1px solid var(--accent-red)", color: "var(--accent-red)", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer", opacity: deleting ? 0.7 : 1 }}>
                    {deleting ? "Deleting..." : "Delete Event"}
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={closeModal} className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button>
                <button onClick={handleSave} disabled={saving || !modal.form.title.trim()} className="btn-primary" style={{ fontSize: 12, opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : modal.editing ? "Update" : "Create Event"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
