"use client";
import AppLayout from "@/app/(app)/layout";
import Header from "@/components/layout/Header";

export default function DocumentsPage() {
  return (
    <AppLayout>
      <Header title="Documents" subtitle="Quotes, SOWs, POCs and contracts" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: 64, textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <svg width="28" height="28" fill="none" stroke="var(--accent-blue)" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Documents</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 360, lineHeight: 1.6, marginBottom: 24 }}>
          Quote Builder, SOW Builder, POC Builder and document storage. Arriving in Sprint 2.
        </div>
        <span className="badge badge-blue">Coming in Sprint 2</span>
      </div>
    </AppLayout>
  );
}
