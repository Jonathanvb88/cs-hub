"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useActiveClient } from "@/lib/clientContext";

interface ClientDetail {
  id: string;
  name: string;
  industry: string | null;
  health_score: number;
  health_status: string;
  contacts: { id: string; name: string; email: string; title: string }[];
}

const healthColor = (status: string) =>
  status === "active" ? "#15803d" : status === "steady" ? "#2563eb" : status === "quiet" ? "#b45309" : "#dc2626";

export default function ClientContextPanel() {
  const { activeClient, setActiveClient, panelOpen, setPanelOpen } = useActiveClient();
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  useEffect(() => {
    if (!activeClient) { setDetail(null); return; }
    setLoading(true);
    fetch("/api/db/clients")
      .then(r => r.json())
      .then(data => {
        const found = data.clients?.find((c: ClientDetail) => c.id === activeClient.id);
        setDetail(found || null);
      })
      .finally(() => setLoading(false));
  }, [activeClient]);

  if (!activeClient) return null;

  const PanelContent = () => (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Active Client
        </div>
        <button
          onClick={() => { setActiveClient(null); setMobileSheetOpen(false); }}
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}
          title="Clear active client"
        >×</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: "var(--accent-green-bg)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 17, fontWeight: 700, color: "var(--accent-green)", flexShrink: 0,
        }}>
          {activeClient.name.charAt(0)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {activeClient.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{detail?.industry || activeClient.industry || "—"}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "12px 0" }}>Loading...</div>
      ) : detail && (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Health</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: healthColor(detail.health_status) }}>{detail.health_score}/100</span>
            </div>
            <div style={{ height: 5, background: "var(--bg-elevated)", borderRadius: 3 }}>
              <div style={{ height: "100%", borderRadius: 3, width: `${detail.health_score}%`, background: healthColor(detail.health_status) }} />
            </div>
          </div>

          {detail.contacts?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Primary Contact
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{detail.contacts[0].name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{detail.contacts[0].title}</div>
            </div>
          )}
        </>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
          Quick Actions
        </div>
        <Link href={`/clients/${activeClient.id}`} onClick={() => setMobileSheetOpen(false)}>
          <button className="btn-secondary" style={{ width: "100%", fontSize: 12, justifyContent: "flex-start" }}>
            Open Full Profile
          </button>
        </Link>
        <Link href="/documents/quote/new" onClick={() => setMobileSheetOpen(false)}>
          <button className="btn-secondary" style={{ width: "100%", fontSize: 12, justifyContent: "flex-start" }}>
            New Quote for {activeClient.name.split(" ")[0]}
          </button>
        </Link>
        <Link href="/intelligence/capture" onClick={() => setMobileSheetOpen(false)}>
          <button className="btn-secondary" style={{ width: "100%", fontSize: 12, justifyContent: "flex-start" }}>
            Extract Requirements
          </button>
        </Link>
        <Link href={`/clients/${activeClient.id}/coach`} onClick={() => setMobileSheetOpen(false)}>
          <button className="btn-secondary" style={{ width: "100%", fontSize: 12, justifyContent: "flex-start" }}>
            Prepare Meeting Brief
          </button>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop persistent panel */}
      <aside className="desktop-client-panel" style={{
        width: 260, minWidth: 260, height: "100vh",
        background: "var(--bg-surface)", borderLeft: "1px solid var(--border)",
        position: "fixed", right: 0, top: 0, zIndex: 40,
        padding: 20, overflowY: "auto",
      }}>
        <PanelContent />
      </aside>

      {/* Mobile floating pill trigger */}
      <button
        className="mobile-bottom-nav"
        onClick={() => setMobileSheetOpen(true)}
        style={{
          display: "none",
          position: "fixed", bottom: 72, right: 16, zIndex: 45,
          background: "var(--accent-green)", color: "white",
          borderRadius: 24, padding: "10px 16px", border: "none",
          fontSize: 12, fontWeight: 600, alignItems: "center", gap: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", cursor: "pointer",
        }}
      >
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
          {activeClient.name.charAt(0)}
        </div>
        {activeClient.name.split(" ")[0]}
      </button>

      {/* Mobile bottom sheet */}
      {mobileSheetOpen && (
        <div
          onClick={() => setMobileSheetOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 60, display: "flex", alignItems: "flex-end" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--bg-surface)", borderTopLeftRadius: 20, borderTopRightRadius: 20,
              padding: 20, width: "100%", maxHeight: "75vh", overflowY: "auto",
              animation: "slideUp 0.2s ease-out",
            }}
          >
            <div style={{ width: 36, height: 4, background: "var(--border-light)", borderRadius: 2, margin: "0 auto 16px" }} />
            <PanelContent />
          </div>
        </div>
      )}
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </>
  );
}
