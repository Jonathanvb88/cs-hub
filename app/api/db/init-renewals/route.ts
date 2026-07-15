import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS contract_value NUMERIC(14,2)`);
    await sql(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS contract_start_date DATE`);
    await sql(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS renewal_date DATE`);
    await sql(`ALTER TABLE clients ADD COLUMN IF NOT EXISTS renewal_notified_at TIMESTAMPTZ`);

    return NextResponse.json({ success: true, message: "contract_value, contract_start_date, renewal_date, renewal_notified_at added to clients" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
