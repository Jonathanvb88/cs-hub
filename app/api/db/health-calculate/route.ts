import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { calculateHealthScore } from "@/lib/healthScore";

interface ClientRow {
  id: string;
  name: string;
  industry: string | null;
}

export async function GET(req: NextRequest) {
  // Vercel Cron requests carry this User-Agent; everything else must be an authenticated in-app request.
  const isVercelCron = (req.headers.get("user-agent") || "").includes("vercel-cron");
  if (!isVercelCron) {
    const authError = await requireAuth(req);
    if (authError) return authError;
  }
  try {
    const clients = await sql(`SELECT id, name, industry FROM clients WHERE deleted_at IS NULL`) as ClientRow[];

    const results = [];

    for (const client of clients) {
      const lastComm = await sql(
        `SELECT received_at FROM communications WHERE client_id = $1 AND deleted_at IS NULL ORDER BY received_at DESC LIMIT 1`,
        [client.id]
      );
      const followUpCounts = await sql(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'pending' AND due_date < CURRENT_DATE) as overdue,
          COUNT(*) FILTER (WHERE status = 'pending' AND (due_date >= CURRENT_DATE OR due_date IS NULL)) as pending
         FROM follow_ups WHERE client_id = $1 AND deleted_at IS NULL`,
        [client.id]
      );
      const projectCounts = await sql(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE status IN ('on_hold', 'cancelled')) as stalled
         FROM projects WHERE client_id = $1 AND deleted_at IS NULL`,
        [client.id]
      );
      const recentDocs = await sql(
        `SELECT COUNT(*) as count FROM documents WHERE client_id = $1 AND deleted_at IS NULL AND created_at > now() - interval '60 days'`,
        [client.id]
      );

      const daysSinceLastContact = lastComm.length > 0
        ? Math.floor((Date.now() - new Date(lastComm[0].received_at).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const { score, status } = calculateHealthScore({
        daysSinceLastContact,
        overdueFollowUps: Number(followUpCounts[0]?.overdue || 0),
        pendingFollowUps: Number(followUpCounts[0]?.pending || 0),
        activeProjects: Number(projectCounts[0]?.active || 0),
        onHoldOrCancelledProjects: Number(projectCounts[0]?.stalled || 0),
        recentDocuments: Number(recentDocs[0]?.count || 0),
      });

      // Persist the calculated score back to the clients table
      await sql(
        `UPDATE clients SET health_score = $2, health_status = $3, updated_at = now() WHERE id = $1`,
        [client.id, score, status]
      );

      // Record a daily snapshot for trend charting — one row per client per day.
      // Isolated in its own try/catch: if the snapshots table hasn't been migrated
      // yet, that must never break the core scoring/update logic above.
      try {
        await sql(
          `INSERT INTO client_health_snapshots (client_id, score, status, snapshot_date)
           VALUES ($1, $2, $3, CURRENT_DATE)
           ON CONFLICT (client_id, snapshot_date) DO UPDATE SET score = $2, status = $3`,
          [client.id, score, status]
        );
      } catch {
        // Table not migrated yet — visit /api/db/init-health-history once to enable trend history.
      }

      results.push({
        id: client.id,
        name: client.name,
        industry: client.industry,
        healthScore: score,
        healthStatus: status,
        daysSinceLastContact,
        overdueFollowUps: Number(followUpCounts[0]?.overdue || 0),
        pendingFollowUps: Number(followUpCounts[0]?.pending || 0),
        activeProjects: Number(projectCounts[0]?.active || 0),
        stalledProjects: Number(projectCounts[0]?.stalled || 0),
        recentDocuments: Number(recentDocs[0]?.count || 0),
      });
    }

    results.sort((a, b) => a.healthScore - b.healthScore);

    return NextResponse.json({ clients: results });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

