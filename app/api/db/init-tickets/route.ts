import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS ticket_packages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID REFERENCES clients(id),
        client_name VARCHAR(255),
        source_type VARCHAR(50),
        classification VARCHAR(50),
        priority VARCHAR(20),
        business_reason TEXT,
        modules_affected JSONB DEFAULT '[]',
        missing_information JSONB DEFAULT '[]',
        clarification_email_draft TEXT,
        risks JSONB DEFAULT '[]',
        assumptions JSONB DEFAULT '[]',
        status VARCHAR(20) DEFAULT 'draft',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS ticket_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        package_id UUID NOT NULL REFERENCES ticket_packages(id) ON DELETE CASCADE,
        item_type VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        priority VARCHAR(20),
        order_index INTEGER DEFAULT 0,
        content JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    await sql(`CREATE INDEX IF NOT EXISTS idx_ticket_items_package ON ticket_items(package_id)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_ticket_packages_client ON ticket_packages(client_id)`);

    return NextResponse.json({ success: true, message: "ticket_packages and ticket_items tables created" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
