import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS communications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
        client_name VARCHAR(255),
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        type VARCHAR(20) DEFAULT 'email',
        direction VARCHAR(20) DEFAULT 'inbound',
        subject VARCHAR(255) NOT NULL,
        body TEXT,
        sender VARCHAR(255),
        received_at TIMESTAMPTZ DEFAULT now(),
        action_required BOOLEAN DEFAULT false,
        action_status VARCHAR(20) DEFAULT 'pending',
        ai_summary TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);

    await sql(`CREATE INDEX IF NOT EXISTS idx_comms_client ON communications(client_id)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_comms_action ON communications(action_required, action_status)`);

    // Add missing columns to projects if they don't exist (safe re-run)
    await sql(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT`);

    return NextResponse.json({ success: true, message: "Sprint 8 schema initialized — communications table added" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
