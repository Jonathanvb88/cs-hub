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
    const tasks = await sql(
      `SELECT t.*, u.name as assigned_user_name
       FROM project_tasks t LEFT JOIN users u ON t.assigned_user_id = u.id
       WHERE t.project_id = $1 ORDER BY t.created_at DESC`,
      [projectId]
    );
    return NextResponse.json({ tasks });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { projectId, title, description, type, assignedUserId, dueDate } = body;
    if (!projectId || !title?.trim()) return NextResponse.json({ error: "projectId and title are required" }, { status: 400 });

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    let createdBy: string | null = null;
    if (token?.email) {
      const rows = await sql(`SELECT id FROM users WHERE email = $1`, [token.email]);
      createdBy = rows[0]?.id || null;
    }

    const rows = await sql(
      `INSERT INTO project_tasks (project_id, title, description, type, assigned_user_id, due_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [projectId, title.trim(), description || null, type || "task", assignedUserId || null, dueDate || null, createdBy]
    );

    await logAudit(req, type === "additional_work" ? "additional_work_logged" : "task_created", "task", rows[0].id, title.trim(), { projectId });
    return NextResponse.json({ task: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { id, title, description, status, assignedUserId, dueDate } = body;

    const before = await sql(`SELECT status, title FROM project_tasks WHERE id = $1`, [id]);
    const wasDone = before[0]?.status === "done";
    const nowCompleting = status === "done" && !wasDone;

    const rows = await sql(
      `UPDATE project_tasks SET
        title = COALESCE($2, title), description = COALESCE($3, description),
        status = COALESCE($4, status), assigned_user_id = COALESCE($5, assigned_user_id),
        due_date = COALESCE($6, due_date),
        completed_at = CASE WHEN $4 = 'done' THEN now() WHEN $4 IS NOT NULL THEN NULL ELSE completed_at END,
        updated_at = now()
       WHERE id = $1 RETURNING *`,
      [id, title || null, description ?? null, status || null, assignedUserId || null, dueDate || null]
    );

    if (nowCompleting) await logAudit(req, "task_closed", "task", id, rows[0]?.title, {});
    return NextResponse.json({ task: rows[0] });
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
    const before = await sql(`SELECT title FROM project_tasks WHERE id = $1`, [id]);
    await sql(`DELETE FROM project_tasks WHERE id = $1`, [id]);
    if (before[0]) await logAudit(req, "task_deleted", "task", id, before[0].title, {});
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
