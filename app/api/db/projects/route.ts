import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      const rows = await sql(`
        SELECT p.*, c.name as client_name, c.industry as client_industry, u.name as assigned_user_name, u.avatar_initials as assigned_user_initials
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN users u ON p.assigned_user_id = u.id
        WHERE p.id = $1
      `, [id]);
      return NextResponse.json({ project: rows[0] || null });
    }
    const rows = await sql(`
      SELECT p.*, c.name as client_name, u.name as assigned_user_name, u.avatar_initials as assigned_user_initials
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.assigned_user_id = u.id
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
    const { clientId, name, description, status, type, priority, targetDate, assignedUserId } = body;
    const rows = await sql(
      `INSERT INTO projects (client_id, name, description, status, type, priority, target_date, assigned_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        clientId || null,
        name,
        description || null,
        status || "active",
        type || "new_build",
        priority || "medium",
        targetDate || null,
        assignedUserId || null,
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
    const { id, status, priority, name, assignedUserId } = body;
    const rows = await sql(
      `UPDATE projects
       SET status = COALESCE($2, status),
           priority = COALESCE($3, priority),
           name = COALESCE($4, name),
           assigned_user_id = COALESCE($5, assigned_user_id),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, status || null, priority || null, name || null, assignedUserId || null]
    );
    return NextResponse.json({ project: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
