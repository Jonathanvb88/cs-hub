import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const days = req.nextUrl.searchParams.get("days");
    const dateFilter = days ? `AND created_at > now() - interval '${parseInt(days)} days'` : "";
    const dateFilterComms = days ? `AND received_at > now() - interval '${parseInt(days)} days'` : "";

    // Revenue pipeline by document status
    const pipeline = await sql(`
      SELECT type, status, COUNT(*) as count, COALESCE(SUM(total_value), 0) as total_value
      FROM documents
      WHERE deleted_at IS NULL ${dateFilter}
      GROUP BY type, status
      ORDER BY type, status
    `);

    // Client health distribution
    const healthDistribution = await sql(`
      SELECT health_status, COUNT(*) as count
      FROM clients
      WHERE deleted_at IS NULL
      GROUP BY health_status
    `);

    // Follow-up completion rate
    const followUpStats = await sql(`
      SELECT status, COUNT(*) as count
      FROM follow_ups
      WHERE deleted_at IS NULL
      GROUP BY status
    `);

    // Quote conversion: accepted vs sent vs draft
    const quoteConversion = await sql(`
      SELECT status, COUNT(*) as count, COALESCE(SUM(total_value), 0) as total_value
      FROM documents
      WHERE deleted_at IS NULL AND type = 'quote' ${dateFilter}
      GROUP BY status
    `);

    // Project status breakdown
    const projectStats = await sql(`
      SELECT status, COUNT(*) as count
      FROM projects
      WHERE deleted_at IS NULL
      GROUP BY status
    `);

    // Top clients by document value
    const topClients = await sql(`
      SELECT c.name, COALESCE(SUM(d.total_value), 0) as total_value, COUNT(d.id) as doc_count
      FROM clients c
      LEFT JOIN documents d ON d.client_id = c.id AND d.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      GROUP BY c.id, c.name
      ORDER BY total_value DESC
      LIMIT 10
    `);

    // Overall totals
    const totals = await sql(`
      SELECT
        (SELECT COUNT(*) FROM clients WHERE deleted_at IS NULL) as total_clients,
        (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL AND status = 'active') as active_projects,
        (SELECT COUNT(*) FROM follow_ups WHERE deleted_at IS NULL AND status = 'pending') as pending_followups,
        (SELECT COALESCE(SUM(total_value), 0) FROM documents WHERE deleted_at IS NULL AND status IN ('accepted', 'approved')) as won_value
    `);

    return NextResponse.json({
      pipeline,
      healthDistribution,
      followUpStats,
      quoteConversion,
      projectStats,
      topClients,
      totals: totals[0],
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

