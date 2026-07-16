import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const { prospectId } = await req.json();
    if (!prospectId) return NextResponse.json({ error: "prospectId is required" }, { status: 400 });

    const prospectRows = await sql(`SELECT * FROM prospects WHERE id = $1 AND deleted_at IS NULL`, [prospectId]);
    const prospect = prospectRows[0];
    if (!prospect) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    if (prospect.converted_to_client_id) {
      return NextResponse.json({ error: "This prospect has already been converted" }, { status: 400 });
    }

    // Create the real client record - the prospect row is never deleted, just
    // marked converted and linked, so all meeting history and fuel costs
    // logged against it stay reachable forever, even years later.
    const clientRows = await sql(
      `INSERT INTO clients (name, industry, notes, assigned_user_id, client_since)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)
       RETURNING *`,
      [prospect.name, prospect.industry, prospect.notes, prospect.assigned_user_id]
    );
    const client = clientRows[0];

    // Carry the primary contact across too, if one was captured on the prospect
    if (prospect.contact_name || prospect.contact_email) {
      await sql(
        `INSERT INTO contacts (client_id, name, email, is_primary)
         VALUES ($1, $2, $3, true)`,
        [client.id, prospect.contact_name || prospect.name, prospect.contact_email || null]
      );
    }

    await sql(
      `UPDATE prospects SET status = 'converted', converted_to_client_id = $2, converted_at = now(), updated_at = now() WHERE id = $1`,
      [prospectId, client.id]
    );

    return NextResponse.json({ client });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
