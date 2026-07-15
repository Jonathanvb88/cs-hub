import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_url TEXT`);
    await sql(`ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name VARCHAR(255)`);

    return NextResponse.json({ success: true, message: "file_url and file_name added to documents" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
