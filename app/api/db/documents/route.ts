import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const rows = await sql(`
      SELECT d.*, c.name as client_name
      FROM documents d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.deleted_at IS NULL
      ORDER BY d.created_at DESC
    `);
    return NextResponse.json({ documents: rows });
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
      clientId, projectId, type, title, version, status,
      contentJson, totalValue, currency, validUntil, createdBy,
    } = body;

    const rows = await sql(
      `INSERT INTO documents
        (client_id, project_id, type, title, version, status, content_json, total_value, currency, valid_until, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        clientId || null,
        projectId || null,
        type,
        title,
        version || "v1.0",
        status || "draft",
        JSON.stringify(contentJson || {}),
        totalValue || 0,
        currency || "ZAR",
        validUntil || null,
        createdBy || "Jonathan",
      ]
    );
    return NextResponse.json({ document: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { id, status, contentJson, totalValue } = body;
    const rows = await sql(
      `UPDATE documents
       SET status = COALESCE($2, status),
           content_json = COALESCE($3, content_json),
           total_value = COALESCE($4, total_value),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, status || null, contentJson ? JSON.stringify(contentJson) : null, totalValue ?? null]
    );
    return NextResponse.json({ document: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

