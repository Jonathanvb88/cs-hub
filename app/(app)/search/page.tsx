"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface SearchResults {
  clients: { id: string; name: string; industry: string | null }[];
  projects: { id: string; name: string; status: string; client_name: string | null }[];
  documents: { id: string; title: string; type: string; status: string; client_name: string | null }[];
  communications: { id: string; subject: string; client_name: string; received_at: string }[];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const [clientsRes, projectsRes, docsRes, commsRes] = await Promise.all([
        fetch("/api/db/clients"),
        fetch("/api/db/projects"),
        fetch("/api/db/documents"),
        fetch("/api/db/communications"),
      ]);
      const [clientsData, projectsData, docsData, commsData] = await Promise.all([
        clientsRes.json(), projectsRes.json(), docsRes.json(), commsRes.json(),
      ]);
      const ql = q.toLowerCase();
      setResults({
        clients: (clientsData.clients || []).filter((c: { name: string; industry: string | null }) =>
          c.name.toLowerCase().includes(ql) || (c.industry || "").toLowerCase().includes(ql)
        ),
        projects: (projectsData.projects || []).filter((p: { name: string; client_name: string | null }) =>
          p.name.toLowerCase().includes(ql) || (p.client_name || "").toLowerCase().includes(ql)
        ),
        documents: (docsData.documents || []).filter((d: { title: string; client_name: string | null }) =>
          d.title.toLowerCase().includes(ql) || (d.client_name || "").toLowerCase().includes(ql)
        ),
        communications: (commsData.communications || []).filter((c: { subject: string; client_name: string }) =>
          c.subject.toLowerCase().includes(ql) || c.client_name.toLowerCase().includes(ql)
        ),
      });
    } catch { setResults(null); }
    finally { setLoading(false); }
  };

  const total = results ? results.clients.length + results.projects.length + results.documents.length + results.communications.length : 0;

  return (
    <>
      <Header title="Global Search" subtitle="Search across all clients, projects, documents and communications" />
      <div style={{ padding: 24, maxWidth: 720 }}>
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="input"
            style={{ paddingLeft: 42, fontSize: 15, height: 48 }}
            placeholder="Search clients, projects, documents, communications..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            autoFocus
          />
          {loading && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth={2}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", animation: "spin 1s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          )}
        </div>

        {results && total === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="20" height="20" fill="none" stroke="var(--text-muted)" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="empty-state-title">No results for "{query}"</div>
            <div className="empty-state-subtitle">Try a different search term or check spelling.</div>
          </div>
        )}

        {results && total > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {results.clients.length > 0 && (
              <div>
                <div className="section-label" style={{ marginBottom: 10 }}>Clients ({results.clients.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {results.clients.map(c => (
                    <Link key={c.id} href={`/clients/${c.id}`} style={{ textDecoration: "none" }}>
                      <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-green-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "var(--accent-green)", flexShrink: 0 }}>
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.industry || "—"}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.projects.length > 0 && (
              <div>
                <div className="section-label" style={{ marginBottom: 10 }}>Projects ({results.projects.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {results.projects.map(p => (
                    <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
                      <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="14" height="14" fill="none" stroke="var(--accent-green)" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.client_name || "—"} · {p.status}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.documents.length > 0 && (
              <div>
                <div className="section-label" style={{ marginBottom: 10 }}>Documents ({results.documents.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {results.documents.map(d => (
                    <Link key={d.id} href={`/documents/view?id=${d.id}`} style={{ textDecoration: "none" }}>
                      <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="14" height="14" fill="none" stroke="var(--accent-purple)" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{d.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.client_name || "—"} · {d.type.toUpperCase()} · {d.status}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.communications.length > 0 && (
              <div>
                <div className="section-label" style={{ marginBottom: 10 }}>Communications ({results.communications.length})</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {results.communications.map(c => (
                    <Link key={c.id} href="/communications" style={{ textDecoration: "none" }}>
                      <div className="card" style={{ padding: "12px 16px", cursor: "pointer" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{c.subject}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.client_name} · {new Date(c.received_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!results && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="20" height="20" fill="none" stroke="var(--text-muted)" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="empty-state-title">Start typing to search</div>
            <div className="empty-state-subtitle">Search across clients, projects, documents, and communications.</div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) translateY(-50%); } to { transform: rotate(360deg) translateY(-50%); } }`}</style>
    </>
  );
}
