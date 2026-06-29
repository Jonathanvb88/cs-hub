"use client";
import { useState } from "react";
import Link from "next/link";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";
import { mockClients, mockProjects } from "@/lib/mockData";

interface SimilarProject {
  projectId: string;
  projectName: string;
  similarityScore: number;
  similarityReason: string;
  reuseEstimates: {
    journeyUrl: number;
    requirements: number;
    sow: number;
    quote: number;
    testCases: number;
    emailTemplates: number;
  };
}

interface ProjectIntelligenceResult {
  similarityAssessment: SimilarProject[];
  recommendation: string;
  estimatedTimeSavedHours: number;
}

export default function ProjectIntelligencePage() {
  const [clientId, setClientId] = useState("1");
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProjectIntelligenceResult | null>(null);
  const [error, setError] = useState("");

  const selectedClient = mockClients.find(c => c.id === clientId);
  const clientProjects = mockProjects.filter(p => p.clientId === clientId);

  const SAMPLE_REQUEST = `We would like to launch our Annual Black Friday Campaign again this year. Same as last year — full loyalty journey, email notifications when points are processed, and the bulk import spreadsheet for customer data. We may want to add a new SMS notification option this time.`;

  const handleSearch = async () => {
    if (!request.trim()) { setError("Please describe the new request first."); return; }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const projectsJson = clientProjects.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
      }));

      const systemPrompt = `You are a Project Intelligence assistant. Compare a new client request against previous project history and identify similar work with reuse potential.

Respond ONLY with valid JSON. No preamble, no markdown, no code fences.

JSON structure:
{
  "similarityAssessment": [
    {
      "projectId": "string",
      "projectName": "string",
      "similarityScore": integer 0 to 100,
      "similarityReason": "string — one sentence explanation",
      "reuseEstimates": {
        "journeyUrl": integer 0-100,
        "requirements": integer 0-100,
        "sow": integer 0-100,
        "quote": integer 0-100,
        "testCases": integer 0-100,
        "emailTemplates": integer 0-100
      }
    }
  ],
  "recommendation": "string — 2-3 sentences on what to reuse and how to start",
  "estimatedTimeSavedHours": number
}

Only include projects with similarity score above 30. Sort by similarity score descending.`;

      const userPrompt = `New request:
${request}

Client: ${selectedClient?.name}

Previous projects for this client:
${JSON.stringify(projectsJson, null, 2)}

Assess similarity and estimate reuse potential.`;

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: systemPrompt, user: userPrompt, maxTokens: 1000 }),
      });

      if (!response.ok) throw new Error("AI service error");
      const data = await response.json();
      const clean = data.content.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reuseColor = (score: number) =>
    score >= 80 ? "var(--accent-green)" : score >= 50 ? "var(--accent-amber)" : "var(--accent-red)";

  return (
    <AppLayout>
      <Header
        title="Project Intelligence"
        subtitle="AI searches previous projects for similar work and estimates reuse potential"
        actions={<Link href="/intelligence"><button className="btn-secondary" style={{ fontSize: 12 }}>Back</button></Link>}
      />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>

        {/* Input card */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
            Describe the New Request
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Client</label>
              <select className="input" value={clientId} onChange={e => setClientId(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {clientProjects.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
                  {clientProjects.length} previous project{clientProjects.length !== 1 ? "s" : ""} on record
                </div>
              )}
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>New Request Description</label>
                <button onClick={() => setRequest(SAMPLE_REQUEST)} style={{ background: "none", border: "none", fontSize: 11, color: "var(--accent-blue)", cursor: "pointer" }}>
                  Load sample
                </button>
              </div>
              <textarea className="input" rows={5} style={{ resize: "vertical" }}
                placeholder="Describe what the client has requested, or paste their email..."
                value={request} onChange={e => setRequest(e.target.value)} />
            </div>
          </div>
          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--accent-red)", marginBottom: 12 }}>
              {error}
            </div>
          )}
          <button
            className="btn-primary"
            style={{ fontSize: 13, opacity: loading ? 0.7 : 1 }}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching project history..." : "Search Similar Projects"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Time saved banner */}
            <div style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: 12, padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: "rgba(16,185,129,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="22" height="22" fill="none" stroke="var(--accent-green)" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--accent-green)", lineHeight: 1 }}>
                  ~{result.estimatedTimeSavedHours}h saved
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                  {result.recommendation}
                </div>
              </div>
            </div>

            {/* Similar projects */}
            {result.similarityAssessment?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {result.similarityAssessment.map((proj) => (
                  <div key={proj.projectId} className="card">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{proj.projectName}</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{proj.similarityReason}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: reuseColor(proj.similarityScore), lineHeight: 1 }}>
                          {proj.similarityScore}%
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>similarity</div>
                      </div>
                    </div>

                    <div style={{ paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                        Asset Reuse Estimates
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                        {Object.entries({
                          "Journey URL": proj.reuseEstimates.journeyUrl,
                          "Requirements": proj.reuseEstimates.requirements,
                          "SOW": proj.reuseEstimates.sow,
                          "Quote": proj.reuseEstimates.quote,
                          "Test Cases": proj.reuseEstimates.testCases,
                          "Email Templates": proj.reuseEstimates.emailTemplates,
                        }).map(([label, score]) => (
                          <div key={label} style={{ background: "var(--bg-elevated)", borderRadius: 8, padding: "10px 12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{label}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: reuseColor(score) }}>{score}%</span>
                            </div>
                            <div style={{ height: 4, background: "var(--bg-surface)", borderRadius: 2 }}>
                              <div style={{ height: "100%", borderRadius: 2, width: `${score}%`, background: reuseColor(score), transition: "width 0.4s" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <button className="btn-secondary" style={{ fontSize: 12 }}>View Project</button>
                      <button className="btn-secondary" style={{ fontSize: 12 }}>Reuse SOW</button>
                      <button className="btn-secondary" style={{ fontSize: 12 }}>Reuse Quote</button>
                      <button className="btn-primary" style={{ fontSize: 12, marginLeft: "auto" }}>
                        Start New Project from This
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>No similar previous projects found above 30% similarity. This appears to be new work.</div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
