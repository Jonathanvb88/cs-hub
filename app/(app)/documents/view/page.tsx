"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface DocumentDetail {
  id: string;
  type: string;
  title: string;
  version: string;
  status: string;
  total_value: number;
  currency: string;
  valid_until: string | null;
  created_at: string;
  created_by: string;
  client_name: string | null;
  content_json: Record<string, unknown>;
}

const statusColor: Record<string, string> = {
  draft: "badge-gray", review: "badge-amber", approved: "badge-blue",
  sent: "badge-purple", accepted: "badge-green", rejected: "badge-red",
};

const TYPE_LABEL: Record<string, string> = {
  quote: "Quote", sow: "Statement of Work", poc: "Proof of Concept", uat: "UAT Sign-off",
};

export default function DocumentViewPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { setError("No document ID provided"); setLoading(false); return; }
    fetch(`/api/db/documents-detail?id=${id}`)
      .then(r => r.json())
      .then(d => { if (d.error) throw new Error(d.error); setDoc(d.document); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <Header title="Document" subtitle="Loading..." />
      <div style={{ padding: 24 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 12, borderRadius: 8 }} />)}
      </div>
    </>
  );

  if (error || !doc) return (
    <>
      <Header title="Document Not Found" subtitle="" />
      <div style={{ padding: 24 }}>
        <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "var(--accent-red)", marginBottom: 16 }}>{error}</div>
        <Link href="/documents"><button className="btn-secondary">Back to Documents</button></Link>
      </div>
    </>
  );

  const content = doc.content_json || {};

  return (
    <>
      <Header
        title={doc.title}
        subtitle={`${TYPE_LABEL[doc.type] || doc.type} · ${doc.version} · ${doc.client_name || "No client"}`}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className={`badge ${statusColor[doc.status] || "badge-gray"}`}>{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span>
            <Link href="/documents"><button className="btn-secondary" style={{ fontSize: 12 }}>Back to Documents</button></Link>
            <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => window.print()}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / PDF
            </button>
          </div>
        }
      />

      <div style={{ padding: 24, maxWidth: 860 }}>
        {/* Document header info */}
        <div className="card" style={{ marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Client", value: doc.client_name || "—" },
            { label: "Created", value: new Date(doc.created_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) },
            { label: "Created By", value: doc.created_by || "Jonathan" },
            { label: doc.valid_until ? "Valid Until" : "Currency", value: doc.valid_until ? new Date(doc.valid_until).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" }) : doc.currency },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* QUOTE view */}
        {doc.type === "quote" && (content.items as { id: string; description: string; qty: number; unit: string; rate: number }[])?.length > 0 && (
          <div className="card" style={{ marginBottom: 20, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Line Items</div>
            <div style={{ display: "grid", gridTemplateColumns: "3fr 80px 80px 120px 120px", padding: "10px 20px", background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
              {["Description", "Qty", "Unit", "Rate", "Amount"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
              ))}
            </div>
            {(content.items as { id: string; description: string; qty: number; unit: string; rate: number }[]).map((item) => {
              const amount = (item.qty || 1) * (item.rate || 0);
              return (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "3fr 80px 80px 120px 120px", padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{item.description}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.qty}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.unit}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>R {(item.rate || 0).toLocaleString("en-ZA")}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>R {amount.toLocaleString("en-ZA")}</div>
                </div>
              );
            })}
            <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <div style={{ display: "flex", gap: 24 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Subtotal</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>R {(doc.total_value / (content.includeVat ? 1.15 : 1)).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}</span>
              </div>
              {(content.includeVat as boolean) && (
                <div style={{ display: "flex", gap: 24 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>VAT (15%)</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>R {(doc.total_value - doc.total_value / 1.15).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              <div style={{ display: "flex", gap: 24, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--accent-green)" }}>R {Number(doc.total_value).toLocaleString("en-ZA")}</span>
              </div>
            </div>
            {content.notes && (
              <div style={{ padding: "14px 20px", background: "var(--bg-elevated)", borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <strong>Notes:</strong> {content.notes as string}
              </div>
            )}
          </div>
        )}

        {/* SOW view */}
        {doc.type === "sow" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(content.scope as string) && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Scope</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{content.scope as string}</div>
              </div>
            )}
            {(content.deliverables as { id: string; title: string; description: string; milestone: string }[])?.length > 0 && (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Deliverables</div>
                {(content.deliverables as { id: string; title: string; description: string; milestone: string }[]).map((d, i) => (
                  <div key={d.id} style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 120px" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{i + 1}. {d.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.description}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--accent-green)", fontWeight: 500, textAlign: "right" }}>{d.milestone}</div>
                  </div>
                ))}
              </div>
            )}
            {(content.assumptions as { id: string; text: string }[])?.length > 0 && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>Assumptions</div>
                {(content.assumptions as { id: string; text: string }[]).map((a, i) => (
                  <div key={a.id} style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6, paddingLeft: 12, borderLeft: "2px solid var(--border)" }}>{i + 1}. {a.text}</div>
                ))}
              </div>
            )}
            {(content.paymentTerms as string) && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>Payment Terms</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{content.paymentTerms as string}</div>
              </div>
            )}
          </div>
        )}

        {/* POC view */}
        {doc.type === "poc" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(content.objective as string) && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Objective</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{content.objective as string}</div>
              </div>
            )}
            <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Duration</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{content.duration as string || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>Resources</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{content.resources as string || "—"}</div>
              </div>
            </div>
            {(content.criteria as { id: string; criteria: string; measure: string }[])?.length > 0 && (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600 }}>Success Criteria</div>
                {(content.criteria as { id: string; criteria: string; measure: string }[]).map((c, i) => (
                  <div key={c.id} style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>{i + 1}. {c.criteria}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.measure}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* UAT view */}
        {doc.type === "uat" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {(content.testSummary as string) && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Test Summary</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{content.testSummary as string}</div>
              </div>
            )}
            {(content.scenarios as { id: string; description: string; result: string; notes: string }[])?.length > 0 && (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600 }}>Test Scenarios</div>
                {(content.scenarios as { id: string; description: string; result: string; notes: string }[]).map((s, i) => {
                  const resultColors: Record<string, string> = { pass: "badge-green", fail: "badge-red", partial: "badge-amber", not_tested: "badge-gray" };
                  const resultLabels: Record<string, string> = { pass: "Pass", fail: "Fail", partial: "Partial", not_tested: "Not Tested" };
                  return (
                    <div key={s.id} style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 20, paddingTop: 3 }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{s.description}</div>
                        {s.notes && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{s.notes}</div>}
                      </div>
                      <span className={`badge ${resultColors[s.result] || "badge-gray"}`}>{resultLabels[s.result] || s.result}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {(content.issues as { id: string; description: string; severity: string; resolution: string }[])?.length > 0 && (
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600 }}>Outstanding Issues</div>
                {(content.issues as { id: string; description: string; severity: string; resolution: string }[]).map((issue) => (
                  <div key={issue.id} style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className={`badge ${issue.severity === "critical" ? "badge-red" : issue.severity === "major" ? "badge-amber" : "badge-green"}`}>{issue.severity}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{issue.description}</span>
                    </div>
                    {issue.resolution && <div style={{ fontSize: 12, color: "var(--text-secondary)", paddingLeft: 4 }}>Resolution: {issue.resolution}</div>}
                  </div>
                ))}
              </div>
            )}
            {(content.signOffDeclaration as string) && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Sign-off Declaration</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>{content.signOffDeclaration as string}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Client Signature</div>
                    <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: 8, fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>___________________________</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>URUP Connect — {doc.created_by}</div>
                    <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: 8, fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>___________________________</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

