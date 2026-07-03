import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

async function ensureColumn() {
  try {
    await sql(`ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS hidden_nav_items TEXT[] DEFAULT '{}'`);
  } catch {}
}

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await ensureColumn();
    const rows = await sql(`SELECT hidden_nav_items FROM user_preferences WHERE user_key = 'jonathan'`);
    return NextResponse.json({ hiddenItems: rows[0]?.hidden_nav_items || [] });
  } catch (e) {
    return NextResponse.json({ hiddenItems: [], error: String(e) });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await ensureColumn();
    const { hiddenItems } = await req.json();
    await sql(
      `INSERT INTO user_preferences (user_key, hidden_nav_items)
       VALUES ('jonathan', $1)
       ON CONFLICT (user_key) DO UPDATE SET hidden_nav_items = $1, updated_at = now()`,
      [hiddenItems]
    );
    return NextResponse.json({ success: true, hiddenItems });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
