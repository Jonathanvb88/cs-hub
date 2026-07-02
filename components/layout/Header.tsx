"use client";
import { useDrawer } from "@/app/(app)/layout";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { openDrawer } = useDrawer();

  return (
    <div className="page-header">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Hamburger — shown only on mobile via CSS */}
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
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{actions}</div>}
    </div>
  );
}
