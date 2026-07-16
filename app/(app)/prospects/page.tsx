"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/Toast";

interface Prospect {
  id: string; name: string; industry: string | null
  contact_name: string | null; contact_email: string | null; contact_phone: string | null
  source: string | null; estimated_value: number; status: string; notes: string | null
  converted_to_client_id: string | null; converted_client_name: string | null; converted_at: string | null
  meeting_count: number; total_fuel_cost: number; project_count: number
  created_at: string;
}
interface Meeting {
  id: string; meeting_date: string; summary: string | null; location: string | null
  distance_km: number | null; fuel_cost: number;
}

const STATUS_OPTIONS = ["lead", "meeting_scheduled", "proposal_sent", "accepted", "declined", "converted"];
const STATUS_LABEL: Record<string, string> = {
  lead: "Lead", meeting_scheduled: "Meeting Scheduled", proposal_sent: "Proposal Sent",
  accepted: "Accepted", declined: "Declined", converted: "Converted",
};
const STATUS_BADGE: Record<string, string> = {
  lead: "badge-gray", meeting_scheduled: "badge-blue", proposal_sent: "badge-amber",
  accepted: "badge-green", declined: "badge-red", converted: "badge-green",
};

export default function ProspectsPage() {
  const { showToast } = useToast();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showLogMeeting, setShowLogMeeting] = useState(false);

  const [newName, setNewName] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);

  const [mDate, setMDate] = useState(new Date().toISOString().slice(0, 10));
  const [mSummary, setMSummary] = useState("");
  const [mLocation, setMLocation] = useState("");
  const [mDistance, setMDistance] = useState("");
  const [mFuelCost, setMFuelCost] = useState("");
  const [savingMeeting, setSavingMeeting] = useState(false);

  const loadProspects = useCallback(() => {
    fetch("/api/db/prospects").then(r => r.json()).then(d => setProspects(d.prospects || [])).catch(() => setProspects([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadProspects(); }, [loadProspects]);

  const openDetail = async (p: Prospect) => {
    setSelected(p);
    try {
      const res = await fetch(`/api/db/prospects?id=${p.id}`);
      const data = await res.json();
      setMeetings(data.meetings || []);
    } catch { setMeetings([]); }
  };

  const createProspect = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/db/prospects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName, industry: newIndustry, contactName: newContactName,
          contactEmail: newContactEmail, contactPhone: newContactPhone,
          source: newSource, estimatedValue: parseFloat(newValue) || 0,
        }),
      });
      if (!res.ok) throw new Error();
      showToast("Prospect added", "success");
      setNewName(""); setNewIndustry(""); setNewContactName(""); setNewContactEmail("");
      setNewContactPhone(""); setNewSource(""); setNewValue(""); setShowNew(false);
      loadProspects();
    } catch {
      showToast("Couldn't add prospect - try again", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/db/prospects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      showToast("Status updated", "success");
      loadProspects();
      if (selected?.id === id) setSelected({ ...selected, status });
    } catch {
      showToast("Couldn't update status", "error");
    }
  };

  const convertProspect = async (id: string) => {
    try {
      const res = await fetch("/api/db/prospects/convert", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prospectId: id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Conversion failed");
      showToast(`Converted to a real client record`, "success");
      loadProspects();
      setSelected(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Couldn't convert", "error");
    }
  };

  const logMeeting = async () => {
    if (!selected) return;
    setSavingMeeting(true);
    try {
      await fetch("/api/db/prospect-meetings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId: selected.id, meetingDate: mDate, summary: mSummary,
          location: mLocation, distanceKm: parseFloat(mDistance) || null, fuelCost: parseFloat(mFuelCost) || 0,
        }),
      });
      showToast("Meeting logged", "success");
      setMSummary(""); setMLocation(""); setMDistance(""); setMFuelCost(""); setShowLogMeeting(false);
      const res = await fetch(`/api/db/prospects?id=${selected.id}`);
      const data = await res.json();
      setMeetings(data.meetings || []);
      loadProspects();
    } catch {
      showToast("Couldn't log meeting - try again", "error");
    } finally {
      setSavingMeeting(false);
    }
  };

  const filtered = prospects.filter(p => {
    const matchesSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.contact_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalProspects = prospects.length;
  const convertedCount = prospects.filter(p => p.status === "converted").length;
  const conversionRate = totalProspects > 0 ? Math.round((convertedCount / totalProspects) * 100) : 0;
  const withRealProject = prospects.filter(p => p.status === "converted" && p.project_count > 0).length;
  const totalFuelCost = prospects.reduce((s, p) => s + Number(p.total_fuel_cost || 0), 0);
  const pipelineValue = prospects.filter(p => p.status !== "converted" && p.status !== "declined").reduce((s, p) => s + Number(p.estimated_value || 0), 0);

  return (
    <>
      <Header
        title="Prospects"
        subtitle="Sales pipeline, meeting history, and conversion tracking"
        actions={<button className="btn-primary" style={{ fontSize: 12 }} onClick={() => setShowNew(true)}>+ New Prospect</button>}
      />

      <div style={{ padding: 24 }}>
        <div className="stat-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
          <div className="stat-card card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Total Prospects</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{totalProspects}</div>
          </div>
          <div className="stat-card card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Onboarded</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-green)" }}>{convertedCount}</div>
          </div>
          <div className="stat-card card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Conversion Rate</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{conversionRate}%</div>
          </div>
          <div className="stat-card card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>With a Real Project</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{withRealProject}<span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}> / {convertedCount}</span></div>
          </div>
          <div className="stat-card card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 6 }}>Fuel Cost (All Visits)</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>R {totalFuelCost.toLocaleString("en-ZA")}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input className="input" style={{ maxWidth: 260 }} placeholder="Search prospects or old clients..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input" style={{ maxWidth: 200, background: "var(--bg-elevated)" }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-secondary)", alignSelf: "center" }}>
            Pipeline value (open): <strong style={{ color: "var(--text-primary)" }}>R {pipelineValue.toLocaleString("en-ZA")}</strong>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No prospects found</div>
            <div className="empty-state-subtitle">{prospects.length === 0 ? "Add your first prospect to start tracking the pipeline." : "Try a different search or filter."}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(p => (
              <div key={p.id} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", flexWrap: "wrap" }} onClick={() => openDetail(p)}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.contact_name || "—"} {p.industry ? `· ${p.industry}` : ""}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.meeting_count} meeting{p.meeting_count !== 1 ? "s" : ""}</div>
                {p.estimated_value > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-green)" }}>R {Number(p.estimated_value).toLocaleString("en-ZA")}</span>}
                {p.status === "converted" && (
                  p.project_count > 0
                    ? <span className="badge badge-green">Onboarded + Active Project</span>
                    : <span className="badge badge-amber">Onboarded - No Project Yet</span>
                )}
                <span className={`badge ${STATUS_BADGE[p.status]}`}>{STATUS_LABEL[p.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 460, boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>New Prospect</h3>
              <button onClick={() => setShowNew(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 18, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="input" placeholder="Company name *" value={newName} onChange={e => setNewName(e.target.value)} />
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input className="input" placeholder="Industry" value={newIndustry} onChange={e => setNewIndustry(e.target.value)} />
                <input className="input" placeholder="Source (referral, website...)" value={newSource} onChange={e => setNewSource(e.target.value)} />
              </div>
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input className="input" placeholder="Contact name" value={newContactName} onChange={e => setNewContactName(e.target.value)} />
                <input className="input" placeholder="Contact email" value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)} />
              </div>
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input className="input" placeholder="Contact phone" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} />
                <input className="input" type="number" placeholder="Estimated value (ZAR)" value={newValue} onChange={e => setNewValue(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowNew(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 1, opacity: saving ? 0.7 : 1 }} onClick={createProspect} disabled={saving}>{saving ? "Saving..." : "Add Prospect"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{selected.name}</h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>{selected.contact_name} {selected.contact_email ? `· ${selected.contact_email}` : ""}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 18, cursor: "pointer" }}>×</button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {selected.status === "converted" ? (
                <div style={{ padding: "12px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-green)", marginBottom: 4 }}>Onboarded {selected.converted_at ? new Date(selected.converted_at).toLocaleDateString("en-ZA") : ""}</div>
                  <Link href={`/clients/${selected.converted_to_client_id}`}><button className="btn-secondary" style={{ fontSize: 12 }}>Open Client Profile</button></Link>
                  {selected.project_count === 0 && (
                    <p style={{ fontSize: 12, color: "var(--accent-amber)", margin: "8px 0 0" }}>Onboarded, but no project has been created for them yet.</p>
                  )}
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Status</label>
                  <select className="input" value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                    {STATUS_OPTIONS.filter(s => s !== "converted").map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                  {selected.status === "accepted" && (
                    <button className="btn-primary" style={{ fontSize: 12, marginTop: 10, width: "100%" }} onClick={() => convertProspect(selected.id)}>
                      Convert to Client - Create Real Record
                    </button>
                  )}
                </div>
              )}

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Meeting History</div>
                  <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => setShowLogMeeting(o => !o)}>{showLogMeeting ? "Cancel" : "+ Log Meeting"}</button>
                </div>

                {showLogMeeting && (
                  <div style={{ padding: 14, background: "var(--bg-elevated)", borderRadius: 10, marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <input className="input" type="date" value={mDate} onChange={e => setMDate(e.target.value)} />
                      <input className="input" placeholder="Location" value={mLocation} onChange={e => setMLocation(e.target.value)} />
                    </div>
                    <textarea className="input" rows={2} placeholder="What was discussed..." value={mSummary} onChange={e => setMSummary(e.target.value)} style={{ resize: "vertical" }} />
                    <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <input className="input" type="number" placeholder="Distance (km)" value={mDistance} onChange={e => setMDistance(e.target.value)} />
                      <input className="input" type="number" placeholder="Fuel cost (ZAR)" value={mFuelCost} onChange={e => setMFuelCost(e.target.value)} />
                    </div>
                    <button className="btn-primary" style={{ fontSize: 12, opacity: savingMeeting ? 0.7 : 1 }} onClick={logMeeting} disabled={savingMeeting}>
                      {savingMeeting ? "Saving..." : "Save Meeting"}
                    </button>
                  </div>
                )}

                {meetings.length === 0 ? (
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>No meetings logged yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {meetings.map(m => (
                      <div key={m.id} style={{ padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{new Date(m.meeting_date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</span>
                          {m.fuel_cost > 0 && <span style={{ fontSize: 11, color: "var(--accent-amber)" }}>Fuel: R {Number(m.fuel_cost).toLocaleString("en-ZA")}</span>}
                        </div>
                        {m.location && <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{m.location}{m.distance_km ? ` · ${m.distance_km}km` : ""}</div>}
                        {m.summary && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{m.summary}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
