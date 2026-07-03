"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/Toast";

interface TicketPackage {
  id: string;
  client_id: string | null;
  client_name: string | null;
  source_type: string | null;
  classification: string | null;
  priority: string | null;
  business_reason: string | null;
  modules_affected: string[];
  missing_information: string[];
  clarification_email_draft: string | null;
  risks: string[];
  assumptions: string[];
  status: string;
  created_at: string;
  item_count?: string;
  approved_count?: string;
  pending_count?: string;
}

interface TicketItem {
  id: string;
  package_id: string;
  item_type: "user_story" | "dev_task";
  status: "pending" | "approved" | "rejected";
  priority: string | null;
  order_index: number;
  content: {
    asA?: string; iWant?: string; soThat?: string; acceptanceCriteria?: string[];
    category?: string; title?: string; description?: string;
  };
}

const PRIORITY_BADGE: Record<string, string> = { low: "badge-gray", medium: "badge-amber", high: "badge-red", critical: "badge-red" };
const CLASS_BADGE: Record<string, string> = { feature: "badge-blue", bug: "badge-red", enhancement: "badge-amber", support: "badge-gray" };
const STATUS_BADGE: Record<string, string> = { draft: "badge-gray", reviewed: "badge-blue", exported: "badge-green" };
const ITEM_STATUS_COLOR: Record<string, string> = { pending: "var(--text-muted)", approved: "var(--accent-green)", rejected: "var(--accent-red)" };
const CATEGORY_COLORS: Record<string, string> = { backend: "var(--accent-blue)", frontend: "var(--accent-purple)", testing: "var(--accent-green)", devops: "var(--accent-amber)", design: "var(--accent-red)" };

function TicketsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  if (id) return <TicketDetail id={id} onBack={() => router.push("/intelligence/tickets")} />;
  return <TicketList />;
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>}>
      <TicketsPageInner />
    </Suspense>
  );
}

