"use client";
import Sidebar from "@/components/layout/Sidebar";
import ClientContextPanel from "@/components/layout/ClientContextPanel";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { ClientContextProvider, useActiveClient } from "@/lib/clientContext";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { activeClient } = useActiveClient();
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <Sidebar />
      <main
        className="app-main-content"
        style={{
          flex: 1,
          marginLeft: 220,
          marginRight: activeClient ? 260 : 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "margin-right 0.2s",
        }}
      >
        {children}
      </main>
      <ClientContextPanel />
      <MobileBottomNav />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientContextProvider>
      <LayoutInner>{children}</LayoutInner>
    </ClientContextProvider>
  );
}
