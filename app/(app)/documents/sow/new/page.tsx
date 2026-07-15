"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
interface ClientOption { id: string; name: string; industry?: string; website?: string; contacts: { name: string; email: string }[] }

interface Deliverable { id: string; title: string; description: string; milestone: string; }
interface Assumption { id: string; text: string; }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>{title}</div>
      {children}
    </div>
  );
}

export default function NewSOWPage() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [scope, setScope] = useState("This Statement of Work covers the design, development, testing and deployment of the agreed solution as outlined in the associated quote and discovery sessions.");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("50% deposit upon acceptance. 50% balance upon go-live.");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    { id: "1", title: "Discovery & Requirements Sign-off", description: "Documented requirements signed off by client.", milestone: "Week 1" },
    { id: "2", title: "Development Complete", description: "All agreed features built and unit tested.", milestone: "Week 4" },
    { id: "3", title: "UAT Complete", description: "Client testing completed and sign-off received.", milestone: "Week 5" },
    { id: "4", title: "Production Deployment", description: "Solution deployed to production environment.", milestone: "Week 6" },
  ]);

  const [assumptions, setAssumptions] = useState<Assumption[]>([
    { id: "1", text: "Client will provide timely feedback within 48 hours of each review." },
    { id: "2", text: "Client will supply all branding assets, content and data required for the solution." },
    { id: "3", text: "Any changes to scope after sign-off will require a change request and may affect timeline and cost." },
    { id: "4", text: "Infrastructure and hosting costs are excluded unless explicitly stated in the quote." },
  ]);

  const [exclusions, setExclusions] = useState([
    "Third-party software licensing costs",
    "Ongoing maintenance and support (covered under a separate SLA)",
    "Changes to scope not documented in this SOW",
    "Data migration from legacy systems unless explicitly included",
  ]);

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
        if (data.scope) setScope(data.scope);
        if (data.deliverables) setDeliverables(data.deliverables);
        if (data.assumptions) setAssumptions(data.assumptions);
        if (data.paymentTerms) setPaymentTerms(data.paymentTerms);
        if (data.exclusions) setExclusions(data.exclusions);
      } catch {}
      try { sessionStorage.removeItem("cshub_template_prefill"); } catch {}
        try { localStorage.removeItem("cshub_template_prefill"); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addDeliverable = () => setDeliverables(p => [...p, { id: Date.now().toString(), title: "", description: "", milestone: "" }]);
  const addAssumption = () => setAssumptions(p => [...p, { id: Date.now().toString(), text: "" }]);
  const removeDeliverable = (id: string) => setDeliverables(p => p.filter(d => d.id !== id));
  const removeAssumption = (id: string) => setAssumptions(p => p.filter(a => a.id !== id));

  const selectedClient = clients.find(c => c.id === clientId);

  const handleSaveSOW = async () => {
    setSaveError("");
    if (!title.trim()) { setSaveError("Please add a SOW title before saving."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/db/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || null,
          type: "sow",
          title,
          version: "v1.0",
          status: "draft",
          contentJson: { projectName, scope, startDate, endDate, paymentTerms, deliverables, assumptions, exclusions },
          totalValue: 0,
          currency: "ZAR",
          createdBy: "Jonathan",
        }),
      });
      if (!res.ok) throw new Error("Failed to save SOW");
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save SOW");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
          <Header
        title="New SOW"
        subtitle="Statement of Work"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/documents"><button className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button></Link>
            <button className="btn-secondary" style={{ fontSize: 12 }}>Preview PDF</button>
            <button className="btn-primary" style={{ fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={handleSaveSOW} disabled={saving}>{saving ? "Saving..." : "Save SOW"}</button>
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
          SOW saved to database. <a href="/documents" style={{ color: "#10b981", textDecoration: "underline" }}>View in Documents</a>
          <button onClick={() => setSaved(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#10b981", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
      )}

      <div className="two-col-layout" style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <Section title="SOW Details">
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Client</label>
                <select className="input" value={clientId} onChange={e => { setClientId(e.target.value); const c = clients.find(cl => cl.id === e.target.value); if (c && !title) setTitle(`SOW — ${c.name}`); }} style={{ background: "var(--bg-elevated)" }}>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>SOW Title</label>
                <input className="input" placeholder="e.g. SOW — Black Friday Campaign 2026" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Project Name</label>
                <input className="input" placeholder="e.g. Black Friday Campaign 2026" value={projectName} onChange={e => setProjectName(e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title="Project Scope">
            <textarea className="input" rows={4} style={{ resize: "vertical" }} value={scope} onChange={e => setScope(e.target.value)} />
          </Section>

          <Section title="Timeline">
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Estimated Start Date</label>
                <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Estimated End Date</label>
                <input className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
          </Section>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Deliverables & Milestones</div>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={addDeliverable}>+ Add Deliverable</button>
            </div>
            {deliverables.map((d, i) => (
              <div key={d.id} className="form-grid" style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr 120px 28px", gap: 10, alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Deliverable {i + 1}</div>
                  <input className="input" style={{ padding: "6px 10px" }} placeholder="Title" value={d.title} onChange={e => setDeliverables(p => p.map(x => x.id === d.id ? { ...x, title: e.target.value } : x))} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Description</div>
                  <input className="input" style={{ padding: "6px 10px" }} placeholder="Description" value={d.description} onChange={e => setDeliverables(p => p.map(x => x.id === d.id ? { ...x, description: e.target.value } : x))} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Milestone</div>
                  <input className="input" style={{ padding: "6px 10px" }} placeholder="Week 1" value={d.milestone} onChange={e => setDeliverables(p => p.map(x => x.id === d.id ? { ...x, milestone: e.target.value } : x))} />
                </div>
                <button onClick={() => removeDeliverable(d.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, paddingTop: 22 }}>×</button>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Assumptions</div>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={addAssumption}>+ Add</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {assumptions.map((a) => (
                <div key={a.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input className="input" style={{ padding: "6px 10px" }} value={a.text} onChange={e => setAssumptions(p => p.map(x => x.id === a.id ? { ...x, text: e.target.value } : x))} />
                  <button onClick={() => removeAssumption(a.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, flexShrink: 0 }}>×</button>
                </div>
              ))}
            </div>
          </div>

          <Section title="Exclusions">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {exclusions.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="14" height="14" fill="none" stroke="var(--accent-red)" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{e}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Payment Terms">
            <textarea className="input" rows={3} style={{ resize: "vertical" }} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
          </Section>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedClient && (
            <div className="card">
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Client</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{selectedClient.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{selectedClient.industry}</div>
            </div>
          )}
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>SOW Summary</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Deliverables", value: deliverables.length },
                { label: "Assumptions", value: assumptions.length },
                { label: "Exclusions", value: exclusions.length },
                { label: "Timeline", value: startDate && endDate ? `${new Date(startDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })} – ${new Date(endDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}` : "Not set" },
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
              {["Save as Draft", "Send for Approval", "Download PDF", "Download Word"].map(action => (
                <button key={action} className="btn-secondary" style={{ fontSize: 12, justifyContent: "flex-start" }}>{action}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



