"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface TestScenario {
  id: string;
  description: string;
  result: "pass" | "fail" | "partial" | "not_tested";
  notes: string;
}

interface OutstandingIssue {
  id: string;
  description: string;
  severity: "critical" | "major" | "minor";
  resolution: string;
}

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  client_id: string | null;
}

const resultColors = {
  pass: { bg: "#f0fdf4", color: "#15803d", label: "Pass" },
  fail: { bg: "#fef2f2", color: "#dc2626", label: "Fail" },
  partial: { bg: "#fffbeb", color: "#b45309", label: "Partial" },
  not_tested: { bg: "#f8fafc", color: "#94a3b8", label: "Not Tested" },
};

const severityColors = {
  critical: { bg: "#fef2f2", color: "#dc2626", label: "Critical" },
  major: { bg: "#fffbeb", color: "#b45309", label: "Major" },
  minor: { bg: "#f0fdf4", color: "#15803d", label: "Minor" },
};

const signOffMethods = [
  { value: "email_reply", label: "Email Reply Confirmation" },
  { value: "esignature", label: "E-Signature (in CS Hub)" },
  { value: "printed_pdf", label: "Printed & Scanned PDF" },
];

export default function UATBuilderPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("v1.0");
  const [testSummary, setTestSummary] = useState("");
  const [signOffMethod, setSignOffMethod] = useState("email_reply");
  const [signOffDeclaration, setSignOffDeclaration] = useState(
    "I/We confirm that the above UAT has been completed and the results are accurate. Outstanding issues noted above are accepted or have agreed resolution timelines."
  );
  const [scenarios, setScenarios] = useState<TestScenario[]>([
    { id: "1", description: "", result: "not_tested", notes: "" },
    { id: "2", description: "", result: "not_tested", notes: "" },
  ]);
  const [issues, setIssues] = useState<OutstandingIssue[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const filteredProjects = clientId
    ? projects.filter(p => p.client_id === clientId)
    : projects;

  useEffect(() => {
    fetch("/api/db/clients").then(r => r.json()).then(d => setClients(d.clients || []));
    fetch("/api/db/projects").then(r => r.json()).then(d => setProjects(d.projects || []));
    const prefill = sessionStorage.getItem("cshub_template_prefill");
    if (prefill) {
      try {
        const data = JSON.parse(prefill);
        if (data.scenarios) setScenarios(data.scenarios);
        if (data.signOffDeclaration) setSignOffDeclaration(data.signOffDeclaration);
      } catch {}
      sessionStorage.removeItem("cshub_template_prefill");
    }
  }, []);

  const addScenario = () => setScenarios(p => [...p, { id: Date.now().toString(), description: "", result: "not_tested", notes: "" }]);
  const updateScenario = (id: string, field: keyof TestScenario, value: string) =>
    setScenarios(p => p.map(s => s.id === id ? { ...s, [field]: value } : s));
  const removeScenario = (id: string) => setScenarios(p => p.filter(s => s.id !== id));

  const addIssue = () => setIssues(p => [...p, { id: Date.now().toString(), description: "", severity: "minor", resolution: "" }]);
  const updateIssue = (id: string, field: keyof OutstandingIssue, value: string) =>
    setIssues(p => p.map(i => i.id === id ? { ...i, [field]: value } : i));
  const removeIssue = (id: string) => setIssues(p => p.filter(i => i.id !== id));

  const passCount = scenarios.filter(s => s.result === "pass").length;
  const failCount = scenarios.filter(s => s.result === "fail").length;
  const partialCount = scenarios.filter(s => s.result === "partial").length;
  const overallStatus = failCount > 0 ? "fail" : partialCount > 0 ? "partial" : passCount === scenarios.length ? "pass" : "not_tested";

  const handleSave = async () => {
    if (!title.trim()) { setSaveError("Please add a UAT document title."); return; }
    setSaveError(""); setSaving(true);
    try {
      const res = await fetch("/api/db/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || null,
          projectId: projectId || null,
          type: "uat",
          title,
          version,
          status: "draft",
          contentJson: {
            testSummary, signOffMethod, signOffDeclaration,
            scenarios, issues, overallStatus,
            passCount, failCount, partialCount,
          },
          totalValue: 0,
          currency: "ZAR",
          createdBy: "Jonathan",
        }),
      });
      if (!res.ok) throw new Error("Failed to save UAT document");
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <>
        <Header title="UAT Sign-off" subtitle="Document saved successfully" />
        <div style={{ padding: 32, maxWidth: 600 }}>
          <div style={{ padding: 24, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#15803d", marginBottom: 4 }}>UAT Document Saved</div>
            <div style={{ fontSize: 13, color: "#166534" }}>"{title}" has been saved to Documents.</div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <Link href="/documents"><button className="btn-primary">View All Documents</button></Link>
            <button className="btn-secondary" onClick={() => setSaved(false)}>Create Another</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="New UAT Sign-off"
        subtitle="User Acceptance Testing document with sign-off tracking"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/documents"><button className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button></Link>
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : "Save UAT Document"}
            </button>
          </div>
        }
      />

      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, maxWidth: 1100 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {saveError && (
            <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626" }}>
              {saveError}
            </div>
          )}

          {/* Header info */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Document Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>UAT Title</label>
                <input className="input" placeholder="e.g. ABC Retail — Loyalty Platform UAT" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Version</label>
                <input className="input" value={version} onChange={e => setVersion(e.target.value)} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Test Summary / Scope</label>
              <textarea className="input" rows={3} placeholder="Brief description of what was tested and the scope of this UAT..." value={testSummary} onChange={e => setTestSummary(e.target.value)} />
            </div>
          </div>

          {/* Test scenarios */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Test Scenarios</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                  {passCount} passed · {failCount} failed · {partialCount} partial · {scenarios.filter(s => s.result === "not_tested").length} not tested
                </div>
              </div>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={addScenario}>+ Add Scenario</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {scenarios.map((scenario, i) => (
                <div key={scenario.id} style={{ background: "var(--bg-elevated)", borderRadius: 10, padding: 14, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", minWidth: 20, paddingTop: 10 }}>{i + 1}</span>
                    <input
                      className="input"
                      placeholder="Describe the test scenario..."
                      value={scenario.description}
                      onChange={e => updateScenario(scenario.id, "description", e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      {(["pass", "fail", "partial", "not_tested"] as const).map(r => (
                        <button
                          key={r}
                          onClick={() => updateScenario(scenario.id, "result", r)}
                          style={{
                            padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                            border: "1px solid", cursor: "pointer",
                            background: scenario.result === r ? resultColors[r].bg : "var(--bg-surface)",
                            color: scenario.result === r ? resultColors[r].color : "var(--text-muted)",
                            borderColor: scenario.result === r ? resultColors[r].color : "var(--border)",
                          }}
                        >
                          {resultColors[r].label}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => removeScenario(scenario.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, paddingTop: 4 }}>×</button>
                  </div>
                  <div style={{ paddingLeft: 30 }}>
                    <input className="input" placeholder="Notes or comments on this test..." value={scenario.notes} onChange={e => updateScenario(scenario.id, "notes", e.target.value)} style={{ fontSize: 12 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outstanding issues */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Outstanding Issues</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Issues identified during testing — include agreed resolution</div>
              </div>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={addIssue}>+ Add Issue</button>
            </div>
            {issues.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "16px 0" }}>No outstanding issues — all scenarios passed, or click "Add Issue" to record one</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {issues.map((issue, i) => (
                  <div key={issue.id} style={{ background: "var(--bg-elevated)", borderRadius: 10, padding: 14, border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", minWidth: 20 }}>{i + 1}</span>
                      <input className="input" placeholder="Describe the issue..." value={issue.description} onChange={e => updateIssue(issue.id, "description", e.target.value)} style={{ flex: 1 }} />
                      <select
                        value={issue.severity}
                        onChange={e => updateIssue(issue.id, "severity", e.target.value)}
                        style={{
                          padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                          border: `1px solid ${severityColors[issue.severity as keyof typeof severityColors].color}`,
                          background: severityColors[issue.severity as keyof typeof severityColors].bg,
                          color: severityColors[issue.severity as keyof typeof severityColors].color,
                          cursor: "pointer",
                        }}
                      >
                        <option value="critical">Critical</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                      </select>
                      <button onClick={() => removeIssue(issue.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}>×</button>
                    </div>
                    <div style={{ paddingLeft: 30 }}>
                      <input className="input" placeholder="Agreed resolution or timeline..." value={issue.resolution} onChange={e => updateIssue(issue.id, "resolution", e.target.value)} style={{ fontSize: 12 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sign-off declaration */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Sign-off Declaration</div>
            <textarea className="input" rows={4} value={signOffDeclaration} onChange={e => setSignOffDeclaration(e.target.value)} />
            <div style={{ marginTop: 16, padding: 16, background: "var(--bg-elevated)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                <span>Client Signature</span>
                <span>Date</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-light)", paddingTop: 8, marginTop: 8 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>___________________________</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>___________________________</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-light)", paddingTop: 8, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>URUP Connect Representative</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>Jonathan ___________________________</div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>___________________________</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Link to Client & Project</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Client</label>
              <select className="input" value={clientId} onChange={e => { setClientId(e.target.value); setProjectId(""); }} style={{ background: "var(--bg-elevated)" }}>
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Project</label>
              <select className="input" value={projectId} onChange={e => setProjectId(e.target.value)} style={{ background: "var(--bg-elevated)" }} disabled={!clientId}>
                <option value="">{clientId ? "Select project..." : "Select client first"}</option>
                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Sign-off Method</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {signOffMethods.map(m => (
                <label key={m.value} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 10px", borderRadius: 8, background: signOffMethod === m.value ? "var(--accent-green-bg)" : "var(--bg-elevated)", border: `1px solid ${signOffMethod === m.value ? "var(--accent-green)" : "var(--border)"}` }}>
                  <input type="radio" name="signOffMethod" value={m.value} checked={signOffMethod === m.value} onChange={e => setSignOffMethod(e.target.value)} style={{ accentColor: "var(--accent-green)" }} />
                  <span style={{ fontSize: 12, color: "var(--text-primary)" }}>{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Overall Result</div>
            <div style={{ padding: 16, borderRadius: 10, textAlign: "center", background: resultColors[overallStatus as keyof typeof resultColors]?.bg || "#f8fafc", border: `1px solid ${resultColors[overallStatus as keyof typeof resultColors]?.color || "#94a3b8"}` }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: resultColors[overallStatus as keyof typeof resultColors]?.color || "#94a3b8" }}>
                {resultColors[overallStatus as keyof typeof resultColors]?.label || "Not Tested"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                {passCount}/{scenarios.length} scenarios passed
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
