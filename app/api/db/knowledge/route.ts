import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql(`
      SELECT * FROM knowledge_assets
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);
    return NextResponse.json({ assets: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { label, type, clientName, url, notes, tags } = body;
    const rows = await sql(
      `INSERT INTO knowledge_assets (label, type, client_name, url, notes, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [label, type || "journey_url", clientName || null, url || null, notes || null, tags || []]
    );
    return NextResponse.json({ asset: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    await sql(`UPDATE knowledge_assets SET deleted_at = now() WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
