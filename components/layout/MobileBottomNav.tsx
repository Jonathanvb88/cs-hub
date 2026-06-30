"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/clients", label: "Clients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/inbox", label: "Inbox", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", badge: 4 },
  { href: "/documents", label: "Docs", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/intelligence", label: "AI", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-bottom-nav" style={{
      display: "none",
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: "var(--bg-surface)", borderTop: "1px solid var(--border)",
      padding: "6px 4px", paddingBottom: "calc(6px + env(safe-area-inset-bottom))",
      alignItems: "center",
    }}>
      {navItems.map(item => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} className={`bottom-nav-link${isActive ? " active" : ""}`}>
            <div style={{ position: "relative" }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={isActive ? 2.2 : 1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.badge && (
                <span style={{
                  position: "absolute", top: -4, right: -8,
                  background: "var(--accent-red)", color: "white",
                  fontSize: 9, fontWeight: 700, borderRadius: 8,
                  padding: "0px 4px", lineHeight: "13px", minWidth: 13, textAlign: "center",
                }}>{item.badge}</span>
              )}
            </div>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
