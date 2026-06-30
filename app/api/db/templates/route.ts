import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type");
    const rows = type
      ? await sql(`SELECT * FROM document_templates WHERE deleted_at IS NULL AND type = $1 ORDER BY created_at ASC`, [type])
      : await sql(`SELECT * FROM document_templates WHERE deleted_at IS NULL ORDER BY type, created_at ASC`);
    return NextResponse.json({ templates: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, description, contentJson } = body;
    const rows = await sql(
      `INSERT INTO document_templates (type, name, description, content_json)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [type, name, description || null, JSON.stringify(contentJson || {})]
    );
    return NextResponse.json({ template: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    await sql(`UPDATE document_templates SET deleted_at = now() WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
