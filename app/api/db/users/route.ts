import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const rows = await sql(`SELECT * FROM users WHERE is_active = true ORDER BY created_at ASC`);
    return NextResponse.json({ users: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { name, email, role } = body;
    const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
    const rows = await sql(
      `INSERT INTO users (name, email, role, avatar_initials) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email || null, role || "csm", initials]
    );
    return NextResponse.json({ user: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
