import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { getToken } from "next-auth/jwt";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    const milestones = await sql(
      `SELECT * FROM project_milestones WHERE project_id = $1 ORDER BY sort_order ASC, due_date ASC NULLS LAST, created_at ASC`,
      [projectId]
    );
    return NextResponse.json({ milestones });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { projectId, title, description, dueDate } = body;
    if (!projectId || !title?.trim()) return NextResponse.json({ error: "projectId and title are required" }, { status: 400 });

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    let createdBy: string | null = null;
    if (token?.email) {
      const rows = await sql(`SELECT id FROM users WHERE email = $1`, [token.email]);
      createdBy = rows[0]?.id || null;
    }

    const countRows = await sql(`SELECT COUNT(*) as count FROM project_milestones WHERE project_id = $1`, [projectId]);

    const rows = await sql(
      `INSERT INTO project_milestones (project_id, title, description, due_date, sort_order, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [projectId, title.trim(), description || null, dueDate || null, Number(countRows[0].count), createdBy]
    );

    await logAudit(req, "milestone_created", "milestone", rows[0].id, title.trim(), { projectId });
    return NextResponse.json({ milestone: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { id, title, description, dueDate, status } = body;

    const before = await sql(`SELECT status, title FROM project_milestones WHERE id = $1`, [id]);
    const wasCompleted = before[0]?.status === "completed";
    const nowCompleting = status === "completed" && !wasCompleted;
    const nowReopening = status && status !== "completed" && wasCompleted;

    const rows = await sql(
      `UPDATE project_milestones SET
        title = COALESCE($2, title), description = COALESCE($3, description),
        due_date = COALESCE($4, due_date), status = COALESCE($5, status),
        completed_at = CASE WHEN $5 = 'completed' THEN now() WHEN $5 IS NOT NULL THEN NULL ELSE completed_at END
       WHERE id = $1 RETURNING *`,
      [id, title || null, description ?? null, dueDate || null, status || null]
    );

    if (nowCompleting) await logAudit(req, "milestone_completed", "milestone", id, rows[0]?.title, {});
    if (nowReopening) await logAudit(req, "milestone_reopened", "milestone", id, rows[0]?.title, {});

    return NextResponse.json({ milestone: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const before = await sql(`SELECT title FROM project_milestones WHERE id = $1`, [id]);
    await sql(`DELETE FROM project_milestones WHERE id = $1`, [id]);
    if (before[0]) await logAudit(req, "milestone_deleted", "milestone", id, before[0].title, {});
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
