"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    if (status === "authenticated") router.push(callbackUrl);
  }, [status, router, callbackUrl]);

  if (status === "loading") return (
    <div style={{ minHeight: "100vh", background: "#0a0f0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #15803d", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8faf8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "Inter, -apple-system, sans-serif",
    }}>

      {/* Dot grid pattern - top left */}
      <svg style={{ position: "absolute", top: 0, left: 0, width: 280, height: 280, opacity: 0.25 }} viewBox="0 0 280 280">
        {Array.from({ length: 10 }, (_, row) =>
          Array.from({ length: 10 }, (_, col) => (
            <circle key={`${row}-${col}`} cx={col * 28 + 14} cy={row * 28 + 14} r={2} fill="#15803d" />
          ))
        )}
      </svg>

      {/* Dot grid pattern - bottom right */}
      <svg style={{ position: "absolute", bottom: 0, right: 0, width: 220, height: 220, opacity: 0.2 }} viewBox="0 0 220 220">
        {Array.from({ length: 8 }, (_, row) =>
          Array.from({ length: 8 }, (_, col) => (
            <circle key={`${row}-${col}`} cx={col * 28 + 14} cy={row * 28 + 14} r={2} fill="#15803d" />
          ))
        )}
      </svg>

      {/* Organic green curve - top right */}
      <svg style={{ position: "absolute", top: -60, right: -60, width: 380, height: 380, opacity: 0.12 }} viewBox="0 0 380 380">
        <path d="M380,0 C280,80 320,200 200,260 C80,320 0,280 0,380 L380,380 Z" fill="#15803d" />
      </svg>
      <svg style={{ position: "absolute", top: -40, right: -40, width: 300, height: 300, opacity: 0.07 }} viewBox="0 0 300 300">
        <path d="M300,0 C220,60 260,160 160,210 C60,260 0,220 0,300 L300,300 Z" fill="#22c55e" />
      </svg>

      {/* Organic green curve - bottom left */}
      <svg style={{ position: "absolute", bottom: -60, left: -60, width: 360, height: 360, opacity: 0.1 }} viewBox="0 0 360 360">
        <path d="M0,360 C80,260 200,300 260,180 C320,60 280,0 360,0 L0,0 Z" fill="#15803d" />
      </svg>
      <svg style={{ position: "absolute", bottom: -40, left: -40, width: 280, height: 280, opacity: 0.06 }} viewBox="0 0 280 280">
        <path d="M0,280 C60,200 160,240 210,140 C260,40 220,0 280,0 L0,0 Z" fill="#22c55e" />
      </svg>

      {/* Login card */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        margin: "24px",
        background: "white",
        borderRadius: 24,
        boxShadow: "0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Card top accent */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #15803d, #22c55e, #15803d)" }} />

        <div style={{ padding: "40px 40px 36px" }}>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <img
              src="/logo.png"
              alt="CS Hub"
              style={{ width: 100, height: 100, objectFit: "contain" }}
            />
          </div>

          {/* CS HUB text */}
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#15803d", letterSpacing: "-0.02em" }}>CS </span>
            <span style={{ fontSize: 28, fontWeight: 800, color: "#14171a", letterSpacing: "-0.02em" }}>HUB</span>
          </div>

          {/* Tagline */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>Work Smarter. </span>
            <span style={{ fontSize: 12, color: "#5b6460", fontWeight: 500 }}>Deliver Better.</span>
          </div>

          {/* Welcome text */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#14171a", marginBottom: 4 }}>Welcome back</div>
            <div style={{ fontSize: 13, color: "#8a928a" }}>Sign in securely using your preferred platform</div>
          </div>

          {/* Provider buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Microsoft */}
            <button
              onClick={() => signIn("azure-ad", { callbackUrl })}
              style={{
                width: "100%", padding: "13px 20px",
                background: "#ffffff",
                color: "#14171a",
                border: "1.5px solid #e2e8e2",
                borderRadius: 12,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12,
                transition: "all 0.15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#0078d4"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,120,212,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8e2"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
            >
              <svg width="20" height="20" viewBox="0 0 21 21" fill="none" style={{ flexShrink: 0 }}>
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              <span style={{ flex: 1, textAlign: "left" }}>Continue with Microsoft 365</span>
              <svg width="14" height="14" fill="none" stroke="#8a928a" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Google */}
            <button
              onClick={() => signIn("google", { callbackUrl })}
              style={{
                width: "100%", padding: "13px 20px",
                background: "#ffffff",
                color: "#14171a",
                border: "1.5px solid #e2e8e2",
                borderRadius: 12,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12,
                transition: "all 0.15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#4285f4"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(66,133,244,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8e2"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span style={{ flex: 1, textAlign: "left" }}>Continue with Google</span>
              <svg width="14" height="14" fill="none" stroke="#8a928a" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            {/* GitHub */}
            <button
              onClick={() => signIn("github", { callbackUrl })}
              style={{
                width: "100%", padding: "13px 20px",
                background: "#ffffff",
                color: "#14171a",
                border: "1.5px solid #e2e8e2",
                borderRadius: 12,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12,
                transition: "all 0.15s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#24292e"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(36,41,46,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8e2"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#24292e" style={{ flexShrink: 0 }}>
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span style={{ flex: 1, textAlign: "left" }}>Continue with GitHub</span>
              <svg width="14" height="14" fill="none" stroke="#8a928a" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e8ede8" }} />
            <span style={{ fontSize: 11, color: "#b0b8b0", fontWeight: 500 }}>SECURED BY OAUTH 2.0</span>
            <div style={{ flex: 1, height: 1, background: "#e8ede8" }} />
          </div>
        </div>

        {/* Card footer */}
        <div style={{ background: "#f8faf8", padding: "16px 40px 24px", borderTop: "1px solid #f0f4f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <svg width="14" height="14" fill="none" stroke="#15803d" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span style={{ fontSize: 11, color: "#5b6460", lineHeight: 1.5 }}>
              Your credentials are handled entirely by your chosen provider. CS Hub never stores or sees your password.
            </span>
          </div>
          <div style={{ fontSize: 10, color: "#a0a8a0", textAlign: "center" }}>
            By signing in you agree to URUP Connect&apos;s data policies in accordance with POPIA · South Africa
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#f8faf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #15803d", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
