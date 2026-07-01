"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";

interface Client {
  id: string;
  name: string;
  industry: string | null;
}

interface SavedConversation {
  id: string;
  subject: string;
  body: string | null;
  received_at: string;
  type: string;
}

const CHANNELS = [
  { value: "whatsapp", label: "WhatsApp", color: "#15803d" },
  { value: "sms", label: "SMS", color: "#2563eb" },
  { value: "teams", label: "Teams Chat", color: "#7c3aed" },
  { value: "phone", label: "Phone Call Notes", color: "#b45309" },
  { value: "other", label: "Other", color: "#94a3b8" },
];

export default function ConversationsPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState("whatsapp");
  const [rawText, setRawText] = useState("");
  const [subject, setSubject] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [converting, setConverting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch("/api/db/clients")
      .then(r => r.json())
      .then(d => {
        const found = d.clients?.find((c: Client) => c.id === id);
        setClient(found || null);
      });
    fetch(`/api/db/communications`)
      .then(r => r.json())
      .then(d => {
        const filtered = (d.communications || []).filter((c: SavedConversation & { client_id: string }) => c.client_id === id);
        setConversations(filtered);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const channelLabel = CHANNELS.find(c => c.value === channel)?.label || channel;

  const handleConvert = async () => {
    if (!rawText.trim()) return;
    setConverting(true);
    setDraftEmail("");
    const autoSubject = `${channelLabel} conversation summary — ${client?.name || "Client"} — ${new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}`;
    setSubject(autoSubject);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a professional Client Success Manager at URUP Connect, a South African technology company. Convert the following informal ${channelLabel} conversation into a formal, professional email that:
1. Confirms what was discussed
2. Lists any commitments, decisions, or action items clearly
3. Notes any payment discussions, timelines, or scope items
4. Uses a professional South African business tone
5. Can serve as a formal record of the discussion

Return only the email body text (no subject line, no "Dear" greeting needed — just the body starting from "I trust this email finds you well" or similar).`,
          user: `Client: ${client?.name || "Client"}\nChannel: ${channelLabel}\n\nRaw conversation:\n${rawText}`,
          maxTokens: 800,
        }),
      });
      const data = await res.json();
      if (data.content) {
        setDraftEmail(data.content.trim());
      } else {
        // Graceful fallback if AI is unavailable
        setDraftEmail(
          `I trust this email finds you well.\n\nI am writing to confirm the details of our recent ${channelLabel} conversation.\n\n${rawText}\n\nPlease confirm receipt of this email and that the above accurately reflects our discussion.\n\nKind regards,\nJonathan\nURUP Connect`
        );
      }
    } catch {
      setDraftEmail(
        `I trust this email finds you well.\n\nI am writing to confirm the details of our recent ${channelLabel} conversation.\n\n${rawText}\n\nPlease confirm receipt of this email and that the above accurately reflects our discussion.\n\nKind regards,\nJonathan\nURUP Connect`
      );
    } finally {
      setConverting(false);
    }
  };

  const handleSave = async () => {
    if (!subject.trim() || !draftEmail.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/db/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: id,
          clientName: client?.name || "",
          type: channel,
          direction: "outbound",
          subject,
          body: `FORMAL EMAIL:\n\n${draftEmail}\n\n---\nORIGINAL ${channelLabel.toUpperCase()} CONVERSATION:\n\n${rawText}`,
          actionRequired: false,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setRawText("");
      setDraftEmail("");
      setSubject("");
      // Refresh list
      fetch("/api/db/communications")
        .then(r => r.json())
        .then(d => {
          const filtered = (d.communications || []).filter((c: SavedConversation & { client_id: string }) => c.client_id === id);
          setConversations(filtered);
        });
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${draftEmail}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header
        title={`${client?.name || "Client"} — Conversations`}
        subtitle="Convert WhatsApp, SMS, and other channel conversations into formal email records"
        actions={
          <Link href={`/clients/${id}`}>
            <button className="btn-secondary" style={{ fontSize: 12 }}>Back to Profile</button>
          </Link>
        }
      />

      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left: Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>New Conversation</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Channel</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CHANNELS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setChannel(c.value)}
                    style={{
                      padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                      cursor: "pointer", border: "1px solid",
                      background: channel === c.value ? c.color + "18" : "var(--bg-elevated)",
                      color: channel === c.value ? c.color : "var(--text-muted)",
                      borderColor: channel === c.value ? c.color : "var(--border)",
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
                Paste {channelLabel} Conversation
              </label>
              <textarea
                className="input"
                rows={12}
                style={{ resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
                placeholder={`Paste the raw ${channelLabel} conversation here...\n\nExample:\nJonathan: Hi, just checking on the payment?\nClient: Hi, sorry for the delay, will process by Friday\nJonathan: Great, thanks for confirming`}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
              />
            </div>

            <button
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", opacity: converting || !rawText.trim() ? 0.7 : 1 }}
              onClick={handleConvert}
              disabled={converting || !rawText.trim()}
            >
              {converting ? "Converting..." : `Convert to Formal Email`}
            </button>
          </div>

          {/* Saved conversations */}
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
              Saved Conversations ({conversations.length})
            </div>
            {loading ? (
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Loading...</div>
            ) : conversations.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No conversations saved yet for this client</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {conversations.map(c => (
                  <div key={c.id} style={{ padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: 8, border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 2 }}>{c.subject}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {c.type.charAt(0).toUpperCase() + c.type.slice(1)} · {new Date(c.received_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Draft email */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {draftEmail ? (
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Draft Email</div>
                {saved && <span className="badge badge-green">Saved to Communications</span>}
              </div>

              {error && (
                <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#dc2626", marginBottom: 12 }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Subject</label>
                <input className="input" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Email Body — edit before saving</label>
                <textarea
                  className="input"
                  rows={16}
                  style={{ resize: "vertical", lineHeight: 1.7 }}
                  value={draftEmail}
                  onChange={e => setDraftEmail(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : "Save to Communications"}
                </button>
                <button className="btn-secondary" onClick={copyEmail}>
                  {copied ? "Copied!" : "Copy Email"}
                </button>
                <button className="btn-secondary" onClick={handleConvert} disabled={converting}>
                  Regenerate
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
              <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                <svg width="48" height="48" fill="none" stroke="var(--border)" strokeWidth={1.5} viewBox="0 0 24 24" style={{ margin: "0 auto 12px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div style={{ fontSize: 13 }}>Paste a conversation and click Convert</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>Your formal email draft will appear here</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
