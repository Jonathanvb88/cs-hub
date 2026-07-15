"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface ClientOption { id: string; name: string; industry?: string; website?: string; contacts: { name: string; email: string }[] }

export default function NewChangeRequestPage() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [costImpact, setCostImpact] = useState("");
  const [timelineImpact, setTimelineImpact] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [status, setStatus] = useState("draft");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedClient = clients.find(c => c.id === clientId);

  useEffect(() => {
    fetch("/api/db/clients").then(r => r.json()).then(d => setClients(d.clients || [])).catch(() => {});
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/db/document-upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setFileUrl(data.url);
        setFileName(data.name);
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch {
      setUploadError("Upload failed - check your connection and try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeFile = () => { setFileUrl(""); setFileName(""); };

  const handleSave = async () => {
    setSaveError("");
    if (!title.trim()) { setSaveError("Please add a title before saving."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/db/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || null,
          type: "change_request",
          title,
          version: "v1.0",
          status,
          contentJson: { reason, description, costImpact, timelineImpact, requestedBy },
          totalValue: 0,
          currency: "ZAR",
          createdBy: "Jonathan",
          fileUrl: fileUrl || null,
          fileName: fileName || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save change request");
      setSaved(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save change request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header
        title="New Change Request"
        subtitle="Document a change to agreed scope, cost, or timeline"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/documents"><button className="btn-secondary" style={{ fontSize: 12 }}>Cancel</button></Link>
            <button className="btn-primary" style={{ fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Change Request"}</button>
          </div>
        }
      />

      {saveError && (
        <div style={{ margin: "16px 24px 0", padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--accent-red)" }}>
          {saveError}
        </div>
      )}

      {saved && (
        <div style={{ margin: "16px 24px 0", padding: "12px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#10b981" }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Change request saved to database. <a href="/documents" style={{ color: "#10b981", textDecoration: "underline" }}>View in Documents</a>
          <button onClick={() => setSaved(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#10b981", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
      )}

      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>Change Request Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Client</label>
                <select className="input" value={clientId} onChange={e => { setClientId(e.target.value); const c = clients.find(cl => cl.id === e.target.value); if (c && !title) setTitle(`CR — ${c.name}`); }} style={{ background: "var(--bg-elevated)" }}>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Title</label>
                <input className="input" placeholder="e.g. CR — Add SMS notification channel" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Requested By</label>
                <input className="input" placeholder="Name of requester" value={requestedBy} onChange={e => setRequestedBy(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Status</label>
                <select className="input" value={status} onChange={e => setStatus(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
                  <option value="draft">Draft</option>
                  <option value="review">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>Reason for Change</div>
            <textarea className="input" rows={3} style={{ resize: "vertical" }} placeholder="Why is this change being requested?" value={reason} onChange={e => setReason(e.target.value)} />
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>Description of Change</div>
            <textarea className="input" rows={4} style={{ resize: "vertical" }} placeholder="Describe exactly what is changing from the original agreed scope..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>Impact</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Cost Impact</label>
                <input className="input" placeholder="e.g. + R 25,000 or No cost impact" value={costImpact} onChange={e => setCostImpact(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Timeline Impact</label>
                <input className="input" placeholder="e.g. +1 week or No timeline impact" value={timelineImpact} onChange={e => setTimelineImpact(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>Attachment</div>
            <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFileSelect} />
            {fileUrl ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: 8 }}>
                <svg width="16" height="16" fill="none" stroke="var(--accent-blue)" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--accent-blue)", flex: 1, textDecoration: "underline" }}>{fileName}</a>
                <button onClick={removeFile} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
            ) : (
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Uploading..." : "Attach a file (signed CR, supporting document, etc.)"}
              </button>
            )}
            {uploadError && <div style={{ marginTop: 8, fontSize: 12, color: "var(--accent-red)" }}>{uploadError}</div>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedClient && (
            <div className="card">
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Client</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{selectedClient.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{selectedClient.industry}</div>
            </div>
          )}
          <div className="card">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Summary</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Status", value: status.replace("_", " ") },
                { label: "Cost Impact", value: costImpact || "Not set" },
                { label: "Timeline Impact", value: timelineImpact || "Not set" },
                { label: "Attachment", value: fileName || "None" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
