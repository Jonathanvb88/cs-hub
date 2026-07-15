"use client";
import { useState, useRef } from "react";

interface ClientOption { id: string; name: string }

export default function UploadFileModal({
  clients, defaultClientId, onClose, onUploaded,
}: {
  clients: ClientOption[];
  defaultClientId?: string;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [clientId, setClientId] = useState(defaultClientId || "");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (f: File | null) => {
    setFile(f);
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!file) { setError("Choose a file first."); return; }
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/db/document-upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadData.url) throw new Error(uploadData.error || "Upload failed");

      const docRes = await fetch("/api/db/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || null,
          type: "attachment",
          title: title || file.name,
          version: "v1.0",
          status: "received",
          fileUrl: uploadData.url,
          fileName: uploadData.name,
        }),
      });
      if (!docRes.ok) throw new Error("Failed to save the file record");

      onUploaded();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }}>
      <div style={{ background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontWeight: 600, fontSize: 15, margin: 0, color: "var(--text-primary)" }}>Upload a file</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
            For anything a client sends directly - a signed contract, an emailed attachment, a spec doc - that doesn&apos;t need the full Quote/SOW/POC workflow.
          </p>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Client</label>
            <select className="input" value={clientId} onChange={e => setClientId(e.target.value)} style={{ background: "var(--bg-elevated)" }}>
              <option value="">No client (internal)</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Title</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Signed MSA - ABC Retail" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>File</label>
            <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
            <button className="btn-secondary" style={{ fontSize: 12, width: "100%" }} onClick={() => fileRef.current?.click()}>
              {file ? file.name : "Choose a file..."}
            </button>
          </div>
          {error && <div style={{ fontSize: 12, color: "var(--accent-red)" }}>{error}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ flex: 1, opacity: uploading || !file ? 0.7 : 1 }} onClick={handleUpload} disabled={uploading || !file}>
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
