import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_developer BOOLEAN DEFAULT false`);

    await sql(
      `UPDATE users SET is_developer = true WHERE email = $1`,
      ["jonathanvb@urupconnect.com"]
    );

    return NextResponse.json({ success: true, message: "is_developer column added; jonathanvb@urupconnect.com granted developer mode" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
