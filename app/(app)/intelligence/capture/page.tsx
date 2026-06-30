"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { mockClients } from "@/lib/mockData";

interface UserStory {
  id: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  approved: boolean;
}

interface DevTask {
  id: string;
  category: "backend" | "frontend" | "testing" | "devops" | "design";
  title: string;
  description: string;
  approved: boolean;
}

interface ExtractionResult {
  classification: string;
  priority: string;
  businessReason: string;
  modulesAffected: string[];
  userStories: UserStory[];
  developerTasks: DevTask[];
  missingInformation: string[];
  clarificationEmailDraft: string | null;
  risks: string[];
  assumptions: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  backend: "var(--accent-blue)",
  frontend: "var(--accent-purple)",
  testing: "var(--accent-green)",
  devops: "var(--accent-amber)",
  design: "var(--accent-red)",
};

const PRIORITY_BADGE: Record<string, string> = {
  low: "badge-gray",
  medium: "badge-amber",
  high: "badge-red",
  critical: "badge-red",
};

const CLASS_BADGE: Record<string, string> = {
  feature: "badge-blue",
  bug: "badge-red",
  enhancement: "badge-amber",
  support: "badge-gray",
};

export default function RequirementCapturePage() {
  const [clientId, setClientId] = useState("");
  const [sourceType, setSourceType] = useState("email");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showClarification, setShowClarification] = useState(false);
  const [activeStory, setActiveStory] = useState<string | null>(null);

  const selectedClient = mockClients.find(c => c.id === clientId);

  const handleExtract = async () => {
    if (!content.trim()) { setError("Please paste the email or notes content first."); return; }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const systemPrompt = `You are a Business Analyst assistant for a software delivery company based in South Africa. Analyse the customer communication and extract structured software requirements.

Respond ONLY with valid JSON. No preamble, no markdown, no code fences.

JSON structure:
{
  "classification": "feature | bug | enhancement | support",
  "priority": "low | medium | high | critical",
  "businessReason": "string",
  "modulesAffected": ["string"],
  "userStories": [
    {
      "id": "us1",
      "asA": "string",
      "iWant": "string",
      "soThat": "string",
      "acceptanceCriteria": ["string"],
      "approved": true
    }
  ],
  "developerTasks": [
    {
      "id": "dt1",
      "category": "backend | frontend | testing | devops | design",
      "title": "string",
      "description": "string",
      "approved": true
    }
  ],
  "missingInformation": ["string"],
  "clarificationEmailDraft": "string or null",
  "risks": ["string"],
  "assumptions": ["string"]
}

Rules:
- Generate at least one user story per distinct functional requirement
- If missingInformation is not empty, clarificationEmailDraft must be a complete professional email
- Cover backend, frontend, and testing tasks at minimum
- Priority inferred from business language and urgency
- South African business context applies`;

      const userPrompt = `Client: ${selectedClient?.name || "Unknown"}
Source: ${sourceType}

Content:
${content}

Extract all software requirements.`;

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          user: userPrompt,
          maxTokens: 2000,
        }),
      });

      if (!response.ok) throw new Error("AI service error");
      const data = await response.json();

      let parsed: ExtractionResult;
      try {
        const clean = data.content.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        throw new Error("Could not parse AI response. Please try again.");
      }

      // Ensure IDs and approved flags
      parsed.userStories = (parsed.userStories || []).map((s, i) => ({ ...s, id: s.id || `us${i + 1}`, approved: true }));
      parsed.developerTasks = (parsed.developerTasks || []).map((t, i) => ({ ...t, id: t.id || `dt${i + 1}`, approved: true }));
      setResult(parsed);
      if (parsed.missingInformation?.length > 0) setShowClarification(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Extraction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStoryApproval = (id: string) => {
    if (!result) return;
    setResult({ ...result, userStories: result.userStories.map(s => s.id === id ? { ...s, approved: !s.approved } : s) });
  };

  const toggleTaskApproval = (id: string) => {
    if (!result) return;
    setResult({ ...result, developerTasks: result.developerTasks.map(t => t.id === id ? { ...t, approved: !t.approved } : t) });
  };

  const buildTicketText = () => {
    if (!result) return "";
    const client = selectedClient?.name || "Client";
    const approvedStories = result.userStories.filter(s => s.approved);
    const approvedTasks = result.developerTasks.filter(t => t.approved);
    let out = `TICKET PACKAGE — ${client}\n`;
    out += `Generated by CS Hub | ${new Date().toLocaleDateString("en-ZA")}\n`;
    out += `${"─".repeat(60)}\n\n`;
    out += `TYPE: ${result.classification?.toUpperCase()}\n`;
    out += `PRIORITY: ${result.priority?.toUpperCase()}\n`;
    out += `BUSINESS REASON: ${result.businessReason}\n`;
    if (result.modulesAffected?.length) out += `MODULES: ${result.modulesAffected.join(", ")}\n`;
    out += `\n${"─".repeat(60)}\n`;
    out += `USER STORIES (${approvedStories.length})\n${"─".repeat(60)}\n\n`;
    approvedStories.forEach((s, i) => {
      out += `${i + 1}. As a ${s.asA}, I want ${s.iWant}, so that ${s.soThat}\n\n`;
      out += `   Acceptance Criteria:\n`;
      s.acceptanceCriteria.forEach(ac => { out += `   • ${ac}\n`; });
      out += `\n`;
    });
    out += `${"─".repeat(60)}\n`;
    out += `DEVELOPER TASKS (${approvedTasks.length})\n${"─".repeat(60)}\n\n`;
    ["backend", "frontend", "testing", "devops", "design"].forEach(cat => {
      const tasks = approvedTasks.filter(t => t.category === cat);
      if (tasks.length) {
        out += `${cat.toUpperCase()}\n`;
        tasks.forEach(t => { out += `  • ${t.title}\n    ${t.description}\n\n`; });
      }
    });
    if (result.risks?.length) {
      out += `${"─".repeat(60)}\nRISKS\n${"─".repeat(60)}\n`;
      result.risks.forEach(r => { out += `• ${r}\n`; });
      out += `\n`;
    }
    if (result.assumptions?.length) {
      out += `ASSUMPTIONS\n${"─".repeat(60)}\n`;
      result.assumptions.forEach(a => { out += `• ${a}\n`; });
    }
    return out;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(buildTicketText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const SAMPLE_EMAIL = `Hi Jonathan,

We would like to add a multi-file upload feature to our portal. Currently users can only upload one file at a time, which is very time consuming when they need to submit monthly reports.

We need:
- Users should be able to select and upload multiple files at once (up to 20 files)
- A progress bar should show upload progress for each file
- Once all files are processed, users should receive an email notification
- The system must validate file types (PDF, Excel, Word only) and reject unsupported formats
- Maximum file size should be 10MB per file

This is urgent as our compliance deadline is end of July.

Kind regards,
Sarah Mkhize
IT Manager, ABC Retail Group`;

  return (
          <Header
        title="Requirement Capture Engine"
        subtitle="AI extracts requirements, user stories, and developer tasks from customer communications"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/intelligence"><button className="btn-secondary" style={{ fontSize: 12 }}>Back</button></Link>
            {result && (
              <button className="btn-primary" style={{ fontSize: 12 }} onClick={handleCopy}>
                {copied ? "Copied!" : "Copy Ticket Package"}
              </button>
            )}
          </div>
        }
      />

      <div style={{ padding: 24, display: "grid", gridTemplateColumns: result ? "1fr 1fr" : "1fr", gap: 24, maxWidth: result ? "none" : 800, margin: result ? "0" : "0 auto" }}>

        {/* Input panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
              Input
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Client</label>
                <select className="input" value={clientId} onChange={e => setClientId(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                  <option value="">Select client (optional)</option>
                  {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Source Type</label>
                <select className="input" value={sourceType} onChange={e => setSourceType(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                  <option value="email">Email</option>
                  <option value="meeting_notes">Meeting Notes</option>
                  <option value="document">Document</option>
                  <option value="teams_chat">Teams Chat</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Content</label>
                <button
                  onClick={() => setContent(SAMPLE_EMAIL)}
                  style={{ background: "none", border: "none", fontSize: 11, color: "var(--accent-blue)", cursor: "pointer" }}
                >
                  Load sample email
                </button>
              </div>
              <textarea
                className="input"
                rows={14}
                style={{ resize: "vertical", fontFamily: "inherit" }}
                placeholder="Paste the customer email, meeting notes, or document content here..."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>
            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--accent-red)", marginBottom: 12 }}>
                {error}
              </div>
            )}
            <button
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", fontSize: 13, padding: "10px", opacity: loading ? 0.7 : 1 }}
              onClick={handleExtract}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Analysing with AI...
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Extract Requirements with AI
                </span>
              )}
            </button>
          </div>

          {/* Clarification email */}
          {result?.clarificationEmailDraft && showClarification && (
            <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <svg width="16" height="16" fill="none" stroke="var(--accent-amber)" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-amber)" }}>
                  Ask the Customer — Missing Information Detected
                </span>
                <button onClick={() => setShowClarification(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
                Missing: {result.missingInformation?.join(" · ")}
              </div>
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 12, maxHeight: 200, overflowY: "auto" }}>
                {result.clarificationEmailDraft}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => navigator.clipboard.writeText(result.clarificationEmailDraft || "")}>
                  Copy Email Draft
                </button>
                <button className="btn-secondary" style={{ fontSize: 12 }}>Send via Outlook</button>
              </div>
            </div>
          )}
        </div>

        {/* Results panel */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Classification banner */}
            <div style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-light)",
              borderRadius: 12, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Classification</div>
                <span className={`badge ${CLASS_BADGE[result.classification] || "badge-gray"}`} style={{ fontSize: 12 }}>
                  {result.classification?.charAt(0).toUpperCase() + result.classification?.slice(1)}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Priority</div>
                <span className={`badge ${PRIORITY_BADGE[result.priority] || "badge-gray"}`} style={{ fontSize: 12 }}>
                  {result.priority?.charAt(0).toUpperCase() + result.priority?.slice(1)}
                </span>
              </div>
              {result.modulesAffected?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Modules</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {result.modulesAffected.map(m => (
                      <span key={m} className="badge badge-gray" style={{ fontSize: 11 }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.missingInformation?.length > 0 && (
                <button
                  onClick={() => setShowClarification(p => !p)}
                  className="badge badge-amber"
                  style={{ fontSize: 11, cursor: "pointer", border: "none", marginLeft: "auto" }}
                >
                  ⚠ {result.missingInformation.length} gaps — Ask Customer
                </button>
              )}
            </div>

            {result.businessReason && (
              <div style={{ padding: "12px 16px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                <span style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Business Reason: </span>{result.businessReason}
              </div>
            )}

            {/* User Stories */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>User Stories</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>{result.userStories.filter(s => s.approved).length} of {result.userStories.length} approved</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-secondary" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => setResult({ ...result, userStories: result.userStories.map(s => ({ ...s, approved: true })) })}>Approve All</button>
                </div>
              </div>
              {result.userStories.map(story => (
                <div key={story.id} style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--border)",
                  opacity: story.approved ? 1 : 0.5,
                  transition: "opacity 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <button
                      onClick={() => toggleStoryApproval(story.id)}
                      style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
                        border: story.approved ? "none" : "2px solid var(--border-light)",
                        background: story.approved ? "var(--accent-green)" : "none",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {story.approved && <svg width="10" height="10" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 8 }}>
                        <span style={{ color: "var(--text-muted)" }}>As a </span>
                        <span style={{ fontWeight: 600 }}>{story.asA}</span>
                        <span style={{ color: "var(--text-muted)" }}>, I want </span>
                        <span style={{ fontWeight: 600 }}>{story.iWant}</span>
                        <span style={{ color: "var(--text-muted)" }}>, so that </span>
                        <span style={{ fontWeight: 600 }}>{story.soThat}</span>
                      </div>
                      <button
                        onClick={() => setActiveStory(activeStory === story.id ? null : story.id)}
                        style={{ background: "none", border: "none", fontSize: 11, color: "var(--accent-blue)", cursor: "pointer", padding: 0 }}
                      >
                        {activeStory === story.id ? "Hide" : `Show ${story.acceptanceCriteria.length} acceptance criteria`}
                      </button>
                      {activeStory === story.id && (
                        <ul style={{ margin: "8px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                          {story.acceptanceCriteria.map((ac, i) => (
                            <li key={i} style={{ fontSize: 12, color: "var(--text-secondary)" }}>{ac}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Developer Tasks */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Developer Tasks</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>{result.developerTasks.filter(t => t.approved).length} of {result.developerTasks.length} approved</span>
                </div>
                <button className="btn-secondary" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => setResult({ ...result, developerTasks: result.developerTasks.map(t => ({ ...t, approved: true })) })}>Approve All</button>
              </div>
              {["backend", "frontend", "testing", "devops", "design"].map(cat => {
                const tasks = result.developerTasks.filter(t => t.category === cat);
                if (!tasks.length) return null;
                return (
    <>
                  <div key={cat}>
                    <div style={{ padding: "8px 18px", background: "var(--bg-elevated)", fontSize: 10, fontWeight: 700, color: CATEGORY_COLORS[cat], textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid var(--border)" }}>
                      {cat}
                    </div>
                    {tasks.map(task => (
                      <div key={task.id} style={{
                        padding: "12px 18px",
                        borderBottom: "1px solid var(--border)",
                        display: "flex", alignItems: "flex-start", gap: 10,
                        opacity: task.approved ? 1 : 0.5,
                      }}>
                        <button
                          onClick={() => toggleTaskApproval(task.id)}
                          style={{
                            width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 2,
                            border: task.approved ? "none" : "2px solid var(--border-light)",
                            background: task.approved ? CATEGORY_COLORS[cat] : "none",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {task.approved && <svg width="9" height="9" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>{task.title}</div>
                          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{task.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Risks & Assumptions */}
            {(result.risks?.length > 0 || result.assumptions?.length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {result.risks?.length > 0 && (
                  <div className="card">
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-red)", marginBottom: 10 }}>Risks</div>
                    {result.risks.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: "var(--accent-red)", flexShrink: 0 }}>•</span>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
                {result.assumptions?.length > 0 && (
                  <div className="card">
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-amber)", marginBottom: 10 }}>Assumptions</div>
                    {result.assumptions.map((a, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: "var(--accent-amber)", flexShrink: 0 }}>•</span>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Export actions */}
            <div className="card" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button className="btn-primary" style={{ fontSize: 12 }} onClick={handleCopy}>
                {copied ? "Copied!" : "Copy Ticket Package"}
              </button>
              <button className="btn-secondary" style={{ fontSize: 12 }}>Export as Word</button>
              <button className="btn-secondary" style={{ fontSize: 12 }}>Save to Project</button>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>
                {result.userStories.filter(s => s.approved).length} stories · {result.developerTasks.filter(t => t.approved).length} tasks approved
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
