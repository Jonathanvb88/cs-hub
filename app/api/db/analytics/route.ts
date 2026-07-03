import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    // Activity volume — weekly counts over the last 12 weeks, from real timestamped records
    const activityVolume = await sql(`
      SELECT
        to_char(date_trunc('week', d), 'YYYY-MM-DD') as week,
        COALESCE((SELECT COUNT(*) FROM communications c WHERE c.deleted_at IS NULL AND date_trunc('week', c.received_at) = d), 0) as communications,
        COALESCE((SELECT COUNT(*) FROM follow_ups f WHERE f.deleted_at IS NULL AND date_trunc('week', f.created_at) = d), 0) as followups,
        COALESCE((SELECT COUNT(*) FROM documents doc WHERE doc.deleted_at IS NULL AND date_trunc('week', doc.created_at) = d), 0) as documents
      FROM generate_series(
        date_trunc('week', now() - interval '11 weeks'),
        date_trunc('week', now()),
        interval '1 week'
      ) as d
      ORDER BY d
    `);

    // Pipeline value trend — monthly sum of document value over the last 12 months
    const pipelineTrend = await sql(`
      SELECT
        to_char(date_trunc('month', m), 'YYYY-MM') as month,
        COALESCE((SELECT SUM(total_value) FROM documents doc WHERE doc.deleted_at IS NULL AND date_trunc('month', doc.created_at) = m), 0) as value,
        COALESCE((SELECT SUM(total_value) FROM documents doc WHERE doc.deleted_at IS NULL AND doc.status IN ('accepted', 'approved') AND date_trunc('month', doc.created_at) = m), 0) as won_value
      FROM generate_series(
        date_trunc('month', now() - interval '11 months'),
        date_trunc('month', now()),
        interval '1 month'
      ) as m
      ORDER BY m
    `);

    // Client health distribution — current snapshot
    const healthDistribution = await sql(`
      SELECT health_status, COUNT(*) as count
      FROM clients
      WHERE deleted_at IS NULL
      GROUP BY health_status
    `);

    // Client health trend — daily average score, from snapshots (may be sparse/empty until
    // client_health_snapshots has accumulated history from the daily cron)
    let healthTrend: { day: string; avg_score: string }[] = [];
    try {
      healthTrend = await sql(`
        SELECT to_char(snapshot_date, 'YYYY-MM-DD') as day, ROUND(AVG(score)) as avg_score
        FROM client_health_snapshots
        WHERE snapshot_date > CURRENT_DATE - interval '90 days'
        GROUP BY snapshot_date
        ORDER BY snapshot_date
      `) as { day: string; avg_score: string }[];
    } catch {
      // Table not migrated yet — visit /api/db/init-health-history once.
    }

    return NextResponse.json({
      activityVolume,
      pipelineTrend,
      healthDistribution,
      healthTrend,
      healthTrendAvailable: healthTrend.length > 0,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
