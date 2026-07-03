"use client";
import { createContext, useContext, useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", required: true },
  { href: "/clients", label: "Clients", required: true },
  { href: "/projects", label: "Projects" },
  { href: "/inbox", label: "Work Inbox" },
  { href: "/communications", label: "Communications" },
  { href: "/followups", label: "Follow-ups" },
  { href: "/reminders", label: "Reminders" },
  { href: "/calendar", label: "Calendar" },
  { href: "/documents", label: "Documents" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/health", label: "Health" },
  { href: "/intelligence", label: "Intelligence" },
  { href: "/reports", label: "Reports" },
  { href: "/analytics", label: "Analytics" },
  { href: "/team", label: "Team" },
  { href: "/search", label: "Search" },
];

export { NAV_ITEMS };

interface NavContextType {
  hiddenItems: string[];
  setHiddenItems: (items: string[]) => void;
  lockSidebarOpen: boolean;
  setLockSidebarOpen: (locked: boolean) => void;
  loaded: boolean;
}

const NavContext = createContext<NavContextType>({
  hiddenItems: [],
  setHiddenItems: () => {},
  lockSidebarOpen: false,
  setLockSidebarOpen: () => {},
  loaded: false,
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [hiddenItems, setHiddenItemsState] = useState<string[]>([]);
  const [lockSidebarOpen, setLockSidebarOpenState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/db/nav-preferences")
      .then(r => r.json())
      .then(d => {
        setHiddenItemsState(d.hiddenItems || []);
        setLockSidebarOpenState(d.lockSidebarOpen || false);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const setHiddenItems = async (items: string[]) => {
    setHiddenItemsState(items);
    try {
      await fetch("/api/db/nav-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hiddenItems: items }),
      });
    } catch {}
  };

  const setLockSidebarOpen = async (locked: boolean) => {
    setLockSidebarOpenState(locked);
    try {
      await fetch("/api/db/nav-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockSidebarOpen: locked }),
      });
    } catch {}
  };

  return (
    <NavContext.Provider value={{ hiddenItems, setHiddenItems, lockSidebarOpen, setLockSidebarOpen, loaded }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}
