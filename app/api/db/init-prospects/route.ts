import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS prospects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        contact_name VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        source VARCHAR(100),
        estimated_value NUMERIC(14,2) DEFAULT 0,
        status VARCHAR(30) DEFAULT 'lead',
        notes TEXT,
        assigned_user_id UUID REFERENCES users(id),
        converted_to_client_id UUID REFERENCES clients(id),
        converted_at TIMESTAMPTZ,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS prospect_meetings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
        meeting_date DATE NOT NULL,
        summary TEXT,
        location VARCHAR(255),
        distance_km NUMERIC(8,2),
        fuel_cost NUMERIC(10,2) DEFAULT 0,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    await sql(`CREATE INDEX IF NOT EXISTS idx_prospect_meetings_prospect ON prospect_meetings(prospect_id)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status)`);

    return NextResponse.json({ success: true, message: "prospects and prospect_meetings tables created" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
