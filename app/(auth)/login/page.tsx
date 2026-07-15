"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    if (status === "authenticated") router.push(callbackUrl);
  }, [status, router, callbackUrl]);

  if (status === "loading") return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, border: "2px solid #15803d", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "Inter, -apple-system, sans-serif",
    }}>

      {/* Soft mesh gradient background - lightened for a white base */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {/* Primary orb - top left */}
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: "55vw", height: "55vw",
          background: "radial-gradient(circle, rgba(21,128,61,0.08) 0%, transparent 70%)",
          animation: "orb1 8s ease-in-out infinite alternate",
          borderRadius: "50%",
        }} />
        {/* Secondary orb - bottom right */}
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%",
          width: "50vw", height: "50vw",
          background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)",
          animation: "orb2 10s ease-in-out infinite alternate",
          borderRadius: "50%",
        }} />
        {/* Accent orb - centre */}
        <div style={{
          position: "absolute", top: "40%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "30vw", height: "30vw",
          background: "radial-gradient(circle, rgba(21,128,61,0.05) 0%, transparent 70%)",
          animation: "orb3 12s ease-in-out infinite alternate",
          borderRadius: "50%",
        }} />
      </div>

      {/* Grid lines overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(21,128,61,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(21,128,61,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: i % 3 === 0 ? 3 : 2,
          height: i % 3 === 0 ? 3 : 2,
          borderRadius: "50%",
          background: `rgba(21,128,61,${0.2 + (i % 4) * 0.08})`,
          left: `${8 + i * 8}%`,
          top: `${10 + (i * 17 % 80)}%`,
          animation: `float${i % 4} ${4 + i % 5}s ease-in-out infinite alternate`,
        }} />
      ))}

      {/* Login card — clean light card */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: 400,
        margin: "24px",
        background: "#ffffff",
        borderRadius: 24,
        border: "1px solid #e5e7eb",
        boxShadow: "0 0 0 1px rgba(21,128,61,0.06), 0 24px 60px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>

        {/* Top accent line */}
        <div style={{
          height: 2,
          background: "linear-gradient(90deg, transparent, #22c55e, transparent)",
        }} />

        <div style={{ padding: "36px 36px 28px" }}>

          {/* Logo - no glow */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <img src="/logo.png" alt="CS Hub" style={{ width: 170, objectFit: "contain", display: "block", margin: "0 auto" }} />
          </div>

          {/* Welcome */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#15803d", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
              Client Success Platform
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6, letterSpacing: "-0.02em" }}>
              Welcome back
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Sign in securely using your preferred platform
            </div>
          </div>

          {/* Provider buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Microsoft */}
            <button
              onClick={() => signIn("azure-ad", { callbackUrl })}
              style={{
                width: "100%", padding: "13px 18px",
                background: "#f8fafc",
                color: "#1e293b",
                border: "1px solid #e2e8f0",
                borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,120,212,0.08)"; e.currentTarget.style.borderColor = "rgba(0,120,212,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none" style={{ flexShrink: 0 }}>
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              <span style={{ flex: 1, textAlign: "left" }}>Continue with Microsoft 365</span>
              <svg width="13" height="13" fill="none" stroke="#94a3b8" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Google */}
            <button
              onClick={() => signIn("google", { callbackUrl })}
              style={{
                width: "100%", padding: "13px 18px",
                background: "#f8fafc",
                color: "#1e293b",
                border: "1px solid #e2e8f0",
                borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(66,133,244,0.08)"; e.currentTarget.style.borderColor = "rgba(66,133,244,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span style={{ flex: 1, textAlign: "left" }}>Continue with Google</span>
              <svg width="13" height="13" fill="none" stroke="#94a3b8" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            {/* GitHub */}
            <button
              onClick={() => signIn("github", { callbackUrl })}
              style={{
                width: "100%", padding: "13px 18px",
                background: "#f8fafc",
                color: "#1e293b",
                border: "1px solid #e2e8f0",
                borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span style={{ flex: 1, textAlign: "left" }}>Continue with GitHub</span>
              <svg width="13" height="13" fill="none" stroke="#94a3b8" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* OAuth divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.1em" }}>SECURED BY OAUTH 2.0</span>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 36px 24px", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
            <svg width="12" height="12" fill="none" stroke="#15803d" strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
              CS Hub never stores your password. Authentication handled entirely by your provider.
            </span>
          </div>
          <div style={{ fontSize: 10, color: "#cbd5e1", textAlign: "center" }}>
            URUP Connect · POPIA compliant · South Africa
          </div>
        </div>

        {/* Bottom accent line */}
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(21,128,61,0.25), transparent)",
        }} />
      </div>

      <style>{`
        @keyframes orb1 {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(5%, 8%) scale(1.1); }
        }
        @keyframes orb2 {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(-6%, -5%) scale(1.15); }
        }
        @keyframes orb3 {
          from { transform: translate(-50%, -50%) scale(1); }
          to { transform: translate(-50%, -50%) scale(1.3); opacity: 0.6; }
        }
        @keyframes float0 { from { transform: translateY(0); } to { transform: translateY(-12px); } }
        @keyframes float1 { from { transform: translateY(0); } to { transform: translateY(-18px); } }
        @keyframes float2 { from { transform: translateY(0); } to { transform: translateY(-8px); } }
        @keyframes float3 { from { transform: translateY(0); } to { transform: translateY(-15px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#ffffff" }} />}>
      <LoginContent />
    </Suspense>
  );
}
