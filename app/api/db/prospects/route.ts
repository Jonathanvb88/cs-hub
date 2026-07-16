import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (id) {
      const rows = await sql(`
        SELECT p.*, c.name as converted_client_name,
          (SELECT COUNT(*) FROM projects pr WHERE pr.client_id = p.converted_to_client_id AND pr.deleted_at IS NULL) as project_count
        FROM prospects p LEFT JOIN clients c ON p.converted_to_client_id = c.id
        WHERE p.id = $1 AND p.deleted_at IS NULL
      `, [id]);
      if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const meetings = await sql(`SELECT * FROM prospect_meetings WHERE prospect_id = $1 ORDER BY meeting_date DESC`, [id]);
      return NextResponse.json({ prospect: rows[0], meetings });
    }

    const prospects = await sql(`
      SELECT p.*, c.name as converted_client_name,
        (SELECT COUNT(*) FROM prospect_meetings pm WHERE pm.prospect_id = p.id) as meeting_count,
        (SELECT COALESCE(SUM(fuel_cost), 0) FROM prospect_meetings pm WHERE pm.prospect_id = p.id) as total_fuel_cost,
        (SELECT COUNT(*) FROM projects pr WHERE pr.client_id = p.converted_to_client_id AND pr.deleted_at IS NULL) as project_count
      FROM prospects p
      LEFT JOIN clients c ON p.converted_to_client_id = c.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);
    return NextResponse.json({ prospects });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { name, industry, contactName, contactEmail, contactPhone, source, estimatedValue, status, notes, assignedUserId } = body;
    if (!name || !name.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    let createdBy: string | null = null;
    if (token?.email) {
      const rows = await sql(`SELECT id FROM users WHERE email = $1`, [token.email]);
      createdBy = rows[0]?.id || null;
    }

    const rows = await sql(
      `INSERT INTO prospects (name, industry, contact_name, contact_email, contact_phone, source, estimated_value, status, notes, assigned_user_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [name.trim(), industry || null, contactName || null, contactEmail || null, contactPhone || null,
       source || null, estimatedValue || 0, status || "lead", notes || null, assignedUserId || null, createdBy]
    );
    return NextResponse.json({ prospect: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { id, name, industry, contactName, contactEmail, contactPhone, source, estimatedValue, status, notes, assignedUserId } = body;
    const rows = await sql(
      `UPDATE prospects SET
        name = COALESCE($2, name), industry = COALESCE($3, industry),
        contact_name = COALESCE($4, contact_name), contact_email = COALESCE($5, contact_email),
        contact_phone = COALESCE($6, contact_phone), source = COALESCE($7, source),
        estimated_value = COALESCE($8, estimated_value), status = COALESCE($9, status),
        notes = COALESCE($10, notes), assigned_user_id = COALESCE($11, assigned_user_id),
        updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, name || null, industry || null, contactName || null, contactEmail || null, contactPhone || null,
       source || null, estimatedValue ?? null, status || null, notes ?? null, assignedUserId || null]
    );
    return NextResponse.json({ prospect: rows[0] });
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
    await sql(`UPDATE prospects SET deleted_at = now() WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
