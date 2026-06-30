"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import AppLayout from "@/app/(app)/layout";
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
    <AppLayout>
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
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                Connect your Microsoft 365 account to sync real Outlook emails, Teams meetings, and calendar events into CS Hub. You&apos;ll be asked to sign in and approve access — only your own mailbox and calendar data will be accessed.
              </div>
              <button className="btn-primary" onClick={() => signIn("azure-ad")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Connect Microsoft Account
              </button>
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

        {/* Status note */}
        <div style={{
          background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 10, padding: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-amber)", marginBottom: 6 }}>Sprint 6 — In Progress</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            This connects to your real Microsoft 365 mailbox and calendar via Microsoft Graph. Dashboard, Communications, and other screens still display mock data for now — full integration of live data into those screens is the next step once this connection is verified working.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
