"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
interface ClientOption { id: string; name: string; industry?: string; website?: string; contacts: { name: string; email: string }[] }

interface SuccessCriteria { id: string; criteria: string; measure: string; }

export default function NewPOCPage() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("Demonstrate that the proposed solution meets the client's core requirements within a controlled environment before full development commences.");
  const [scope, setScope] = useState("");
  const [outOfScope, setOutOfScope] = useState("");
  const [duration, setDuration] = useState("2 weeks");
  const [resources, setResources] = useState("1 x Developer, 1 x CSM");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [criteria, setCriteria] = useState<SuccessCriteria[]>([
    { id: "1", criteria: "Core user journey completes end-to-end", measure: "User can complete the full workflow without errors" },
    { id: "2", criteria: "Performance meets baseline", measure: "Page load under 3 seconds on standard connection" },
    { id: "3", criteria: "Client approval received", measure: "Stakeholder sign-off on POC demo session" },
  ]);

  const addCriteria = () => setCriteria(p => [...p, { id: Date.now().toString(), criteria: "", measure: "" }]);
  const removeCriteria = (id: string) => setCriteria(p => p.filter(c => c.id !== id));

  const selectedClient = clients.find(c => c.id === clientId);

  useEffect(() => {
    fetch("/api/db/clients").then(r => r.json()).then(d => setClients(d.clients || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const prefill = (() => {
      try { return sessionStorage.getItem("cshub_template_prefill"); } catch {}
      try { return localStorage.getItem("cshub_template_prefill"); } catch {}
      return null;
    })();
    if (prefill) {
      try {
        const data = JSON.parse(prefill);
        if (data.objective) setObjective(data.objective);
        if (data.duration) setDuration(data.duration);
        if (data.resources) setResources(data.resources);
        if (data.criteria) setCriteria(data.criteria);
      } catch {}
      try { sessionStorage.removeItem("cshub_template_prefill"); } catch {}
        try { localStorage.removeItem("cshub_template_prefill"); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSavePOC = async () => {
    setSaveError("");
    if (!title.trim()) { setSaveError("Please add a POC title before saving."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/db/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || null,
          type: "poc",
          title,
          version: "v1.0",
          status: "draft",
          contentJson: { objective, scope, outOfScope, duration, resources, criteria },
          totalValue: 0,
          currency: "ZAR",
          createdBy: "Jonathan",
        }),
      });
      if (!res.ok) throw new Error("Failed to save POC");
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save POC");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
          <Header
        title="New POC"
        subtitle="Proof of Concept document"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/documents"><button className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button></Link>
            <button className="btn-primary" style={{ fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={handleSavePOC} disabled={saving}>{saving ? "Saving..." : "Save POC"}</button>
          </div>
        }
      />

      {saveError && (
        <div style={{ margin: "16px 24px 0", padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--accent-red)" }}>
          {saveError}
        </div>
      )}

      {saved && (
        <div style={{ margin: "16px 24px 0", padding: "12px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#10b981" }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          POC saved to database. <a href="/documents" style={{ color: "#10b981", textDecoration: "underline" }}>View in Documents</a>
          <button onClick={() => setSaved(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#10b981", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
      )}

      <div className="two-col-layout" style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>POC Details</div>
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Client</label>
                <select className="input" value={clientId} onChange={e => { setClientId(e.target.value); const c = clients.find(cl => cl.id === e.target.value); if (c && !title) setTitle(`POC — ${c.name}`); }} style={{ background: "var(--bg-elevated)" }}>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>POC Title</label>
                <input className="input" placeholder="e.g. POC — Dashboard Redesign" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Duration</label>
                <input className="input" placeholder="e.g. 2 weeks" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Resources Required</label>
                <input className="input" placeholder="e.g. 1 x Developer, 1 x CSM" value={resources} onChange={e => setResources(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>Objective</div>
            <textarea className="input" rows={3} style={{ resize: "vertical" }} value={objective} onChange={e => setObjective(e.target.value)} />
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>In Scope</div>
            <textarea className="input" rows={4} style={{ resize: "vertical" }} placeholder="Describe what this POC will cover..." value={scope} onChange={e => setScope(e.target.value)} />
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>Out of Scope</div>
            <textarea className="input" rows={3} style={{ resize: "vertical" }} placeholder="Describe what is explicitly excluded..." value={outOfScope} onChange={e => setOutOfScope(e.target.value)} />
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Success Criteria</div>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={addCriteria}>+ Add Criteria</button>
            </div>
            <div style={{ padding: "10px 20px 4px", background: "var(--bg-elevated)", display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Criteria</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Measure of Success</div>
              <div />
            </div>
            {criteria.map(c => (
              <div key={c.id} className="form-grid" style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: 10, alignItems: "center" }}>
                <input className="input" style={{ padding: "6px 10px" }} placeholder="Success criteria" value={c.criteria} onChange={e => setCriteria(p => p.map(x => x.id === c.id ? { ...x, criteria: e.target.value } : x))} />
                <input className="input" style={{ padding: "6px 10px" }} placeholder="How it will be measured" value={c.measure} onChange={e => setCriteria(p => p.map(x => x.id === c.id ? { ...x, measure: e.target.value } : x))} />
                <button onClick={() => removeCriteria(c.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedClient && (
            <div className="card">
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Client</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{selectedClient.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{selectedClient.industry}</div>
            </div>
          )}
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>POC Summary</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Success Criteria", value: criteria.length },
                { label: "Duration", value: duration || "Not set" },
                { label: "Resources", value: resources || "Not set" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Save as Draft", "Send to Client", "Download PDF", "Download Word"].map(action => (
                <button key={action} className="btn-secondary" style={{ fontSize: 12, justifyContent: "flex-start" }}>{action}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



