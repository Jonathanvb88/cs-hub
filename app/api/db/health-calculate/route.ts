import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

interface ClientRow {
  id: string;
  name: string;
  industry: string | null;
}

function calculateHealthScore(params: {
  daysSinceLastContact: number | null;
  overdueFollowUps: number;
  pendingFollowUps: number;
  activeProjects: number;
  onHoldOrCancelledProjects: number;
  recentDocuments: number;
}): { score: number; status: string } {
  let score = 70; // baseline for a client with some activity

  // Recency of contact — the single strongest signal
  if (params.daysSinceLastContact === null) {
    score -= 25; // never contacted / no communications logged at all
  } else if (params.daysSinceLastContact <= 7) {
    score += 20;
  } else if (params.daysSinceLastContact <= 21) {
    score += 5;
  } else if (params.daysSinceLastContact <= 45) {
    score -= 10;
  } else {
    score -= 30;
  }

  // Overdue follow-ups are a strong negative signal — things are being dropped
  score -= Math.min(params.overdueFollowUps * 8, 30);

  // Pending (not yet overdue) follow-ups suggest active engagement
  score += Math.min(params.pendingFollowUps * 2, 10);

  // Active projects are healthy; stalled/cancelled projects are a warning sign
  score += Math.min(params.activeProjects * 5, 15);
  score -= Math.min(params.onHoldOrCancelledProjects * 10, 20);

  // Recent document activity (quotes, SOWs) signals commercial engagement
  score += Math.min(params.recentDocuments * 4, 12);

  score = Math.max(0, Math.min(100, Math.round(score)));

  let status: string;
  if (score >= 75) status = "active";
  else if (score >= 55) status = "steady";
  else if (score >= 35) status = "quiet";
  else status = "at_risk";

  return { score, status };
}

export async function GET() {
  try {
    const clients: ClientRow[] = await sql(`SELECT id, name, industry FROM clients WHERE deleted_at IS NULL`);

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
