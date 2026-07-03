import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const rows = await sql(`
      SELECT * FROM communications WHERE deleted_at IS NULL ORDER BY received_at DESC
    `);
    return NextResponse.json({ communications: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const {
      clientId, clientName, projectId, type, direction,
      subject, body: commBody, sender, actionRequired, aiSummary,
    } = body;

    const rows = await sql(
      `INSERT INTO communications
        (client_id, client_name, project_id, type, direction, subject, body, sender, action_required, ai_summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        clientId || null,
        clientName || "",
        projectId || null,
        type || "email",
        direction || "inbound",
        subject,
        commBody || null,
        sender || null,
        actionRequired || false,
        aiSummary || null,
      ]
    );
    return NextResponse.json({ communication: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { id, actionStatus, aiSummary } = body;
    const rows = await sql(
      `UPDATE communications
       SET action_status = COALESCE($2, action_status),
           ai_summary = COALESCE($3, ai_summary),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, actionStatus || null, aiSummary || null]
    );
    return NextResponse.json({ communication: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

