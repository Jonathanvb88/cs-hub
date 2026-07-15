"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { getHealthBadgeClass, getHealthLabel, getHealthColor } from "@/lib/mockData";

interface Client {
  id: string; name: string; industry: string | null; health_score: number
  health_status: string; notes: string | null;
}
interface Project { id: string; client_id: string; name: string; status: string }
interface Communication { id: string; client_id: string; subject: string; received_at: string }
interface FollowUp { id: string; client_id: string; title: string; status: string }

interface CoachBrief {
  relationshipSummary: string;
  keyTopics: string[];
  suggestedQuestions: string[];
  upsellOpportunities: string[];
  warningFlags: string[];
  openingLine: string;
}

export default function RelationshipCoachPage() {
  const { id } = useParams();
  const [loadingData, setLoadingData] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [clientComms, setClientComms] = useState<Communication[]>([]);
  const [clientFollowUps, setClientFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<CoachBrief | null>(null);
  const [meetingPurpose, setMeetingPurpose] = useState("quarterly_review");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/db/clients").then(r => r.json()),
      fetch("/api/db/projects").then(r => r.json()),
      fetch("/api/db/communications").then(r => r.json()),
      fetch("/api/db/followups").then(r => r.json()),
    ]).then(([clientsData, projectsData, commsData, followUpsData]) => {
      setClient((clientsData.clients || []).find((c: Client) => c.id === id) || null);
      setClientProjects((projectsData.projects || []).filter((p: Project) => p.client_id === id));
      setClientComms((commsData.communications || []).filter((c: Communication) => c.client_id === id));
      setClientFollowUps((followUpsData.followUps || followUpsData.followups || []).filter((f: FollowUp) => f.client_id === id && f.status === "pending"));
    }).catch(() => {}).finally(() => setLoadingData(false));
  }, [id]);

  const lastContact = clientComms.length > 0
    ? new Date(Math.max(...clientComms.map(c => new Date(c.received_at).getTime()))).toLocaleDateString("en-ZA")
    : "No contact on record";

  if (loadingData) return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
  );

  if (!client) return (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
        Client not found. <Link href="/clients" style={{ color: "var(--accent-blue)" }}>Back to clients</Link>
      </div>
  );

  const handleGenerateBrief = async () => {
    setLoading(true);
    setBrief(null);
    try {
      const system = `You are a Relationship Coach for a Client Success Manager at a South African software delivery company. Generate a meeting preparation brief.

Respond ONLY with valid JSON. No preamble, no markdown, no code fences.

JSON structure:
{
  "relationshipSummary": "2-3 sentence overview of the relationship status and recent activity",
  "keyTopics": ["string — topic likely to come up in this meeting"],
  "suggestedQuestions": ["string — specific question to ask the client"],
  "upsellOpportunities": ["string — potential new work or expansion opportunity"],
  "warningFlags": ["string — risk or issue to be aware of"],
  "openingLine": "string — a natural, specific opening line to start the meeting warmly"
}

Be specific and practical. South African business context applies.`;

      const context = `Client: ${client.name}
Industry: ${client.industry}
Health Score: ${client.health_score}/100 (${client.health_status})
Last Contact: ${lastContact}
Active Projects: ${clientProjects.filter(p => p.status === "active").map(p => p.name).join(", ") || "None"}
Open Follow-ups: ${clientFollowUps.map(f => f.title).join(", ") || "None"}
Recent emails: ${clientComms.map(c => c.subject).join(", ") || "None on record"}
Meeting Purpose: ${meetingPurpose.replace("_", " ")}
Notes: ${client.notes}`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, user: context, maxTokens: 800 }),
      });
      const data = await res.json();
      const clean = data.content.replace(/```json|```/g, "").trim();
      setBrief(JSON.parse(clean));
    } catch {
      setBrief({
        relationshipSummary: "Unable to generate brief. Please try again.",
        keyTopics: [],
        suggestedQuestions: [],
        upsellOpportunities: [],
        warningFlags: [],
        openingLine: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportBrief = () => {
    if (!brief) return "";
    let out = `MEETING BRIEF — ${client.name}\n`;
    out += `Generated by CS Hub Relationship Coach | ${new Date().toLocaleDateString("en-ZA")}\n`;
    out += `${"─".repeat(60)}\n\n`;
    out += `RELATIONSHIP SUMMARY\n${brief.relationshipSummary}\n\n`;
    out += `OPENING LINE\n"${brief.openingLine}"\n\n`;
    if (brief.keyTopics?.length) { out += `KEY TOPICS\n`; brief.keyTopics.forEach(t => { out += `• ${t}\n`; }); out += "\n"; }
    if (brief.suggestedQuestions?.length) { out += `QUESTIONS TO ASK\n`; brief.suggestedQuestions.forEach(q => { out += `• ${q}\n`; }); out += "\n"; }
    if (brief.upsellOpportunities?.length) { out += `UPSELL OPPORTUNITIES\n`; brief.upsellOpportunities.forEach(u => { out += `• ${u}\n`; }); out += "\n"; }
    if (brief.warningFlags?.length) { out += `WARNING FLAGS\n`; brief.warningFlags.forEach(w => { out += `• ${w}\n`; }); }
    return out;
  };

  return (
    <>
      <Header
        title={`Relationship Coach — ${client.name}`}
        subtitle="AI-powered meeting preparation brief"
        breadcrumbs={[{ label: "Clients", href: "/clients" }, { label: client.name, href: `/clients/${id}` }, { label: "Relationship Coach" }]}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href={`/clients/${id}`}><button className="btn-secondary" style={{ fontSize: 12 }}>Back to Client</button></Link>
            {brief && (
              <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => {
                navigator.clipboard.writeText(exportBrief());
                setCopied(true); setTimeout(() => setCopied(false), 2500);
              }}>
                {copied ? "Copied!" : "Copy Brief"}
              </button>
            )}
          </div>
        }
      />

      <div className="two-col-layout" style={{ padding: 24, display: "grid", gridTemplateColumns: "340px 1fr", gap: 24 }}>

        {/* Left — client context */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Client card */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "var(--bg-elevated)", border: "1px solid var(--border-light)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 800, color: "var(--accent-blue)",
              }}>{client.name.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{client.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{client.industry}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Health Score", value: <span style={{ color: getHealthColor(client.health_status), fontWeight: 700 }}>{client.health_score}/100</span> },
                { label: "Status", value: <span className={getHealthBadgeClass(client.health_status)}>{getHealthLabel(client.health_status)}</span> },
                { label: "Last Contact", value: lastContact },
                { label: "Active Projects", value: clientProjects.filter(p => p.status === "active").length },
                { label: "Open Follow-ups", value: clientFollowUps.length },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting type */}
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Meeting Type
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { value: "quarterly_review", label: "Quarterly Review" },
                { value: "project_kickoff", label: "Project Kick-off" },
                { value: "check_in", label: "Relationship Check-in" },
                { value: "requirements_session", label: "Requirements Session" },
                { value: "demo", label: "Product Demo" },
              ].map(opt => (
                <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 8px", borderRadius: 6, background: meetingPurpose === opt.value ? "var(--bg-elevated)" : "transparent" }}>
                  <input
                    type="radio"
                    name="meetingType"
                    value={opt.value}
                    checked={meetingPurpose === opt.value}
                    onChange={() => setMeetingPurpose(opt.value)}
                    style={{ accentColor: "var(--accent-blue)" }}
                  />
                  <span style={{ fontSize: 13, color: meetingPurpose === opt.value ? "var(--text-primary)" : "var(--text-secondary)" }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Projects context */}
          {clientProjects.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                Active Projects
              </div>
              {clientProjects.filter(p => p.status === "active").map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.name}</span>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", fontSize: 13, padding: "11px", opacity: loading ? 0.7 : 1 }}
            onClick={handleGenerateBrief}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Preparing brief...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Prepare Meeting Brief
              </span>
            )}
          </button>
        </div>

        {/* Right — brief output */}
        <div>
          {!brief && !loading && (
            <div style={{
              height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)", textAlign: "center", padding: 48,
              border: "1px dashed var(--border-light)", borderRadius: 12,
            }}>
              <svg width="48" height="48" fill="none" stroke="var(--text-muted)" strokeWidth={1.2} viewBox="0 0 24 24" style={{ marginBottom: 16 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>Ready to prepare</div>
              <div style={{ fontSize: 13, maxWidth: 320, lineHeight: 1.6 }}>
                Select a meeting type and click Prepare Meeting Brief. AI will analyse the full client history and build your briefing pack.
              </div>
            </div>
          )}

          {brief && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Opening line — hero */}
              {brief.openingLine && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.06) 100%)",
                  border: "1px solid rgba(59,130,246,0.25)",
                  borderRadius: 12, padding: 20,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-blue)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                    Suggested Opening
                  </div>
                  <div style={{ fontSize: 15, fontStyle: "italic", color: "var(--text-primary)", lineHeight: 1.6 }}>
                    &ldquo;{brief.openingLine}&rdquo;
                  </div>
                </div>
              )}

              {/* Relationship summary */}
              <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-blue)", marginBottom: 6 }}>Relationship Summary</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{brief.relationshipSummary}</div>
              </div>

              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                {/* Key topics */}
                {brief.keyTopics?.length > 0 && (
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                      Key Topics
                    </div>
                    {brief.keyTopics.map((t, i) => (
                      <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
                        <span style={{ color: "var(--accent-blue)", flexShrink: 0, fontSize: 13 }}>•</span>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Questions */}
                {brief.suggestedQuestions?.length > 0 && (
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                      Questions to Ask
                    </div>
                    {brief.suggestedQuestions.map((q, i) => (
                      <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
                        <span style={{ color: "var(--accent-purple)", flexShrink: 0, fontSize: 13 }}>?</span>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{q}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upsell */}
                {brief.upsellOpportunities?.length > 0 && (
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--accent-green)" }}>
                      Upsell Opportunities
                    </div>
                    {brief.upsellOpportunities.map((u, i) => (
                      <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
                        <span style={{ color: "var(--accent-green)", flexShrink: 0 }}>↑</span>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{u}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Warning flags */}
                {brief.warningFlags?.length > 0 && (
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--accent-amber)" }}>
                      Warning Flags
                    </div>
                    {brief.warningFlags.map((w, i) => (
                      <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
                        <span style={{ color: "var(--accent-amber)", flexShrink: 0 }}>⚠</span>
                        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
