import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql(`SELECT * FROM priorities ORDER BY sort_order ASC`);
    return NextResponse.json({ priorities: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { label, color } = body;
    const key = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_");

    const maxOrder = await sql(`SELECT COALESCE(MAX(sort_order), 0) as max FROM priorities`);
    const nextOrder = Number(maxOrder[0].max) + 1;

    const rows = await sql(
      `INSERT INTO priorities (key, label, color, sort_order, is_default) VALUES ($1, $2, $3, $4, false) RETURNING *`,
      [key, label, color || "#2563eb", nextOrder]
    );
    return NextResponse.json({ priority: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, label, color, sortOrder } = body;
    const rows = await sql(
      `UPDATE priorities
       SET label = COALESCE($2, label),
           color = COALESCE($3, color),
           sort_order = COALESCE($4, sort_order)
       WHERE id = $1
       RETURNING *`,
      [id, label || null, color || null, sortOrder ?? null]
    );
    return NextResponse.json({ priority: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    const check = await sql(`SELECT is_default, key FROM priorities WHERE id = $1`, [id]);
    if (check[0]?.is_default) {
      return NextResponse.json({ error: "Cannot delete a default priority. You can edit its label and color instead." }, { status: 400 });
    }
    await sql(`DELETE FROM priorities WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
