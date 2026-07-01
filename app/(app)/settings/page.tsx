"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface GraphEmail {
  id: string;
  subject: string;
  bodyPreview: string;
  from: { emailAddress: { name: string; address: string } };
  receivedDateTime: string;
  isRead: boolean;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<GraphEmail[] | null>(null);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [emailError, setEmailError] = useState("");

  const isConnected = status === "authenticated" && !!session?.accessToken;

  const testFetchEmails = async () => {
    setLoadingEmails(true);
    setEmailError("");
    setEmails(null);
    try {
      const res = await fetch("/api/graph/emails");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch emails");
      }
      const data = await res.json();
      setEmails(data.emails);
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : "Failed to fetch emails");
    } finally {
      setLoadingEmails(false);
    }
  };

  return (
    <>
          <Header title="Settings" subtitle="Account, integrations, and preferences" />
      <div style={{ padding: 24, maxWidth: 800, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Microsoft 365 Integration */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "rgba(59,130,246,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Microsoft 365</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Outlook, Teams, and Calendar integration</div>
              </div>
            </div>
            {status === "loading" ? (
              <span className="badge badge-gray">Checking...</span>
            ) : isConnected ? (
              <span className="badge badge-green">Connected</span>
            ) : (
              <span className="badge badge-amber">Not Connected</span>
            )}
          </div>

          {!isConnected ? (
            <div>
              <div style={{ padding: "14px 16px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                <svg width="18" height="18" fill="none" stroke="var(--accent-amber)" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-amber)", marginBottom: 4 }}>Pending Admin Consent Approval</div>
                  <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                    The Microsoft 365 integration is fully built and ready. Connection is blocked until the URUP Connect Global Administrator approves the app in Azure Active Directory. Once approved, Outlook emails, Teams meetings, and Calendar events will sync automatically into CS Hub.
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                To activate: the Global Administrator needs to visit the admin consent URL and click Approve. Contact your IT administrator to complete this step.
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--accent-blue-dim)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "white",
                }}>
                  {session?.user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "U"}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{session?.user?.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{session?.user?.email}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button className="btn-secondary" style={{ fontSize: 12 }} onClick={testFetchEmails} disabled={loadingEmails}>
                  {loadingEmails ? "Fetching..." : "Test: Fetch Recent Emails"}
                </button>
                <button className="btn-secondary" style={{ fontSize: 12, color: "var(--accent-red)" }} onClick={() => signOut()}>
                  Disconnect
                </button>
              </div>

              {emailError && (
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "var(--accent-red)", marginBottom: 12 }}>
                  {emailError}
                </div>
              )}

              {emails && (
                <div className="card" style={{ padding: 0, overflow: "hidden", background: "var(--bg-elevated)" }}>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                    Live from your Outlook ({emails.length} emails)
                  </div>
                  {emails.slice(0, 8).map(email => (
                    <div key={email.id} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email.subject}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{email.from?.emailAddress?.name} · {new Date(email.receivedDateTime).toLocaleString("en-ZA")}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Priority Categories */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "var(--accent-green-bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Priority Categories</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Customize labels and colors used on Follow-ups and Projects</div>
              </div>
            </div>
            <Link href="/settings/priorities">
              <button className="btn-secondary" style={{ fontSize: 12 }}>Manage</button>
            </Link>
          </div>
        </div>

        {/* Status note */}
        <div style={{
          background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 10, padding: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-amber)", marginBottom: 6 }}>Microsoft 365 Integration — Pending Admin Consent</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            The Microsoft 365 integration is fully built. Connection requires the Global Administrator to approve the app in Azure Active Directory. Once approved, Outlook emails, Teams meetings, and Calendar events will sync automatically.
          </div>
        </div>

        {/* Data Export */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(21,128,61,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Export Data</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Download your clients, documents, and follow-ups as CSV</div>
              </div>
            </div>
            <a href="/api/db/clients" download="clients.json">
              <button className="btn-secondary" style={{ fontSize: 12 }}>Export Clients</button>
            </a>
          </div>
        </div>

        {/* Platform Info */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Platform Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Platform", value: "CS Hub — URUP Connect" },
              { label: "Version", value: "Sprint 8+" },
              { label: "Database", value: "Neon PostgreSQL (Frankfurt)" },
              { label: "Deployment", value: "Vercel Edge Network" },
              { label: "AI Features", value: "Paused — API key required" },
              { label: "Graph Integration", value: "Pending admin consent" },
            ].map(item => (
              <div key={item.label} style={{ padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}


