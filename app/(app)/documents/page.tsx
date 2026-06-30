"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";

interface Document {
  id: string;
  client_id: string | null;
  client_name: string | null;
  type: string;
  title: string;
  version: string;
  status: string;
  total_value: string | number;
  currency: string;
  created_at: string;
}

const statusBadge: Record<string, string> = {
  draft: "badge-gray",
  review: "badge-amber",
  approved: "badge-blue",
  sent: "badge-purple",
  accepted: "badge-green",
  rejected: "badge-red",
  superseded: "badge-gray",
};

const typeColor: Record<string, string> = {
  quote: "var(--accent-green)",
  sow: "var(--accent-blue)",
  poc: "var(--accent-purple)",
  proposal: "var(--accent-amber)",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/db/documents");
      if (!res.ok) throw new Error("Failed to load documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const filtered = documents.filter(d => {
    const matchType = filter === "all" || d.type === filter;
    const matchSearch = !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.client_name || "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalValue = documents
    .filter(d => d.status === "accepted" || d.status === "approved")
    .reduce((sum, d) => sum + Number(d.total_value || 0), 0);

  return (
    <AppLayout>
      <Header
        title="Documents"
        subtitle="Quotes, SOWs, POCs and proposals — saved to database"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/documents/quote/new">
              <button className="btn-secondary" style={{ fontSize: 12 }}>New Quote</button>
            </Link>
            <Link href="/documents/sow/new">
              <button className="btn-secondary" style={{ fontSize: 12 }}>New SOW</button>
            </Link>
            <Link href="/documents/poc/new">
              <button className="btn-primary" style={{ fontSize: 12 }}>New POC</button>
            </Link>
          </div>
        }
      />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {error && (
          <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--accent-red)" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Total Documents", value: documents.length, color: "var(--accent-blue)" },
            { label: "Quotes", value: documents.filter(d => d.type === "quote").length, color: "var(--accent-green)" },
            { label: "SOWs", value: documents.filter(d => d.type === "sow").length, color: "var(--accent-blue)" },
            { label: "Accepted Value", value: `R${(totalValue / 1000).toFixed(0)}k`, color: "var(--accent-amber)" },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input className="input" style={{ paddingLeft: 32 }} placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "quote", "sow", "poc"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                border: "1px solid var(--border-light)", cursor: "pointer",
                background: filter === f ? "var(--accent-blue)" : "var(--bg-elevated)",
                color: filter === f ? "white" : "var(--text-secondary)",
                transition: "all 0.15s",
              }}>
                {f === "all" ? "All" : f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "32px 2fr 1.5fr 90px 100px 130px 120px 70px",
            padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)",
          }}>
            {["", "Document", "Client", "Type", "Status", "Value", "Date", ""].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading from database...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No documents yet — create a Quote, SOW, or POC above to get started
            </div>
          ) : (
            filtered.map(doc => (
              <div key={doc.id} className="table-row" style={{
                gridTemplateColumns: "32px 2fr 1.5fr 90px 100px 130px 120px 70px",
                alignItems: "center",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: (typeColor[doc.type] || "var(--accent-blue)") + "18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="13" height="13" fill="none" stroke={typeColor[doc.type] || "var(--accent-blue)"} strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{doc.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{doc.version}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{doc.client_name || "—"}</div>
                <div><span className="badge badge-gray" style={{ fontSize: 10 }}>{doc.type.toUpperCase()}</span></div>
                <div><span className={`badge ${statusBadge[doc.status] || "badge-gray"}`}>{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span></div>
                <div style={{ fontSize: 12, fontWeight: 600, color: Number(doc.total_value) > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {Number(doc.total_value) > 0 ? `R ${Number(doc.total_value).toLocaleString("en-ZA")}` : "—"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {new Date(doc.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div>
                  <button className="btn-secondary" style={{ fontSize: 11, padding: "3px 8px" }}>View</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
