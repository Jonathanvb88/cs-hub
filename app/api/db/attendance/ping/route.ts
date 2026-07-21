import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { getToken } from "next-auth/jwt";

/**
 * Called automatically by the frontend while someone is actually using the
 * app (see components/AttendanceTracker.tsx) - not a manual clock-in
 * button. First ping of the day sets clock_in; every ping after that just
 * advances last_activity_at, so the "hours worked" figure always reflects
 * genuine activity in the app, not a forgotten open tab.
 */
export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.email) return NextResponse.json({ error: "No session" }, { status: 401 });

    const userRows = await sql(`SELECT id FROM users WHERE email = $1`, [token.email]);
    const userId = userRows[0]?.id;
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const today = new Date().toISOString().slice(0, 10);

    const existing = await sql(
      `SELECT id, clock_in, is_manual FROM attendance_records WHERE user_id = $1 AND date = $2`,
      [userId, today]
    );

    if (existing.length === 0) {
      await sql(
        `INSERT INTO attendance_records (user_id, date, clock_in, last_activity_at, status, is_manual)
         VALUES ($1, $2, now(), now(), 'present', false)`,
        [userId, today]
      );
    } else if (!existing[0].is_manual) {
      // Only auto-advance records that haven't been manually overridden -
      // a manual edit for today should stick, not get silently clobbered
      // by the next background ping.
      await sql(
        `UPDATE attendance_records SET last_activity_at = now() WHERE id = $1`,
        [existing[0].id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
