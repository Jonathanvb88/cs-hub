import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS client_health_snapshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL,
        snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    await sql(`
      CREATE INDEX IF NOT EXISTS idx_health_snapshots_date ON client_health_snapshots(snapshot_date)
    `);
    await sql(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_health_snapshots_client_date ON client_health_snapshots(client_id, snapshot_date)
    `);

    return NextResponse.json({ success: true, message: "client_health_snapshots table created. Health trend data will begin accumulating from the next health-calculate run (daily cron or manual visit to /health)." });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
