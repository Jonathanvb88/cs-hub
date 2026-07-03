import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

async function ensureTable() {
  await sql(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(255),
      entity_name VARCHAR(255),
      user_name VARCHAR(255) DEFAULT 'Jonathan',
      user_email VARCHAR(255),
      details JSONB,
      ip_address VARCHAR(50),
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);
}

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await ensureTable();
    const search = req.nextUrl.searchParams.get("search") || "";
    const entity = req.nextUrl.searchParams.get("entity") || "";
    const days = req.nextUrl.searchParams.get("days") || "30";
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "100");

    let query = `
      SELECT * FROM audit_log
      WHERE created_at > now() - interval '${parseInt(days)} days'
    `;
    const params: string[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (
        action ILIKE $${params.length} OR
        entity_name ILIKE $${params.length} OR
        entity_type ILIKE $${params.length} OR
        user_name ILIKE $${params.length} OR
        details::text ILIKE $${params.length}
      )`;
    }

    if (entity) {
      params.push(entity);
      query += ` AND entity_type = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT ${limit}`;

    const rows = await sql(query, params);
    return NextResponse.json({ logs: rows, total: rows.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await ensureTable();
    const body = await req.json();
    const { action, entityType, entityId, entityName, userName, userEmail, details } = body;

    await sql(
      `INSERT INTO audit_log (action, entity_type, entity_id, entity_name, user_name, user_email, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        action,
        entityType || "system",
        entityId || null,
        entityName || null,
        userName || "Jonathan",
        userEmail || null,
        details ? JSON.stringify(details) : null,
      ]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
