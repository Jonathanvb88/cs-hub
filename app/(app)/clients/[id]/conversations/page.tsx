"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface Communication {
  id: string;
  client_id: string;
  client_name: string;
  subject: string;
  body: string | null;
  type: string;
  direction: string;
  sender: string | null;
  received_at: string;
  action_required: boolean;
  action_status: string;
  ai_summary: string | null;
}

interface Client {
  id: string;
  name: string;
  industry: string | null;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  email:       { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "#2563eb", label: "Email" },
  meeting:     { icon: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", color: "#7c3aed", label: "Meeting" },
  whatsapp:    { icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", color: "#15803d", label: "WhatsApp" },
  sms:         { icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", color: "#0284c7", label: "SMS" },
  teams:       { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "#6366f1", label: "Teams" },
  phone:       { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", color: "#b45309", label: "Call" },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.email;
}

function groupByDate(comms: Communication[]) {
  const groups: Record<string, Communication[]> = {};
  comms.forEach(c => {
    const d = new Date(c.received_at).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
    if (!groups[d]) groups[d] = [];
    groups[d].push(c);
  });
  return groups;
}

export default function ConversationsPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [comms, setComms] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCapture, setShowCapture] = useState(false);
  const [channel, setChannel] = useState("whatsapp");
  const [rawText, setRawText] = useState("");
  const [subject, setSubject] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [converting, setConverting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [clientRes, commsRes] = await Promise.all([
        fetch("/api/db/clients"),
        fetch("/api/db/communications"),
      ]);
      const [clientData, commsData] = await Promise.all([clientRes.json(), commsRes.json()]);
      const found = clientData.clients?.find((c: Client) => c.id === id);
      setClient(found || null);
      const filtered = (commsData.communications || [])
        .filter((c: Communication) => c.client_id === id)
        .sort((a: Communication, b: Communication) => new Date(a.received_at).getTime() - new Date(b.received_at).getTime());
      setComms(filtered);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comms]);

  const handleConvert = async () => {
    if (!rawText.trim()) return;
    setConverting(true);
    setDraftEmail("");
    const channelLabel = channel.charAt(0).toUpperCase() + channel.slice(1);
    const autoSubject = `${channelLabel} — ${client?.name || "Client"} — ${new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}`;
    setSubject(autoSubject);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a professional Client Success Manager at URUP Connect. Convert this informal ${channelLabel} conversation into a formal, professional email body that confirms what was discussed, lists any commitments or action items, and can serve as a formal record. South African business tone. Return only the email body, no subject line.`,
          user: `Client: ${client?.name}\nChannel: ${channelLabel}\n\n${rawText}`,
          maxTokens: 600,
        }),
      });
      const data = await res.json();
      setDraftEmail(data.content?.trim() || `I trust this email finds you well.\n\nI am writing to confirm our recent ${channelLabel} discussion.\n\n${rawText}\n\nKind regards,\nJonathan\nURUP Connect`);
    } catch {
      setDraftEmail(`I trust this email finds you well.\n\nI am writing to confirm our recent ${channelLabel} discussion.\n\n${rawText}\n\nKind regards,\nJonathan\nURUP Connect`);
    } finally { setConverting(false); }
  };

  const handleSave = async () => {
    if (!subject.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/db/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: id,
          clientName: client?.name || "",
          type: channel,
          direction: "outbound",
          subject,
          body: `FORMAL EMAIL:\n\n${draftEmail}\n\n---\nORIGINAL ${channel.toUpperCase()} CONVERSATION:\n\n${rawText}`,
          actionRequired: false,
        }),
      });
      setRawText(""); setDraftEmail(""); setSubject(""); setShowCapture(false);
      fetchData();
    } catch {}
    finally { setSaving(false); }
  };

  const groups = groupByDate(comms);
  const channelLabel = channel.charAt(0).toUpperCase() + channel.slice(1);

  return (
    <>
      <Header
        title={`${client?.name || "Client"} — Conversations`}
        subtitle="All communications in one threaded view"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href={`/clients/${id}`}>
              <button className="btn-secondary" style={{ fontSize: 12 }}>Back to Profile</button>
            </Link>
            <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => setShowCapture(p => !p)}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {showCapture ? "Hide" : "Log Conversation"}
            </button>
          </div>
        }
      />

      <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>

        {/* Left — thread view */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: showCapture ? "1px solid var(--border)" : "none" }}>

          {/* Stats bar */}
          <div style={{ padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)", display: "flex", gap: 20, alignItems: "center" }}>
            {[
              { label: "Total", value: comms.length },
              { label: "Inbound", value: comms.filter(c => c.direction === "inbound").length },
              { label: "Outbound", value: comms.filter(c => c.direction === "outbound").length },
              { label: "Action Required", value: comms.filter(c => c.action_required && c.action_status === "pending").length },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{s.value}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</span>
              </div>
            ))}
            <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>
              Teams Chat sync available once Microsoft Graph is approved
            </div>
          </div>

          {/* Thread */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 0 }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 12, width: "40%", marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 60, borderRadius: 12 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : comms.length === 0 ? (
              <div className="empty-state" style={{ marginTop: 40 }}>
                <div className="empty-state-icon">
                  <svg width="22" height="22" fill="none" stroke="var(--text-muted)" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="empty-state-title">No conversations yet</div>
                <div className="empty-state-subtitle">Log an email, meeting, or WhatsApp conversation to start building the history for {client?.name}.</div>
                <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => setShowCapture(true)}>Log First Conversation</button>
              </div>
            ) : (
              Object.entries(groups).map(([date, items]) => (
                <div key={date}>
                  {/* Date divider */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, padding: "2px 10px", background: "var(--bg-elevated)", borderRadius: 20, border: "1px solid var(--border)" }}>{date}</span>
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  </div>

                  {/* Messages */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {items.map(comm => {
                      const isOutbound = comm.direction === "outbound";
                      const tc = getTypeConfig(comm.type);
                      const isExpanded = expanded === comm.id;
                      const time = new Date(comm.received_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
                      const preview = comm.body?.split("\n")[0]?.slice(0, 120) || "";

                      return (
                        <div key={comm.id} style={{ display: "flex", flexDirection: isOutbound ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
                          {/* Avatar */}
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                            background: isOutbound ? "var(--accent-green)" : "var(--bg-elevated)",
                            border: isOutbound ? "none" : "1px solid var(--border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700,
                            color: isOutbound ? "white" : "var(--text-secondary)",
                          }}>
                            {isOutbound ? "JV" : (client?.name?.charAt(0) || "C")}
                          </div>

                          {/* Bubble */}
                          <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 4, alignItems: isOutbound ? "flex-end" : "flex-start" }}>
                            {/* Meta */}
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 14, height: 14, borderRadius: 3, background: tc.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="9" height="9" fill="none" stroke={tc.color} strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d={tc.icon} />
                                </svg>
                              </div>
                              <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>{tc.label}</span>
                              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{time}</span>
                              {comm.action_required && comm.action_status === "pending" && (
                                <span style={{ fontSize: 9, background: "#fef3c7", color: "#92400e", padding: "1px 6px", borderRadius: 8, fontWeight: 700 }}>ACTION</span>
                              )}
                            </div>

                            {/* Bubble */}
                            <div
                              onClick={() => setExpanded(isExpanded ? null : comm.id)}
                              style={{
                                background: isOutbound ? "var(--accent-green)" : "var(--bg-elevated)",
                                color: isOutbound ? "white" : "var(--text-primary)",
                                borderRadius: isOutbound ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                                padding: "10px 14px",
                                cursor: "pointer",
                                border: isOutbound ? "none" : "1px solid var(--border)",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                                transition: "box-shadow 0.15s",
                              }}
                            >
                              {/* Subject */}
                              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, opacity: isOutbound ? 0.9 : 1 }}>{comm.subject}</div>
                              {/* Body preview or full */}
                              <div style={{ fontSize: 12, lineHeight: 1.6, opacity: isOutbound ? 0.9 : 0.8, whiteSpace: "pre-wrap" }}>
                                {isExpanded ? comm.body : preview}
                                {!isExpanded && (comm.body?.length || 0) > 120 && (
                                  <span style={{ opacity: 0.6 }}> ...</span>
                                )}
                              </div>
                              {/* AI summary */}
                              {isExpanded && comm.ai_summary && (
                                <div style={{ marginTop: 10, padding: "8px 10px", background: isOutbound ? "rgba(255,255,255,0.15)" : "var(--bg-surface)", borderRadius: 8, fontSize: 11, opacity: 0.9 }}>
                                  <span style={{ fontWeight: 700 }}>AI Summary: </span>{comm.ai_summary}
                                </div>
                              )}
                              {/* Expand hint */}
                              {(comm.body?.length || 0) > 120 && (
                                <div style={{ fontSize: 10, marginTop: 6, opacity: 0.6, textAlign: "right" }}>
                                  {isExpanded ? "Click to collapse" : "Click to expand"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Right — conversation capture panel */}
        {showCapture && (
          <div style={{ width: 380, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Log Conversation</div>
              <button onClick={() => setShowCapture(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Channel picker */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Channel</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["whatsapp", "sms", "email", "teams", "phone"].map(ch => (
                    <button
                      key={ch}
                      onClick={() => setChannel(ch)}
                      style={{
                        padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid",
                        background: channel === ch ? getTypeConfig(ch).color + "18" : "var(--bg-surface)",
                        color: channel === ch ? getTypeConfig(ch).color : "var(--text-muted)",
                        borderColor: channel === ch ? getTypeConfig(ch).color : "var(--border)",
                      }}
                    >
                      {ch.charAt(0).toUpperCase() + ch.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Raw paste */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Paste {channelLabel} Conversation</label>
                <textarea
                  className="input"
                  rows={8}
                  style={{ resize: "none", fontFamily: "monospace", fontSize: 11 }}
                  placeholder={`Paste raw ${channelLabel} conversation here...\n\nJonathan: Hi, following up on payment?\nClient: Sorry for delay, will process Friday\nJonathan: Thanks for confirming`}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                />
              </div>

              <button
                className="btn-primary"
                style={{ justifyContent: "center", opacity: converting || !rawText.trim() ? 0.7 : 1 }}
                onClick={handleConvert}
                disabled={converting || !rawText.trim()}
              >
                {converting ? "Converting..." : "Convert to Formal Email"}
              </button>

              {draftEmail && (
                <>
                  <div style={{ height: 1, background: "var(--border)" }} />
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Subject</label>
                    <input className="input" style={{ fontSize: 12 }} value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Draft Email — edit before saving</label>
                    <textarea className="input" rows={10} style={{ resize: "none", fontSize: 12, lineHeight: 1.6 }} value={draftEmail} onChange={e => setDraftEmail(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 12, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save to Thread"}
                    </button>
                    <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => { navigator.clipboard.writeText(`Subject: ${subject}\n\n${draftEmail}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
