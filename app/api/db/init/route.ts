import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await sql(`
      CREATE TABLE IF NOT EXISTS clients (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        website TEXT,
        production_url TEXT,
        uat_url TEXT,
        health_score INTEGER DEFAULT 70,
        health_status VARCHAR(20) DEFAULT 'steady',
        assigned_csm VARCHAR(255),
        teams_channel_url TEXT,
        notes TEXT,
        client_since DATE,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        title VARCHAR(150),
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        type VARCHAR(30),
        priority VARCHAR(20) DEFAULT 'medium',
        target_date DATE,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        type VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        version VARCHAR(20) DEFAULT 'v1.0',
        status VARCHAR(20) DEFAULT 'draft',
        content_json JSONB DEFAULT '{}',
        total_value NUMERIC(12,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'ZAR',
        valid_until DATE,
        created_by VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS follow_ups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
        client_name VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'pending',
        ai_suggested BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),
        deleted_at TIMESTAMPTZ
      )
    `);

    await sql(`CREATE INDEX IF NOT EXISTS idx_contacts_client ON contacts(client_id)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_followups_client ON follow_ups(client_id)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_followups_status ON follow_ups(status)`);

    return NextResponse.json({ success: true, message: "Database schema initialized" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
