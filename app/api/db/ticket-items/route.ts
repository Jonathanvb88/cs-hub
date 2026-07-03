import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { packageId, itemType, content, orderIndex } = body;
    if (!packageId || !itemType || !content) {
      return NextResponse.json({ error: "packageId, itemType, and content are required" }, { status: 400 });
    }

    const rows = await sql(
      `INSERT INTO ticket_items (package_id, item_type, status, order_index, content)
       VALUES ($1, $2, 'pending', $3, $4)
       RETURNING *`,
      [packageId, itemType, orderIndex || 0, JSON.stringify(content)]
    );
    return NextResponse.json({ item: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { id, status, priority, content } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const rows = await sql(
      `UPDATE ticket_items
       SET status = COALESCE($2, status),
           priority = COALESCE($3, priority),
           content = COALESCE($4, content),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, status || null, priority || null, content ? JSON.stringify(content) : null]
    );
    return NextResponse.json({ item: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    await sql(`DELETE FROM ticket_items WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
