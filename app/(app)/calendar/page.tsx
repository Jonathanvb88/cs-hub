"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface CalendarEvent {
  id: string;
  title: string;
  client: string;
  date: string;        // YYYY-MM-DD
  startHour: number;   // 0-23
  startMin: number;
  durationMins: number;
  type: "meeting" | "followup" | "communication" | "teams";
  color: string;
}

const TYPE_COLORS = {
  meeting:       { bg: "#ede9fe", border: "#7c3aed", text: "#5b21b6" },
  followup:      { bg: "#fef3c7", border: "#d97706", text: "#92400e" },
  communication: { bg: "#dbeafe", border: "#2563eb", text: "#1e40af" },
  teams:         { bg: "#f0fdf4", border: "#15803d", text: "#166534" },
};

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am – 7pm
const SLOT_HEIGHT = 56; // px per hour

function getWeekDays(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 5 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatHour(h: number) {
  return h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"week" | "day">("week");

  const weekDays = getWeekDays(currentDate);
  const today = toDateStr(new Date());

  useEffect(() => {
    // Load real communications as calendar events
    setLoading(true);
    fetch("/api/db/communications")
      .then(r => r.json())
      .then(d => {
        const comms = d.communications || [];
        const mapped: CalendarEvent[] = comms
          .filter((c: Record<string, unknown>) => c.received_at)
          .map((c: Record<string, unknown>) => {
            const dt = new Date(c.received_at as string);
            return {
              id: c.id as string,
              title: c.subject as string,
              client: c.client_name as string || "—",
              date: toDateStr(dt),
              startHour: dt.getHours() || 9,
              startMin: dt.getMinutes() || 0,
              durationMins: 60,
              type: (c.type as string) === "meeting" ? "meeting" : "communication",
              color: (c.type as string) === "meeting" ? "meeting" : "communication",
            };
          });

        // Also load follow-ups with due dates as calendar events
        return fetch("/api/db/followups")
          .then(r => r.json())
          .then(fd => {
            const followUps = (fd.followUps || [])
              .filter((f: Record<string, unknown>) => f.due_date)
              .map((f: Record<string, unknown>) => ({
                id: `fu-${f.id}`,
                title: f.title as string,
                client: f.client_name as string || "—",
                date: f.due_date as string,
                startHour: 9,
                startMin: 0,
                durationMins: 30,
                type: "followup" as const,
                color: "followup",
              }));
            setEvents([...mapped, ...followUps]);
          });
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const eventsForDay = (dateStr: string) =>
    events.filter(e => e.date === dateStr);

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  const weekLabel = `${weekDays[0].toLocaleDateString("en-ZA", { day: "numeric", month: "short" })} – ${weekDays[4].toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <>
      <Header
        title="Calendar"
        subtitle="Meetings, follow-ups, and communications"
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {/* Graph pending notice */}
            <span style={{ fontSize: 11, color: "var(--accent-amber)", background: "#fffbeb", border: "1px solid #fde68a", padding: "3px 10px", borderRadius: 20, fontWeight: 500, whiteSpace: "nowrap" }}>
              Live Teams sync pending admin consent
            </span>
            <Link href="/settings">
              <button className="btn-secondary" style={{ fontSize: 12 }}>Integration Status</button>
            </Link>
          </div>
        }
      />

      {/* Calendar toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)", position: "sticky", top: 60, zIndex: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={goToday}>Today</button>
          <div style={{ display: "flex", gap: 2 }}>
            <button onClick={prevWeek} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "6px 0 0 6px", padding: "5px 10px", cursor: "pointer", color: "var(--text-secondary)" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={nextWeek} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderLeft: "none", borderRadius: "0 6px 6px 0", padding: "5px 10px", cursor: "pointer", color: "var(--text-secondary)" }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{weekLabel}</span>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {/* Legend */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {[
              { label: "Meeting", type: "meeting" },
              { label: "Communication", type: "communication" },
              { label: "Follow-up", type: "followup" },
            ].map(l => (
              <div key={l.type} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: TYPE_COLORS[l.type as keyof typeof TYPE_COLORS].border, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* View toggle */}
          <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            {(["week", "day"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "5px 14px", fontSize: 12, border: "none", cursor: "pointer",
                  background: view === v ? "var(--accent-green)" : "var(--bg-elevated)",
                  color: view === v ? "white" : "var(--text-secondary)",
                  fontWeight: view === v ? 600 : 400,
                }}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div style={{ overflowX: "auto", overflowY: "auto", flex: 1 }}>
        <div style={{ minWidth: view === "week" ? 700 : 400 }}>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: `64px repeat(${view === "week" ? 5 : 1}, 1fr)`, borderBottom: "1px solid var(--border)", position: "sticky", top: 109, zIndex: 20, background: "var(--bg-surface)" }}>
            <div style={{ padding: "10px 0", borderRight: "1px solid var(--border)" }} />
            {(view === "week" ? weekDays : [currentDate]).map(day => {
              const ds = toDateStr(day);
              const isToday = ds === today;
              return (
                <div
                  key={ds}
                  onClick={() => { setCurrentDate(day); setView("day"); }}
                  style={{ padding: "10px 12px", textAlign: "center", borderRight: "1px solid var(--border)", cursor: "pointer" }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: isToday ? "var(--accent-green)" : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {day.toLocaleDateString("en-ZA", { weekday: "short" })}
                  </div>
                  <div style={{
                    fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginTop: 2,
                    color: isToday ? "white" : "var(--text-primary)",
                    background: isToday ? "var(--accent-green)" : "transparent",
                    width: 36, height: 36, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "2px auto 0",
                  }}>
                    {day.getDate()}
                  </div>
                  {eventsForDay(ds).length > 0 && (
                    <div style={{ fontSize: 10, color: "var(--accent-green)", marginTop: 3, fontWeight: 600 }}>
                      {eventsForDay(ds).length} event{eventsForDay(ds).length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div style={{ position: "relative" }}>
            {HOURS.map(hour => (
              <div key={hour} style={{ display: "grid", gridTemplateColumns: `64px repeat(${view === "week" ? 5 : 1}, 1fr)`, minHeight: SLOT_HEIGHT }}>
                <div style={{ padding: "0 10px", borderRight: "1px solid var(--border)", textAlign: "right", paddingTop: 4 }}>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>{formatHour(hour)}</span>
                </div>
                {(view === "week" ? weekDays : [currentDate]).map(day => {
                  const ds = toDateStr(day);
                  const dayEvents = eventsForDay(ds).filter(e => e.startHour === hour);
                  return (
                    <div key={ds} style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border-light)", minHeight: SLOT_HEIGHT, position: "relative", padding: "2px 4px" }}>
                      {dayEvents.map(ev => {
                        const colors = TYPE_COLORS[ev.type as keyof typeof TYPE_COLORS] || TYPE_COLORS.communication;
                        const heightPx = Math.max((ev.durationMins / 60) * SLOT_HEIGHT - 4, 22);
                        return (
                          <div
                            key={ev.id}
                            style={{
                              background: colors.bg,
                              border: `1px solid ${colors.border}`,
                              borderLeft: `3px solid ${colors.border}`,
                              borderRadius: 6,
                              padding: "3px 7px",
                              marginBottom: 2,
                              height: heightPx,
                              overflow: "hidden",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 700, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</div>
                            <div style={{ fontSize: 10, color: colors.text, opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.client}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Current time indicator */}
            {(() => {
              const now = new Date();
              const nowStr = toDateStr(now);
              const isThisWeek = view === "week" ? weekDays.some(d => toDateStr(d) === nowStr) : toDateStr(currentDate) === nowStr;
              if (!isThisWeek) return null;
              const topPx = ((now.getHours() - 7) * SLOT_HEIGHT) + (now.getMinutes() / 60) * SLOT_HEIGHT;
              if (topPx < 0) return null;
              return (
                <div style={{ position: "absolute", left: 64, right: 0, top: topPx, height: 2, background: "var(--accent-green)", zIndex: 10, pointerEvents: "none" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent-green)", position: "absolute", left: -5, top: -4 }} />
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Empty state if no events */}
      {!loading && events.length === 0 && (
        <div className="empty-state" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <div className="empty-state-icon">
            <svg width="22" height="22" fill="none" stroke="var(--text-muted)" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="empty-state-title">No events this week</div>
          <div className="empty-state-subtitle">Log communications and follow-ups to see them here. Teams meetings will appear once the Microsoft Graph integration is approved.</div>
        </div>
      )}
    </>
  );
}
