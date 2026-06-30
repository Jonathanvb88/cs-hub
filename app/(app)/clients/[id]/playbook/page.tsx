"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { mockClients, mockProjects, getHealthBadgeClass, getHealthLabel } from "@/lib/mockData";

export default function ClientPlaybookPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [playbook, setPlaybook] = useState<Record<string, string> | null>(null);

  const client = mockClients.find(c => c.id === id);
  const projects = mockProjects.filter(p => p.clientId === id);

  if (!client) return (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
        Client not found. <Link href="/clients" style={{ color: "var(--accent-blue)" }}>Back</Link>
      </div>
  );

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const system = `You are a Client Success expert. Generate a detailed client playbook based on the relationship history provided.

Respond ONLY with valid JSON. No preamble, no markdown, no code fences.

JSON structure:
{
  "approachStyle": "2-3 sentences on how to work best with this client",
  "preferredComms": "string — their preferred communication style and frequency",
  "decisionProcess": "string — how decisions are made at this organisation",
  "keyContacts": "string — who to go to for what",
  "typicalProjectTypes": ["string"],
  "knownRisks": ["string"],
  "lessonsLearned": ["string"],
  "upcomingOpportunities": ["string"],
  "doList": ["string — things that work well with this client"],
  "dontList": ["string — things to avoid"]
}`;

      const user = `Client: ${client.name}
Industry: ${client.industry}
Health: ${client.healthStatus} (${client.healthScore}/100)
Client since: ${client.clientSince}
Last contact: ${client.lastContact}
Active projects: ${projects.filter(p => p.status === "active").map(p => p.name).join(", ") || "None"}
Completed projects: ${projects.filter(p => p.status === "completed").length}
Notes: ${client.notes}
Primary contact: ${client.contacts[0]?.name} — ${client.contacts[0]?.title}

Generate a practical client playbook.`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, user, maxTokens: 900 }),
      });
      const data = await res.json();
      const clean = data.content.replace(/```json|```/g, "").trim();
      setPlaybook(JSON.parse(clean));
    } catch {
      setPlaybook({ approachStyle: "Unable to generate. Please try again.", preferredComms: "", decisionProcess: "", keyContacts: "", typicalProjectTypes: "[]", knownRisks: "[]", lessonsLearned: "[]", upcomingOpportunities: "[]", doList: "[]", dontList: "[]" });
    } finally {
      setLoading(false);
    }
  };

  const parseArr = (val: unknown): string[] => {
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val as string); } catch { return []; }
  };

  return (
    <AppLayout>
      <Header
        title={`Client Playbook — ${client.name}`}
        subtitle="Accumulated knowledge and best practices for this client relationship"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href={`/clients/${id}`}><button className="btn-secondary" style={{ fontSize: 12 }}>Back to Client</button></Link>
            <button className="btn-primary" style={{ fontSize: 12, opacity: loading ? 0.7 : 1 }} onClick={handleGenerate} disabled={loading}>
              {loading ? "Generating..." : playbook ? "Regenerate Playbook" : "Generate AI Playbook"}
            </button>
          </div>
        }
      />

      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>

        {/* Left sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg-elevated)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "var(--accent-blue)" }}>
                {client.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{client.name}</div>
                <span className={getHealthBadgeClass(client.healthStatus)}>{getHealthLabel(client.healthStatus)}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Client Since", value: new Date(client.clientSince).toLocaleDateString("en-ZA", { month: "short", year: "numeric" }) },
                { label: "Total Projects", value: projects.length },
                { label: "Active Now", value: projects.filter(p => p.status === "active").length },
                { label: "Completed", value: projects.filter(p => p.status === "completed").length },
                { label: "Contacts", value: client.contacts.length },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Key Contacts</div>
            {client.contacts.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--accent-blue)", flexShrink: 0 }}>
                  {c.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{c.title}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Projects history */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Project History
            </div>
            {projects.slice(0, 5).map(p => (
              <div key={p.id} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.status === "active" ? "var(--accent-green)" : p.status === "completed" ? "var(--accent-blue)" : "var(--text-muted)", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main playbook content */}
        <div>
          {!playbook && !loading && (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 48, border: "1px dashed var(--border-light)", borderRadius: 12, textAlign: "center" }}>
              <svg width="48" height="48" fill="none" stroke="var(--text-muted)" strokeWidth={1.2} viewBox="0 0 24 24" style={{ marginBottom: 16 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>No playbook yet</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 340, lineHeight: 1.6, marginBottom: 20 }}>
                Click Generate AI Playbook to build an accumulated knowledge brief from this client&apos;s full relationship history.
              </div>
              <button className="btn-primary" onClick={handleGenerate}>Generate AI Playbook</button>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 64, color: "var(--text-muted)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth={2} style={{ animation: "spin 1s linear infinite", marginRight: 10 }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Building playbook from client history...
            </div>
          )}

          {playbook && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Approach */}
              <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-blue)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>How to Work with This Client</div>
                <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7 }}>{playbook.approachStyle}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { key: "preferredComms", title: "Communication Style", color: "var(--accent-purple)" },
                  { key: "decisionProcess", title: "Decision Process", color: "var(--accent-amber)" },
                  { key: "keyContacts", title: "Who to Contact for What", color: "var(--accent-blue)" },
                ].map(section => playbook[section.key] && (
                  <div key={section.key} className="card">
                    <div style={{ fontSize: 12, fontWeight: 600, color: section.color, marginBottom: 8 }}>{section.title}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{playbook[section.key]}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Do list */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--accent-green)" }}>
                    What Works
                  </div>
                  {parseArr(playbook.doList).map((item, i) => (
                    <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
                      <svg width="13" height="13" fill="none" stroke="var(--accent-green)" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Don't list */}
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--accent-red)" }}>
                    What to Avoid
                  </div>
                  {parseArr(playbook.dontList).map((item, i) => (
                    <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
                      <svg width="13" height="13" fill="none" stroke="var(--accent-red)" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Risks */}
                {parseArr(playbook.knownRisks).length > 0 && (
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--accent-amber)" }}>Known Risks</div>
                    {parseArr(playbook.knownRisks).map((item, i) => (
                      <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
                        <span style={{ color: "var(--accent-amber)", flexShrink: 0 }}>⚠</span>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Opportunities */}
                {parseArr(playbook.upcomingOpportunities).length > 0 && (
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--accent-blue)" }}>Opportunities</div>
                    {parseArr(playbook.upcomingOpportunities).map((item, i) => (
                      <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
                        <span style={{ color: "var(--accent-blue)", flexShrink: 0 }}>↑</span>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lessons learned */}
              {parseArr(playbook.lessonsLearned).length > 0 && (
                <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Lessons Learned</div>
                  {parseArr(playbook.lessonsLearned).map((item, i) => (
                    <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
                      <svg width="13" height="13" fill="none" stroke="var(--accent-purple)" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
