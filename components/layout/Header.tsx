"use client";
import Link from "next/link";
import { useDrawer } from "@/app/(app)/layout";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}

export default function Header({ title, subtitle, actions, breadcrumbs }: HeaderProps) {
  const { openDrawer } = useDrawer();

  return (
    <div className="page-header" style={{
      borderTop: "2px solid var(--accent-green)",
      background: "white",
      boxShadow: "0 1px 0 var(--border), 0 4px 12px rgba(0,0,0,0.03)",
      flexDirection: "column",
      alignItems: "stretch",
      gap: breadcrumbs && breadcrumbs.length > 0 ? 4 : 0,
    }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, fontSize: 12, color: "var(--text-muted)" }}>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {i > 0 && <span style={{ color: "var(--text-muted)" }}>/</span>}
              {crumb.href ? (
                <Link href={crumb.href} style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-green)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Hamburger — mobile only */}
          <button
            onClick={openDrawer}
            className="mobile-menu-btn"
            aria-label="Open menu"
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "4px 8px 4px 0", color: "var(--text-secondary)",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="page-title" style={{ color: "var(--text-primary)", fontWeight: 700 }}>{title}</h1>
            {subtitle && <p className="page-subtitle" style={{ color: "var(--text-muted)" }}>{subtitle}</p>}
          </div>
        </div>
        {actions && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{actions}</div>}
      </div>
    </div>
  );
}
