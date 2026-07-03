import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const clients = await sql(`
      SELECT c.*, u.name as assigned_user_name, u.avatar_initials as assigned_user_initials
      FROM clients c
      LEFT JOIN users u ON c.assigned_user_id = u.id
      WHERE c.deleted_at IS NULL
      ORDER BY c.created_at DESC
    `);
    const contacts = await sql(`
      SELECT * FROM contacts WHERE deleted_at IS NULL ORDER BY is_primary DESC
    `);
    const clientsWithContacts = clients.map((c: Record<string, unknown>) => ({
      ...c,
      contacts: contacts.filter((ct: Record<string, unknown>) => ct.client_id === c.id),
    }));
    return NextResponse.json({ clients: clientsWithContacts });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { name, industry, website, productionUrl, uatUrl, notes, assignedCsm, assignedUserId } = body;

    const rows = await sql(
      `INSERT INTO clients (name, industry, website, production_url, uat_url, notes, assigned_csm, assigned_user_id, client_since)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)
       RETURNING *`,
      [name, industry || null, website || null, productionUrl || null, uatUrl || null, notes || null, assignedCsm || "Jonathan", assignedUserId || null]
    );
    return NextResponse.json({ client: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { id, name, industry, notes, healthScore, healthStatus, assignedUserId } = body;
    const rows = await sql(
      `UPDATE clients
       SET name = COALESCE($2, name),
           industry = COALESCE($3, industry),
           notes = COALESCE($4, notes),
           health_score = COALESCE($5, health_score),
           health_status = COALESCE($6, health_status),
           assigned_user_id = COALESCE($7, assigned_user_id),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, name || null, industry || null, notes || null, healthScore ?? null, healthStatus || null, assignedUserId || null]
    );
    return NextResponse.json({ client: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

