"use client";
import { useState } from "react";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";
import { mockEmails } from "@/lib/mockData";

export default function InboxPage() {
  const [actioned, setActioned] = useState<string[]>([]);

  const pending = mockEmails.filter(e => !actioned.includes(e.id));

  const priorityColor = (p: string) =>
    p === "high" ? "var(--accent-red)" : p === "medium" ? "var(--accent-amber)" : "var(--accent-green)";

  return (
    <AppLayout>
      <Header
        title="Work Inbox"
        subtitle="Emails requiring your action"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <span className="badge badge-amber">{pending.length} pending</span>
            <button className="btn-secondary" style={{ fontSize: 12 }}>Mark all actioned</button>
          </div>
        }
      />
      <div style={{ padding: 24, maxWidth: 860 }}>
        {pending.length === 0 ? (
          <div style={{ textAlign: "center", padding: 64 }}>
            <svg width="48" height="48" fill="none" stroke="var(--accent-green)" strokeWidth={1.5} viewBox="0 0 24 24" style={{ margin: "0 auto 16px", display: "block" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>All clear</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No emails require your action right now</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map(email => (
              <div key={email.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: priorityColor(email.priority), marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-blue)" }}>{email.clientName}</span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{email.receivedAt}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{email.subject}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{email.from}</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.5 }}>{email.preview}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <button className="btn-primary" style={{ fontSize: 12 }}>Reply</button>
                    <button className="btn-secondary" style={{ fontSize: 12 }}>Extract Requirements</button>
                    <button className="btn-secondary" style={{ fontSize: 12 }}>Link to Project</button>
                    <button
                      onClick={() => setActioned(p => [...p, email.id])}
                      style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}
                    >
                      Mark actioned
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
