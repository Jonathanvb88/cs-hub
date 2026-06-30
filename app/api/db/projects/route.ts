import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql(`
      SELECT p.*, c.name as client_name
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);
    return NextResponse.json({ projects: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, name, description, status, type, priority, targetDate } = body;
    const rows = await sql(
      `INSERT INTO projects (client_id, name, description, status, type, priority, target_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        clientId || null,
        name,
        description || null,
        status || "active",
        type || "new_build",
        priority || "medium",
        targetDate || null,
      ]
    );
    return NextResponse.json({ project: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, priority, name } = body;
    const rows = await sql(
      `UPDATE projects
       SET status = COALESCE($2, status),
           priority = COALESCE($3, priority),
           name = COALESCE($4, name),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, status || null, priority || null, name || null]
    );
    return NextResponse.json({ project: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
