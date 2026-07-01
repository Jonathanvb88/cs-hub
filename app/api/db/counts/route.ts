import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const rows = await sql(`
      SELECT
        (SELECT COUNT(*) FROM follow_ups WHERE deleted_at IS NULL AND status = 'pending') as followups,
        (SELECT COUNT(*) FROM communications WHERE deleted_at IS NULL AND action_required = true AND action_status = 'pending') as comms_action,
        (SELECT COUNT(*) FROM follow_ups WHERE deleted_at IS NULL AND status = 'pending' AND due_date <= $1) as overdue_followups
    `, [today]);
    return NextResponse.json({ counts: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
