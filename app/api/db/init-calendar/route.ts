import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        client_id UUID REFERENCES clients(id),
        client_name VARCHAR(255),
        event_date DATE NOT NULL,
        start_hour INTEGER NOT NULL DEFAULT 9,
        start_min INTEGER NOT NULL DEFAULT 0,
        duration_mins INTEGER NOT NULL DEFAULT 60,
        type VARCHAR(50) DEFAULT 'meeting',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);
    return NextResponse.json({ success: true, message: "calendar_events table created" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
