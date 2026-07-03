"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { getDevPageInfo } from "@/lib/devRegistry";

const REPO_BASE = "https://github.com/Jonathanvb88/cs-hub/blob/main";

interface BuildInfo {
  commitSha: string;
  commitMessage: string | null;
  branch: string | null;
  environment: string;
}

export default function DevBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [on, setOn] = useState(false);
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("cshub-dev-mode");
    if (stored === "true") setOn(true);
  }, []);

  useEffect(() => {
    if (on && !buildInfo) {
      fetch("/api/build-info")
        .then((r) => r.json())
        .then(setBuildInfo)
        .catch(() => {});
    }
  }, [on, buildInfo]);

  if (!session?.user?.isDeveloper) return null;

  const toggle = () => {
    const next = !on;
    setOn(next);
    window.localStorage.setItem("cshub-dev-mode", String(next));
  };

  const info = getDevPageInfo(pathname || "/");

  return (
    <>
      <button
        onClick={toggle}
        title="Developer mode"
        style={{
          position: "fixed",
          bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
          right: "calc(16px + env(safe-area-inset-right, 0px))",
          zIndex: 9999,
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: on ? "#15803D" : "#14171A",
          color: "#fff",
          border: "2px solid #15803D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontFamily: "monospace",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
        }}
      >
        {"</>"}
      </button>

      {on && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(66px + env(safe-area-inset-bottom, 0px))",
            right: "calc(16px + env(safe-area-inset-right, 0px))",
            zIndex: 9999,
            width: 320,
            maxWidth: "calc(100vw - 32px)",
            background: "#14171A",
            color: "#f1f3f1",
            border: "1px solid #15803D",
            borderRadius: 10,
            padding: 14,
            fontSize: 12,
            fontFamily: "ui-monospace, monospace",
            lineHeight: 1.6,
            boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
          }}
        >
          <div style={{ fontWeight: 700, color: "#22c55e", marginBottom: 8, fontSize: 13, letterSpacing: 0.3 }}>
            DEVELOPER MODE
          </div>

          <div style={{ marginBottom: 6 }}>
            <span style={{ color: "#98a098" }}>Route:</span> {pathname}
          </div>

          <div style={{ marginBottom: 6, wordBreak: "break-all" }}>
            <span style={{ color: "#98a098" }}>File:</span>{" "}
            <a
              href={`${REPO_BASE}/${info.file}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#22c55e", textDecoration: "underline" }}
            >
              {info.file}
            </a>
          </div>

          {info.apiRoutes && info.apiRoutes.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ color: "#98a098" }}>API calls:</span>
              <ul style={{ margin: "4px 0 0 0", paddingLeft: 16 }}>
                {info.apiRoutes.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {info.notes && (
            <div style={{ marginBottom: 6, color: "#b45309" }}>{info.notes}</div>
          )}

          <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid #1e2226", color: "#98a098" }}>
            {buildInfo ? (
              <>
                <div>Commit: {buildInfo.commitSha === "local" ? "local (not deployed)" : buildInfo.commitSha.slice(0, 7)}</div>
                <div>Branch: {buildInfo.branch || "—"}</div>
                <div>Env: {buildInfo.environment}</div>
              </>
            ) : (
              <div>Loading build info…</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
