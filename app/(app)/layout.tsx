"use client";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 220, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
    </div>
  );
}
