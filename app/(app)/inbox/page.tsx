"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";

interface GraphEmail {
  id: string;
  subject: string;
  bodyPreview: string;
  from: { emailAddress: { name: string; address: string } };
  receivedDateTime: string;
  isRead: boolean;
  webLink: string;
}
interface ClientContact { email: string }
interface ClientOption { id: string; name: string; contacts: ClientContact[] }

export default function InboxPage() {
  const router = useRouter();
  const [emails, setEmails] = useState<GraphEmail[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [actioned, setActioned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/graph/emails").then(r => r.json()),
      fetch("/api/db/clients").then(r => r.json()),
    ]).then(([emailData, clientData]) => {
      if (emailData.error) {
        setError(
          emailData.error === "Not authenticated"
            ? "Sign in with your Microsoft account to see your real inbox here."
            : "Couldn't load your inbox right now."
        );
      } else {
        setEmails(emailData.emails || []);
      }
      setClients(clientData.clients || []);
    }).catch(() => setError("Couldn't load your inbox right now."))
      .finally(() => setLoading(false));
  }, []);

  const matchClient = (address: string) => {
    const lower = address.toLowerCase();
    return clients.find(c => c.contacts?.some(ct => ct.email?.toLowerCase() === lower));
  };

  const pending = emails.filter(e => !e.isRead && !actioned.includes(e.id));

  const markActioned = async (id: string) => {
    setMarking(id);
    try {
      await fetch("/api/graph/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id }),
      });
    } catch {}
    setActioned(p => [...p, id]);
    setMarking(null);
  };

  const markAllActioned = async () => {
    const ids = pending.map(e => e.id);
    setActioned(p => [...p, ...ids]);
    await Promise.all(ids.map(id =>
      fetch("/api/graph/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id }),
      }).catch(() => {})
    ));
  };

  return (
    <>
      <Header
        title="Work Inbox"
        subtitle="Your real unread emails from Outlook"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <span className="badge badge-amber">{pending.length} pending</span>
            {pending.length > 0 && (
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={markAllActioned}>
                Mark all actioned
              </button>
            )}
          </div>
        }
      />
      <div style={{ padding: 24, maxWidth: 860 }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading your inbox...</div>
        ) : error ? (
          <div className="empty-state" style={{ padding: 64 }}>
            <div className="empty-state-title">{error}</div>
          </div>
        ) : pending.length === 0 ? (
          <div className="empty-state" style={{ padding: 64 }}>
            <div className="empty-state-icon">
              <svg width="22" height="22" fill="none" stroke="var(--accent-green)" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="empty-state-title">All clear</div>
            <div className="empty-state-subtitle">No unread emails right now</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map(email => {
              const client = matchClient(email.from?.emailAddress?.address || "");
              return (
                <div
                  key={email.id}
                  className="card"
                  style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}
                  onClick={() => window.open(email.webLink, "_blank")}
                >
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-blue)", marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-blue)" }}>
                            {client ? client.name : email.from?.emailAddress?.name || "Unknown sender"}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {new Date(email.receivedDateTime).toLocaleString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{email.subject}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{email.from?.emailAddress?.address}</div>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.5 }}>{email.bodyPreview}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)", flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
                      <a href={email.webLink} target="_blank" rel="noopener noreferrer"><button className="btn-primary" style={{ fontSize: 12 }}>Open in Outlook</button></a>
                      <Link href="/intelligence/capture"><button className="btn-secondary" style={{ fontSize: 12 }}>Extract Requirements</button></Link>
                      {client && <Link href={`/clients/${client.id}`}><button className="btn-secondary" style={{ fontSize: 12 }}>View Client</button></Link>}
                      <button
                        onClick={() => markActioned(email.id)}
                        disabled={marking === email.id}
                        style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}
                      >
                        {marking === email.id ? "Marking..." : "Mark actioned"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
