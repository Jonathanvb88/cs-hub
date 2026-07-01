"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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

interface Template {
  id: string;
  type: string;
  name: string;
  description: string | null;
  content_json: Record<string, unknown>;
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
  uat: "var(--accent-amber)",
  proposal: "var(--accent-amber)",
};

const typeLabel: Record<string, string> = { quote: "Quote", sow: "SOW", poc: "POC", uat: "UAT Sign-off" };
const typeRoute: Record<string, string> = { quote: "/documents/quote/new", sow: "/documents/sow/new", poc: "/documents/poc/new", uat: "/documents/uat/new" };

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pickerType, setPickerType] = useState<string | null>(null);
  const [showAddTemplate, setShowAddTemplate] = useState(false);

  const updateStatus = async (id: string, status: string) => {
    setDocuments(p => p.map(d => d.id === id ? { ...d, status } : d));
    try {
      await fetch("/api/db/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch { fetchDocuments(); }
  };
  const [newTplType, setNewTplType] = useState("quote");
  const [newTplName, setNewTplName] = useState("");
  const [newTplDesc, setNewTplDesc] = useState("");
  const [savingTpl, setSavingTpl] = useState(false);

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

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/db/templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {}
  };

  useEffect(() => { fetchDocuments(); fetchTemplates(); }, []);

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

  const templatesForType = (type: string) => templates.filter(t => t.type === type);

  const useTemplate = (template: Template) => {
    sessionStorage.setItem("cshub_template_prefill", JSON.stringify(template.content_json));
    window.location.href = typeRoute[template.type];
  };

  const saveNewTemplate = async () => {
    if (!newTplName.trim()) return;
    setSavingTpl(true);
    try {
      await fetch("/api/db/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newTplType, name: newTplName, description: newTplDesc, contentJson: {} }),
      });
      await fetchTemplates();
      setNewTplName(""); setNewTplDesc(""); setShowAddTemplate(false);
    } catch (e) {
      setError("Failed to save template");
    } finally {
      setSavingTpl(false);
    }
  };

  return (
    <>
          <Header
        title="Documents"
        subtitle="Quotes, SOWs, POCs and proposals — saved to database"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setShowAddTemplate(true)}>
              + New Template
            </button>
          </div>
        }
      />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {error && (
          <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "var(--accent-red)" }}>
            {error}
          </div>
        )}

        {/* Template-driven creation buttons — the main "create new document" entry point */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            Create New Document
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
            {["quote", "sow", "poc", "uat"].map((type, i) => (
              <div key={type} style={{ padding: 20, borderRight: i < 3 ? "1px solid var(--border)" : "none", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: typeColor[type] + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="15" height="15" fill="none" stroke={typeColor[type]} strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{typeLabel[type]}</span>
                </div>
                <button
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}
                  onClick={() => setPickerType(pickerType === type ? null : type)}
                >
                  Use a Template
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ transform: pickerType === type ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <Link href={typeRoute[type]}>
                  <button className="btn-secondary" style={{ width: "100%", justifyContent: "center", fontSize: 12 }}>
                    Start from Blank
                  </button>
                </Link>

                {pickerType === type && (
                  <div style={{
                    position: "absolute", top: "100%", left: 8, right: 8, zIndex: 10,
                    background: "var(--bg-surface)", border: "1px solid var(--border)",
                    borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    marginTop: 4, overflow: "hidden",
                  }}>
                    {templatesForType(type).length === 0 ? (
                      <div style={{ padding: 16, fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                        No templates yet for {typeLabel[type]}
                      </div>
                    ) : (
                      templatesForType(type).map(tpl => (
                        <button
                          key={tpl.id}
                          onClick={() => useTemplate(tpl)}
                          style={{
                            display: "block", width: "100%", textAlign: "left",
                            padding: "10px 14px", border: "none", borderBottom: "1px solid var(--border)",
                            background: "var(--bg-surface)", cursor: "pointer",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-elevated)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-surface)")}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{tpl.name}</div>
                          {tpl.description && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{tpl.description}</div>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add template form */}
        {showAddTemplate && (
          <div className="card" style={{ border: "1px solid var(--accent-green)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>New Template Shell</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 2fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Document Type</label>
                <select className="input" value={newTplType} onChange={e => setNewTplType(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                  <option value="quote">Quote</option>
                  <option value="sow">SOW</option>
                  <option value="poc">POC</option>
                  <option value="uat">UAT Sign-off</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Template Name</label>
                <input className="input" placeholder="e.g. Enterprise SOW" value={newTplName} onChange={e => setNewTplName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Description</label>
                <input className="input" placeholder="Brief description" value={newTplDesc} onChange={e => setNewTplDesc(e.target.value)} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
              This creates a named shell. Build it out fully by using it once, filling in the form, and saving — future updates to template content editing are coming in a later sprint.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" style={{ fontSize: 12, opacity: savingTpl ? 0.7 : 1 }} onClick={saveNewTemplate} disabled={savingTpl}>
                {savingTpl ? "Saving..." : "Save Template"}
              </button>
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setShowAddTemplate(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Total Documents", value: documents.length, color: "var(--accent-green)" },
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
                background: filter === f ? "var(--accent-green)" : "var(--bg-elevated)",
                color: filter === f ? "white" : "var(--text-secondary)",
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
              No documents yet — use a template or start blank above
            </div>
          ) : (
            filtered.map(doc => (
              <div key={doc.id} className="table-row" style={{
                gridTemplateColumns: "32px 2fr 1.5fr 90px 100px 130px 120px 70px",
                alignItems: "center",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: (typeColor[doc.type] || "var(--accent-green)") + "18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="13" height="13" fill="none" stroke={typeColor[doc.type] || "var(--accent-green)"} strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{doc.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{doc.version}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{doc.client_name || "—"}</div>
                <div><span className="badge badge-gray" style={{ fontSize: 10 }}>{doc.type.toUpperCase()}</span></div>
                <div>
                  <select
                    value={doc.status}
                    onChange={e => updateStatus(doc.id, e.target.value)}
                    className={`badge ${statusBadge[doc.status] || "badge-gray"}`}
                    style={{ border: "none", cursor: "pointer", appearance: "none", paddingRight: 6 }}
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="sent">Sent</option>
                    <option value="approved">Approved</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: Number(doc.total_value) > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {Number(doc.total_value) > 0 ? `R ${Number(doc.total_value).toLocaleString("en-ZA")}` : "—"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  {new Date(doc.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div>
                  <Link href={`/documents/view?id=${doc.id}`}>
                    <button className="btn-secondary" style={{ fontSize: 11, padding: "3px 8px" }}>View</button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}




