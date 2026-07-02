"use client";
import { useState, useEffect } from "react";

interface OneDriveFile {
  id: string;
  name: string;
  webUrl: string;
  lastModified: string;
  size: number;
  extension: string;
  parentPath: string;
  mimeType: string;
}

interface Props {
  clientName?: string;
  searchQuery?: string;
  showSearch?: boolean;
  compact?: boolean;
  onLinkFile?: (file: OneDriveFile) => void;
}

const EXT_COLORS: Record<string, { color: string; bg: string }> = {
  pdf:  { color: "#dc2626", bg: "#fef2f2" },
  docx: { color: "#2563eb", bg: "#eff6ff" },
  doc:  { color: "#2563eb", bg: "#eff6ff" },
  xlsx: { color: "#15803d", bg: "#f0fdf4" },
  xls:  { color: "#15803d", bg: "#f0fdf4" },
  pptx: { color: "#d97706", bg: "#fffbeb" },
  ppt:  { color: "#d97706", bg: "#fffbeb" },
  msg:  { color: "#7c3aed", bg: "#f5f3ff" },
  eml:  { color: "#7c3aed", bg: "#f5f3ff" },
};

function getExtConfig(ext: string) {
  return EXT_COLORS[ext] || { color: "#64748b", bg: "#f8fafc" };
}

function formatSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function getFileName(path: string) {
  if (!path) return "OneDrive";
  const parts = path.split("/");
  return parts[parts.length - 1] || "OneDrive";
}

export default function OneDriveFiles({ clientName, searchQuery, showSearch = true, compact = false, onLinkFile }: Props) {
  const [files, setFiles] = useState<OneDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState(searchQuery || clientName || "");
  const [searched, setSearched] = useState(false);

  const search = async (q?: string) => {
    const term = q || query;
    if (!term.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = clientName
        ? `?client=${encodeURIComponent(term)}`
        : `?q=${encodeURIComponent(term)}`;
      const res = await fetch(`/api/graph/files${params}`);
      const data = await res.json();
      if (data.pending) { setPending(true); setFiles([]); return; }
      setPending(false);
      setFiles(data.files || []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if clientName provided
  useEffect(() => {
    if (clientName) search(clientName);
  }, [clientName]);

  if (pending) {
    return (
      <div style={{ padding: "16px 20px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <svg width="18" height="18" fill="none" stroke="#d97706" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 3 }}>OneDrive search pending admin consent</div>
          <div style={{ fontSize: 12, color: "#b45309", lineHeight: 1.6 }}>
            Once the Microsoft 365 admin consent is approved, OneDrive and SharePoint files will be searchable directly from CS Hub. No further code changes needed.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {showSearch && (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="Search OneDrive files..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
          />
          <button className="btn-primary" style={{ fontSize: 12, whiteSpace: "nowrap" }} onClick={() => search()} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0" }}>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 13, width: "55%", marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 11, width: "35%" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && searched && files.length === 0 && (
        <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
          No files found for "{query}" in OneDrive
        </div>
      )}

      {!loading && files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: compact ? 4 : 8 }}>
          {files.map(file => {
            const ext = file.extension || "file";
            const c = getExtConfig(ext);
            return (
              <div
                key={file.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: compact ? "8px 12px" : "12px 16px",
                  background: "var(--bg-elevated)", borderRadius: 10,
                  border: "1px solid var(--border)",
                  transition: "box-shadow 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "var(--shadow-sm)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
              >
                {/* File type badge */}
                <div style={{
                  width: compact ? 32 : 38, height: compact ? 32 : 38, borderRadius: 8, flexShrink: 0,
                  background: c.bg, border: `1px solid ${c.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: c.color, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                    {ext.slice(0, 4)}
                  </span>
                </div>

                {/* File info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file.name}
                  </div>
                  {!compact && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                      {getFileName(file.parentPath)} · {formatSize(file.size)} · {formatDate(file.lastModified)}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <a href={file.webUrl} target="_blank" rel="noopener noreferrer">
                    <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>Open</button>
                  </a>
                  {onLinkFile && (
                    <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => onLinkFile(file)}>
                      Link
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !searched && !clientName && (
        <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
          Search your OneDrive and SharePoint files
        </div>
      )}
    </div>
  );
}
