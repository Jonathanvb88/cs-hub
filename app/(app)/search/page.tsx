"use client";
import { useState } from "react";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";
import { mockClients, mockProjects, mockEmails } from "@/lib/mockData";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const results = query.length > 1 ? {
    clients: mockClients.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.industry.toLowerCase().includes(query.toLowerCase())),
    projects: mockProjects.filter(p => p.name.toLowerCase().includes(query.toLowerCase())),
    emails: mockEmails.filter(e => e.subject.toLowerCase().includes(query.toLowerCase()) || e.clientName.toLowerCase().includes(query.toLowerCase())),
  } : null;

  const total = results ? results.clients.length + results.projects.length + results.emails.length : 0;

  return (
    <AppLayout>
      <Header title="Global Search" subtitle="Search across all clients, projects, emails and documents" />
      <div style={{ padding: 24, maxWidth: 760 }}>
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="input"
            style={{ paddingLeft: 40, fontSize: 15, height: 46 }}
            placeholder="Search clients, projects, emails..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {!results && (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 13 }}>Start typing to search across CS Hub</div>
          </div>
        )}

        {results && total === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No results for &ldquo;{query}&rdquo;</div>
            <div style={{ fontSize: 12 }}>Try a different search term</div>
          </div>
        )}

        {results && total > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {results.clients.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  Clients ({results.clients.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {results.clients.map(c => (
                    <Link key={c.id} href={`/clients/${c.id}`} style={{ textDecoration: "none" }}>
                      <div className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-elevated)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "var(--accent-blue)" }}>
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.industry}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.projects.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  Projects ({results.projects.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {results.projects.map(p => (
                    <div key={p.id} className="card" style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="14" height="14" fill="none" stroke="var(--accent-green)" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Project · {p.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.emails.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                  Emails ({results.emails.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {results.emails.map(e => (
                    <div key={e.id} className="card" style={{ padding: "12px 16px", cursor: "pointer" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{e.subject}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{e.clientName} · {e.receivedAt}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
