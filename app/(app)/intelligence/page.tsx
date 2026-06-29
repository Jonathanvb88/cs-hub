"use client";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";

export default function IntelligencePage() {
  return (
    <AppLayout>
      <Header title="Intelligence" subtitle="AI Requirement Analysis and Project Intelligence" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: 64, textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: "rgba(139,92,246,0.1)",
          border: "1px solid rgba(139,92,246,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <svg width="28" height="28" fill="none" stroke="var(--accent-purple)" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Intelligence</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 380, lineHeight: 1.6, marginBottom: 16 }}>
          AI Requirement Capture Engine, Project Intelligence, Organisational Memory and Knowledge Reuse. Arriving in Sprint 3.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 400, marginBottom: 24 }}>
          {[
            "Paste an email — get user stories and developer tasks",
            "Detect similar previous projects automatically",
            "Estimate asset reuse and save preparation time",
            "Ask the Customer — AI drafts clarification emails",
          ].map(f => (
            <div key={f} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "10px 14px", textAlign: "left",
            }}>
              <svg width="14" height="14" fill="none" stroke="var(--accent-purple)" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{f}</span>
            </div>
          ))}
        </div>
        <span className="badge badge-purple">Coming in Sprint 3</span>
      </div>
    </AppLayout>
  );
}
