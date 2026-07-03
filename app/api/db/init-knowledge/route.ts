import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS knowledge_assets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        label VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        client_name VARCHAR(255),
        url TEXT,
        notes TEXT,
        tags TEXT[],
        created_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    return NextResponse.json({ success: true, message: "knowledge_assets table created" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
