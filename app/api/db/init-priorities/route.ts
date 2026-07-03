import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS priorities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(50) UNIQUE NOT NULL,
        label VARCHAR(50) NOT NULL,
        color VARCHAR(20) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    const existing = await sql(`SELECT COUNT(*) as count FROM priorities`);
    if (Number(existing[0].count) === 0) {
      await sql(
        `INSERT INTO priorities (key, label, color, sort_order, is_default) VALUES
        ('critical', 'Critical', '#dc2626', 1, true),
        ('high', 'High', '#dc2626', 2, true),
        ('medium', 'Medium', '#b45309', 3, true),
        ('low', 'Low', '#94a3b8', 4, true)`
      );
    }

    return NextResponse.json({ success: true, message: "Priorities table initialized" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