function TicketList() {
  const [packages, setPackages] = useState<TicketPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/db/ticket-packages")
      .then(r => r.json())
      .then(d => setPackages(d.packages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header
        title="Ticket Review & Export"
        subtitle="Review AI-generated ticket packages before exporting to your ticketing system"
        actions={<Link href="/intelligence/capture"><button className="btn-primary" style={{ fontSize: 12 }}>+ New Capture</button></Link>}
      />
      <div className="page-content-pad" style={{ padding: 24 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading ticket packages...</div>
        ) : packages.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>No ticket packages yet</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>Generate one from the Requirement Capture Engine, then save it here for review.</div>
            <Link href="/intelligence/capture"><button className="btn-primary">Go to Capture Engine</button></Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {packages.map(pkg => (
              <Link key={pkg.id} href={`/intelligence/tickets?id=${pkg.id}`} style={{ textDecoration: "none" }}>
                <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{pkg.client_name || "No client"}</span>
                      {pkg.classification && <span className={`badge ${CLASS_BADGE[pkg.classification] || "badge-gray"}`}>{pkg.classification}</span>}
                      {pkg.priority && <span className={`badge ${PRIORITY_BADGE[pkg.priority] || "badge-gray"}`}>{pkg.priority}</span>}
                      <span className={`badge ${STATUS_BADGE[pkg.status] || "badge-gray"}`}>{pkg.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 600 }}>
                      {pkg.business_reason || "No description"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)" }}>
                      <div>{pkg.item_count || 0} items</div>
                      <div>{pkg.approved_count || 0} approved · {pkg.pending_count || 0} pending</div>
                    </div>
                    <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function TicketDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { showToast } = useToast();
  const [pkg, setPkg] = useState<TicketPackage | null>(null);
  const [items, setItems] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/db/ticket-packages?id=${id}`)
      .then(r => r.json())
      .then(d => { setPkg(d.package); setItems(d.items || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateItem = async (itemId: string, patch: Partial<Pick<TicketItem, "status" | "priority" | "content">>) => {
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, ...patch } : it));
    try {
      await fetch("/api/db/ticket-items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, ...patch }),
      });
    } catch {
      showToast("Failed to save change", "error");
      load();
    }
  };

  const splitItem = async (item: TicketItem) => {
    try {
      const res = await fetch("/api/db/ticket-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: id, itemType: item.item_type, content: item.content, orderIndex: item.order_index + 1 }),
      });
      if (!res.ok) throw new Error();
      showToast("Item split — edit the new copy independently", "success");
      load();
    } catch {
      showToast("Failed to split item", "error");
    }
  };

  const deleteItem = async (itemId: string) => {
    setItems(prev => prev.filter(it => it.id !== itemId));
    try {
      await fetch(`/api/db/ticket-items?id=${itemId}`, { method: "DELETE" });
    } catch {
      showToast("Failed to delete item", "error");
      load();
    }
  };

  const updatePackageStatus = async (status: string) => {
    setPkg(prev => prev ? { ...prev, status } : prev);
    try {
      await fetch("/api/db/ticket-packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const buildExportText = () => {
    if (!pkg) return "";
    const approvedStories = items.filter(i => i.item_type === "user_story" && i.status === "approved");
    const approvedTasks = items.filter(i => i.item_type === "dev_task" && i.status === "approved");
    let out = `TICKET PACKAGE — ${pkg.client_name || "Client"}\n`;
    out += `Reviewed via CS Hub | ${new Date().toLocaleDateString("en-ZA")}\n`;
    out += `${"─".repeat(60)}\n\n`;
    out += `TYPE: ${pkg.classification?.toUpperCase() || "—"}\n`;
    out += `PRIORITY: ${pkg.priority?.toUpperCase() || "—"}\n`;
    out += `BUSINESS REASON: ${pkg.business_reason || "—"}\n`;
    if (pkg.modules_affected?.length) out += `MODULES: ${pkg.modules_affected.join(", ")}\n`;
    out += `\n${"─".repeat(60)}\nUSER STORIES (${approvedStories.length})\n${"─".repeat(60)}\n\n`;
    approvedStories.forEach((s, i) => {
      const c = s.content;
      out += `${i + 1}. As a ${c.asA}, I want ${c.iWant}, so that ${c.soThat}${s.priority ? ` [${s.priority.toUpperCase()}]` : ""}\n\n`;
      out += `   Acceptance Criteria:\n`;
      (c.acceptanceCriteria || []).forEach(ac => { out += `   • ${ac}\n`; });
      out += `\n`;
    });
    out += `${"─".repeat(60)}\nDEVELOPER TASKS (${approvedTasks.length})\n${"─".repeat(60)}\n\n`;
    ["backend", "frontend", "testing", "devops", "design"].forEach(cat => {
      const tasks = approvedTasks.filter(t => t.content.category === cat);
      if (tasks.length) {
        out += `${cat.toUpperCase()}\n`;
        tasks.forEach(t => { out += `  • ${t.content.title}${t.priority ? ` [${t.priority.toUpperCase()}]` : ""}\n    ${t.content.description}\n\n`; });
      }
    });
    if (pkg.risks?.length) { out += `${"─".repeat(60)}\nRISKS\n${"─".repeat(60)}\n`; pkg.risks.forEach(r => { out += `• ${r}\n`; }); out += `\n`; }
    if (pkg.assumptions?.length) { out += `ASSUMPTIONS\n${"─".repeat(60)}\n`; pkg.assumptions.forEach(a => { out += `• ${a}\n`; }); }
    return out;
  };

  const handleExport = () => {
    navigator.clipboard.writeText(buildExportText()).then(() => {
      setCopied(true);
      updatePackageStatus("exported");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>;
  if (!pkg) return <div style={{ padding: 40, textAlign: "center", color: "var(--accent-red)" }}>Ticket package not found.</div>;

  const userStories = items.filter(i => i.item_type === "user_story");
  const devTasks = items.filter(i => i.item_type === "dev_task");
  const approvedCount = items.filter(i => i.status === "approved").length;

  return (
    <>
      <Header
        title={`${pkg.client_name || "Ticket Package"}`}
        subtitle={pkg.business_reason || undefined}
        breadcrumbs={[{ label: "Ticket Review & Export", href: "/intelligence/tickets" }, { label: pkg.client_name || "Package" }]}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 12 }} onClick={onBack}>Back to List</button>
            <button className="btn-primary" style={{ fontSize: 12 }} onClick={handleExport}>
              {copied ? "Copied & marked exported!" : `Export ${approvedCount} Approved Items`}
            </button>
          </div>
        }
      />
      <div className="page-content-pad" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {pkg.classification && <span className={`badge ${CLASS_BADGE[pkg.classification] || "badge-gray"}`}>{pkg.classification}</span>}
          {pkg.priority && <span className={`badge ${PRIORITY_BADGE[pkg.priority] || "badge-gray"}`}>{pkg.priority} priority</span>}
          {pkg.modules_affected?.length > 0 && (
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Modules: {pkg.modules_affected.join(", ")}</span>
          )}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Status:</span>
            <select className="input" value={pkg.status} onChange={e => updatePackageStatus(e.target.value)} style={{ fontSize: 12, padding: "4px 8px", width: "auto" }}>
              <option value="draft">Draft</option>
              <option value="reviewed">Reviewed</option>
              <option value="exported">Exported</option>
            </select>
          </div>
        </div>

        {pkg.missing_information?.length > 0 && (
          <div className="card" style={{ borderLeft: "3px solid var(--accent-amber)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-amber)", marginBottom: 8 }}>Missing Information</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)" }}>
              {pkg.missing_information.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        )}

        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>User Stories ({userStories.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {userStories.map(item => (
              <TicketItemCard key={item.id} item={item} onUpdate={updateItem} onSplit={splitItem} onDelete={deleteItem} />
            ))}
            {userStories.length === 0 && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No user stories in this package.</div>}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Developer Tasks ({devTasks.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {devTasks.map(item => (
              <TicketItemCard key={item.id} item={item} onUpdate={updateItem} onSplit={splitItem} onDelete={deleteItem} />
            ))}
            {devTasks.length === 0 && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No developer tasks in this package.</div>}
          </div>
        </div>

        {(pkg.risks?.length > 0 || pkg.assumptions?.length > 0) && (
          <div className="two-col-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {pkg.risks?.length > 0 && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Risks</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)" }}>{pkg.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}
            {pkg.assumptions?.length > 0 && (
              <div className="card">
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>Assumptions</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)" }}>{pkg.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function TicketItemCard({
  item, onUpdate, onSplit, onDelete,
}: {
  item: TicketItem;
  onUpdate: (id: string, patch: Partial<Pick<TicketItem, "status" | "priority" | "content">>) => void;
  onSplit: (item: TicketItem) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.content);

  const save = () => { onUpdate(item.id, { content: draft }); setEditing(false); };

  return (
    <div className="card" style={{ borderLeft: `3px solid ${ITEM_STATUS_COLOR[item.status]}`, opacity: item.status === "rejected" ? 0.6 : 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {item.item_type === "dev_task" && item.content.category && (
            <span style={{ fontSize: 10, fontWeight: 700, color: CATEGORY_COLORS[item.content.category] || "var(--text-muted)", textTransform: "uppercase", marginBottom: 4, display: "inline-block" }}>
              {item.content.category}
            </span>
          )}

          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {item.item_type === "user_story" ? (
                <>
                  <input className="input" value={draft.asA || ""} onChange={e => setDraft({ ...draft, asA: e.target.value })} placeholder="As a..." style={{ fontSize: 12 }} />
                  <input className="input" value={draft.iWant || ""} onChange={e => setDraft({ ...draft, iWant: e.target.value })} placeholder="I want..." style={{ fontSize: 12 }} />
                  <input className="input" value={draft.soThat || ""} onChange={e => setDraft({ ...draft, soThat: e.target.value })} placeholder="So that..." style={{ fontSize: 12 }} />
                  <textarea
                    className="input" rows={3} style={{ fontSize: 12, resize: "none" }}
                    value={(draft.acceptanceCriteria || []).join("\n")}
                    onChange={e => setDraft({ ...draft, acceptanceCriteria: e.target.value.split("\n").filter(Boolean) })}
                    placeholder="Acceptance criteria, one per line"
                  />
                </>
              ) : (
                <>
                  <input className="input" value={draft.title || ""} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Task title" style={{ fontSize: 12 }} />
                  <textarea className="input" rows={2} style={{ fontSize: 12, resize: "none" }} value={draft.description || ""} onChange={e => setDraft({ ...draft, description: e.target.value })} placeholder="Description" />
                </>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" style={{ fontSize: 11 }} onClick={save}>Save</button>
                <button className="btn-secondary" style={{ fontSize: 11 }} onClick={() => { setDraft(item.content); setEditing(false); }}>Cancel</button>
              </div>
            </div>
          ) : item.item_type === "user_story" ? (
            <>
              <div style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>
                As a <strong>{item.content.asA}</strong>, I want {item.content.iWant}, so that {item.content.soThat}
              </div>
              {item.content.acceptanceCriteria && item.content.acceptanceCriteria.length > 0 && (
                <ul style={{ margin: "4px 0 0 0", paddingLeft: 18, fontSize: 12, color: "var(--text-secondary)" }}>
                  {item.content.acceptanceCriteria.map((ac, i) => <li key={i}>{ac}</li>)}
                </ul>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{item.content.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{item.content.description}</div>
            </>
          )}
        </div>

        {!editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
            <select
              value={item.priority || ""}
              onChange={e => onUpdate(item.id, { priority: e.target.value || null })}
              className="input"
              style={{ fontSize: 11, padding: "3px 6px", width: "auto" }}
            >
              <option value="">No priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                title="Approve" onClick={() => onUpdate(item.id, { status: "approved" })}
                style={{ background: item.status === "approved" ? "var(--accent-green)" : "var(--bg-elevated)", color: item.status === "approved" ? "white" : "var(--text-secondary)", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}
              >✓</button>
              <button
                title="Reject" onClick={() => onUpdate(item.id, { status: "rejected" })}
                style={{ background: item.status === "rejected" ? "var(--accent-red)" : "var(--bg-elevated)", color: item.status === "rejected" ? "white" : "var(--text-secondary)", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}
              >✕</button>
              <button title="Edit" onClick={() => setEditing(true)} style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>✎</button>
              <button title="Split into two" onClick={() => onSplit(item)} style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>⑂</button>
              <button title="Delete" onClick={() => onDelete(item.id)} style={{ background: "var(--bg-elevated)", color: "var(--accent-red)", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>🗑</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
