"use client";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ClientContextPanel from "@/components/layout/ClientContextPanel";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MobileDrawer from "@/components/layout/MobileDrawer";
import { ClientContextProvider, useActiveClient } from "@/lib/clientContext";
import { ToastProvider } from "@/components/Toast";
import { NavProvider } from "@/lib/navContext";
import { createContext, useContext } from "react";

// Context so any Header deep in the tree can open the drawer
const DrawerContext = createContext<{ openDrawer: () => void }>({ openDrawer: () => {} });
export function useDrawer() { return useContext(DrawerContext); }

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { activeClient } = useActiveClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <DrawerContext.Provider value={{ openDrawer: () => setDrawerOpen(true) }}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
        <Sidebar />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
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
    </DrawerContext.Provider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <NavProvider>
        <ClientContextProvider>
          <LayoutInner>{children}</LayoutInner>
        </ClientContextProvider>
      </NavProvider>
    </ToastProvider>
  );
}

