import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { prospectId, meetingDate, summary, location, distanceKm, fuelCost } = body;
    if (!prospectId || !meetingDate) {
      return NextResponse.json({ error: "prospectId and meetingDate are required" }, { status: 400 });
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    let createdBy: string | null = null;
    if (token?.email) {
      const rows = await sql(`SELECT id FROM users WHERE email = $1`, [token.email]);
      createdBy = rows[0]?.id || null;
    }

    const rows = await sql(
      `INSERT INTO prospect_meetings (prospect_id, meeting_date, summary, location, distance_km, fuel_cost, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [prospectId, meetingDate, summary || null, location || null, distanceKm ?? null, fuelCost || 0, createdBy]
    );
    return NextResponse.json({ meeting: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const { id, meetingDate, summary, location, distanceKm, fuelCost } = await req.json();
    const rows = await sql(
      `UPDATE prospect_meetings SET
        meeting_date = COALESCE($2, meeting_date), summary = COALESCE($3, summary),
        location = COALESCE($4, location), distance_km = COALESCE($5, distance_km),
        fuel_cost = COALESCE($6, fuel_cost)
       WHERE id = $1 RETURNING *`,
      [id, meetingDate || null, summary ?? null, location ?? null, distanceKm ?? null, fuelCost ?? null]
    );
    return NextResponse.json({ meeting: rows[0] });
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
    await sql(`DELETE FROM prospect_meetings WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
