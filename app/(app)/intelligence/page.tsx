"use client";
import Link from "next/link";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";

const modules = [
  {
    href: "/intelligence/capture",
    title: "Requirement Capture Engine",
    description: "Paste an email, meeting note, or document. AI classifies the request, extracts requirements, generates user stories, acceptance criteria, and developer tasks.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    color: "var(--accent-blue)",
    badge: "Live",
    badgeClass: "badge-green",
  },
  {
    href: "/intelligence/tickets",
    title: "Ticket Review & Export",
    description: "Review AI-generated ticket packages. Edit, approve, reject, split, and reprioritise before exporting to your ticketing system.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    color: "var(--accent-green)",
    badge: "Live",
    badgeClass: "badge-green",
  },
  {
    href: "/intelligence/meeting",
    title: "Meeting Intelligence",
    description: "Paste Teams meeting notes or a transcript. AI generates a structured summary, decisions, and action items with owners.",
    icon: "M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    color: "var(--accent-purple)",
    badge: "Live",
    badgeClass: "badge-green",
  },
  {
    href: "/intelligence/projects",
    title: "Project Intelligence",
    description: "Describe a new request. AI searches previous projects for similar work, estimates reuse percentage, and surfaces relevant assets.",
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4-8 4s8 1.79 8 4",
    color: "var(--accent-amber)",
    badge: "Live",
    badgeClass: "badge-green",
  },
];

export default function IntelligencePage() {
  return (
    <AppLayout>
      <Header title="Intelligence" subtitle="AI-powered requirement analysis and project knowledge" />
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Hero banner */}
        <div style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 100%)",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: 16, padding: 28,
          display: "flex", alignItems: "center", gap: 24,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "rgba(59,130,246,0.15)",
            border: "1px solid rgba(59,130,246,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="26" height="26" fill="none" stroke="var(--accent-blue)" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              AI-Powered Client Success Intelligence
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 620 }}>
              CS Hub reads your emails, meeting notes, and documents. It understands what the customer is asking for, generates structured requirements, and builds developer-ready tickets — with complete traceability from request to deployment.
            </div>
          </div>
          <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            <Link href="/intelligence/capture">
              <button className="btn-primary" style={{ fontSize: 13, padding: "9px 18px" }}>
                Start Capturing
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
          </div>
        </div>

        {/* Module cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {modules.map(mod => (
            <Link key={mod.href} href={mod.href} style={{ textDecoration: "none" }}>
              <div className="card" style={{
                cursor: "pointer", transition: "border-color 0.15s, transform 0.15s",
                height: "100%",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: mod.color + "18",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <svg width="20" height="20" fill="none" stroke={mod.color} strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={mod.icon} />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{mod.title}</span>
                      <span className={`badge ${mod.badgeClass}`}>{mod.badge}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{mod.description}</div>
                  </div>
                  <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 4 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* How it works */}
        <div className="card">
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>End-to-End Traceability</div>
          <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
            {[
              { label: "Customer Email", color: "var(--accent-blue)" },
              { label: "AI Extraction", color: "var(--accent-purple)" },
              { label: "User Stories", color: "var(--accent-green)" },
              { label: "Developer Tasks", color: "var(--accent-amber)" },
              { label: "Ticket Export", color: "var(--accent-green)" },
              { label: "Deployment", color: "var(--accent-blue)" },
            ].map((step, i, arr) => (
              <div key={step.label} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  background: step.color + "18",
                  border: `1px solid ${step.color}40`,
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12, fontWeight: 600,
                  color: step.color,
                  whiteSpace: "nowrap",
                }}>
                  {step.label}
                </div>
                {i < arr.length - 1 && (
                  <svg width="20" height="20" fill="none" stroke="var(--text-muted)" strokeWidth={1.5} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
