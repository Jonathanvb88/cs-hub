import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    let rows;
    if (from && to) {
      rows = await sql(
        `SELECT * FROM calendar_events WHERE deleted_at IS NULL AND event_date >= $1 AND event_date <= $2 ORDER BY event_date, start_hour, start_min`,
        [from, to]
      );
    } else {
      rows = await sql(`SELECT * FROM calendar_events WHERE deleted_at IS NULL ORDER BY event_date, start_hour, start_min`);
    }
    return NextResponse.json({ events: rows });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, clientId, clientName, eventDate, startHour, startMin, durationMins, type, notes } = body;
    const rows = await sql(
      `INSERT INTO calendar_events (title, client_id, client_name, event_date, start_hour, start_min, duration_mins, type, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, clientId || null, clientName || null, eventDate, startHour ?? 9, startMin ?? 0, durationMins ?? 60, type || "meeting", notes || null]
    );
    return NextResponse.json({ event: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, clientId, clientName, eventDate, startHour, startMin, durationMins, type, notes } = body;
    const rows = await sql(
      `UPDATE calendar_events SET
        title = COALESCE($2, title),
        client_id = $3,
        client_name = $4,
        event_date = COALESCE($5, event_date),
        start_hour = COALESCE($6, start_hour),
        start_min = COALESCE($7, start_min),
        duration_mins = COALESCE($8, duration_mins),
        type = COALESCE($9, type),
        notes = $10
       WHERE id = $1 RETURNING *`,
      [id, title || null, clientId || null, clientName || null, eventDate || null, startHour ?? null, startMin ?? null, durationMins ?? null, type || null, notes || null]
    );
    return NextResponse.json({ event: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    await sql(`UPDATE calendar_events SET deleted_at = now() WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
