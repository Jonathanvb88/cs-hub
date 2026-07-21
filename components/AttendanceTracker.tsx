"use client";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export default function AttendanceTracker() {
  const { status } = useSession();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    const ping = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/db/attendance/ping", { method: "POST" }).catch(() => {});
    };

    // First ping right away so opening the app at all counts as arriving,
    // not just whenever the first 5-minute interval happens to land.
    ping();
    intervalRef.current = setInterval(ping, PING_INTERVAL_MS);

    // Also ping immediately when someone switches back to this tab after
    // being away, rather than waiting out the rest of the interval.
    const onVisible = () => { if (document.visibilityState === "visible") ping(); };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [status]);

  return null;
}
