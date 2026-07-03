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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#14171a" }}>
      <div style={{ fontSize: 13, color: "#8a928a" }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #14171a 0%, #1e2226 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "white", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        <div style={{ background: "#14171a", padding: "32px 36px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <img src="/logo.png" alt="CS Hub" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "contain", background: "white" }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>CS Hub</div>
              <div style={{ fontSize: 11, color: "#7a827e" }}>URUP Connect</div>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 6 }}>Welcome back</div>
          <div style={{ fontSize: 13, color: "#8a928a" }}>Sign in with your Microsoft 365 account</div>
        </div>
        <div style={{ padding: "32px 36px" }}>
          <button
            onClick={() => signIn("azure-ad", { callbackUrl })}
            style={{ width: "100%", padding: "14px 20px", background: "#0078d4", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}
          >
            <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Sign in with Microsoft 365
          </button>
          <div style={{ marginTop: 20, padding: "14px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
              🔒 Secured by Microsoft Azure AD. CS Hub never stores your password. Access restricted to authorised URUP Connect accounts only.
            </div>
          </div>
          <div style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
            By signing in you agree to URUP Connect&apos;s data handling policies in accordance with POPIA.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#14171a" }} />}>
      <LoginContent />
    </Suspense>
  );
}
