import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql(`
      SELECT * FROM follow_ups WHERE deleted_at IS NULL ORDER BY due_date ASC
    `);
    return NextResponse.json({ followUps: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, clientName, title, description, dueDate, priority, aiSuggested } = body;
    const rows = await sql(
      `INSERT INTO follow_ups (client_id, client_name, title, description, due_date, priority, ai_suggested)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [clientId || null, clientName || "", title, description || null, dueDate || null, priority || "medium", aiSuggested || false]
    );
    return NextResponse.json({ followUp: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const rows = await sql(
      `UPDATE follow_ups SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, status]
    );
    return NextResponse.json({ followUp: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
