import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS project_milestones (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        status VARCHAR(20) DEFAULT 'pending',
        completed_at TIMESTAMPTZ,
        sort_order INTEGER DEFAULT 0,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    await sql(`
      CREATE TABLE IF NOT EXISTS project_tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(20) DEFAULT 'task',
        status VARCHAR(20) DEFAULT 'open',
        assigned_user_id UUID REFERENCES users(id),
        due_date DATE,
        completed_at TIMESTAMPTZ,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);

    await sql(`CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON project_milestones(project_id)`);
    await sql(`CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id)`);

    return NextResponse.json({ success: true, message: "project_milestones and project_tasks tables created" });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
