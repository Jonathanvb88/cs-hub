import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

async function ensureColumn() {
  try {
    await sql(`ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS hidden_nav_items TEXT[] DEFAULT '{}'`);
    await sql(`ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS lock_sidebar_open BOOLEAN DEFAULT false`);
  } catch {}
}

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await ensureColumn();
    const rows = await sql(`SELECT hidden_nav_items, lock_sidebar_open FROM user_preferences WHERE user_key = 'jonathan'`);
    return NextResponse.json({
      hiddenItems: rows[0]?.hidden_nav_items || [],
      lockSidebarOpen: rows[0]?.lock_sidebar_open || false,
    });
  } catch (e) {
    return NextResponse.json({ hiddenItems: [], lockSidebarOpen: false, error: String(e) });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await ensureColumn();
    const body = await req.json();
    const { hiddenItems, lockSidebarOpen } = body;

    // Partial update — only touch the field(s) actually provided in this request
    if (hiddenItems !== undefined && lockSidebarOpen !== undefined) {
      await sql(
        `INSERT INTO user_preferences (user_key, hidden_nav_items, lock_sidebar_open)
         VALUES ('jonathan', $1, $2)
         ON CONFLICT (user_key) DO UPDATE SET hidden_nav_items = $1, lock_sidebar_open = $2, updated_at = now()`,
        [hiddenItems, lockSidebarOpen]
      );
    } else if (hiddenItems !== undefined) {
      await sql(
        `INSERT INTO user_preferences (user_key, hidden_nav_items)
         VALUES ('jonathan', $1)
         ON CONFLICT (user_key) DO UPDATE SET hidden_nav_items = $1, updated_at = now()`,
        [hiddenItems]
      );
    } else if (lockSidebarOpen !== undefined) {
      await sql(
        `INSERT INTO user_preferences (user_key, lock_sidebar_open)
         VALUES ('jonathan', $1)
         ON CONFLICT (user_key) DO UPDATE SET lock_sidebar_open = $1, updated_at = now()`,
        [lockSidebarOpen]
      );
    }

    return NextResponse.json({ success: true, hiddenItems, lockSidebarOpen });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
