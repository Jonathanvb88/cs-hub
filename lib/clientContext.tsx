"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface ActiveClient {
  id: string;
  name: string;
  industry?: string;
  health_score?: number;
  health_status?: string;
}

interface ClientContextType {
  activeClient: ActiveClient | null;
  setActiveClient: (client: ActiveClient | null) => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientContextProvider({ children }: { children: React.ReactNode }) {
  const [activeClient, setActiveClientState] = useState<ActiveClient | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("cshub_active_client");
    if (stored) {
      try { setActiveClientState(JSON.parse(stored)); } catch {}
    }
  }, []);

  const setActiveClient = (client: ActiveClient | null) => {
    setActiveClientState(client);
    if (client) {
      sessionStorage.setItem("cshub_active_client", JSON.stringify(client));
      setPanelOpen(true);
    } else {
      sessionStorage.removeItem("cshub_active_client");
      setPanelOpen(false);
    }
  };

  return (
    <ClientContext.Provider value={{ activeClient, setActiveClient, panelOpen, setPanelOpen }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useActiveClient() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error("useActiveClient must be used within ClientContextProvider");
  return ctx;
}
