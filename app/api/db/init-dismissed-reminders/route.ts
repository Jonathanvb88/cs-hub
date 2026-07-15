import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS dismissed_reminders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        reminder_key VARCHAR(100) NOT NULL,
        dismissed_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(client_id, reminder_key)
      )
    `);

    return NextResponse.json({ success: true, message: "dismissed_reminders table created" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
