"use client";
import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Check if dismissed before
    if (localStorage.getItem("cshub_install_dismissed")) return;

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const safari = /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);
    if (ios && safari) {
      setIsIOS(true);
      setTimeout(() => setShowIOS(true), 3000);
      return;
    }

    // Listen for Chrome/Android install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    setShowIOS(false);
    localStorage.setItem("cshub_install_dismissed", "1");
  };

  if (installed) return null;

  // Android/Desktop install banner
  if (show && prompt) return (
    <div style={{
      position: "fixed", bottom: 80, left: 16, right: 16, zIndex: 500,
      background: "#14171a", borderRadius: 16, padding: "14px 18px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", gap: 14,
      border: "1px solid #22c55e30",
      animation: "slideUp 0.3s ease",
    }}>
      <img src="/icon-72.png" alt="CS Hub" style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 2 }}>Add CS Hub to Home Screen</div>
        <div style={{ fontSize: 11, color: "#8a928a" }}>Install for quick access — works offline</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={handleDismiss} style={{ background: "none", border: "1px solid #374151", color: "#9ca3af", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
          Not now
        </button>
        <button onClick={handleInstall} style={{ background: "#15803d", border: "none", color: "white", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          Install
        </button>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );

  // iOS instructions banner
  if (showIOS) return (
    <div style={{
      position: "fixed", bottom: 80, left: 16, right: 16, zIndex: 500,
      background: "#14171a", borderRadius: 16, padding: "16px 18px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      border: "1px solid #22c55e30",
      animation: "slideUp 0.3s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/icon-72.png" alt="CS Hub" style={{ width: 36, height: 36, borderRadius: 8 }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Add CS Hub to Home Screen</div>
        </div>
        <button onClick={handleDismiss} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ background: "#1f2937", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>1</span>
          Tap the <span style={{ color: "#15803d", fontWeight: 600 }}>Share</span> button at the bottom of Safari
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ background: "#1f2937", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>2</span>
          Scroll down and tap <span style={{ color: "#15803d", fontWeight: 600 }}>"Add to Home Screen"</span>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );

  return null;
}
