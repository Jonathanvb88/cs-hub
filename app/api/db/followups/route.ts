import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql(`
      SELECT f.*, u.name as assigned_user_name, u.avatar_initials as assigned_user_initials
      FROM follow_ups f
      LEFT JOIN users u ON f.assigned_user_id = u.id
      WHERE f.deleted_at IS NULL
      ORDER BY f.due_date ASC
    `);
    return NextResponse.json({ followUps: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, clientName, title, description, dueDate, priority, aiSuggested, assignedUserId } = body;
    const rows = await sql(
      `INSERT INTO follow_ups (client_id, client_name, title, description, due_date, priority, ai_suggested, assigned_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [clientId || null, clientName || "", title, description || null, dueDate || null, priority || "medium", aiSuggested || false, assignedUserId || null]
    );
    return NextResponse.json({ followUp: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, assignedUserId } = body;
    const rows = await sql(
      `UPDATE follow_ups
       SET status = COALESCE($2, status),
           assigned_user_id = COALESCE($3, assigned_user_id),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, status || null, assignedUserId || null]
    );
    return NextResponse.json({ followUp: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
