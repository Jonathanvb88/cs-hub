import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

interface UserStoryInput {
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
}
interface DevTaskInput {
  category: string;
  title: string;
  description: string;
}

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const packages = await sql(`SELECT * FROM ticket_packages WHERE id = $1 AND deleted_at IS NULL`, [id]);
      if (!packages[0]) return NextResponse.json({ error: "Ticket package not found" }, { status: 404 });
      const items = await sql(
        `SELECT * FROM ticket_items WHERE package_id = $1 ORDER BY item_type, order_index, created_at`,
        [id]
      );
      return NextResponse.json({ package: packages[0], items });
    }

    const packages = await sql(`
      SELECT p.*,
        (SELECT COUNT(*) FROM ticket_items i WHERE i.package_id = p.id) as item_count,
        (SELECT COUNT(*) FROM ticket_items i WHERE i.package_id = p.id AND i.status = 'approved') as approved_count,
        (SELECT COUNT(*) FROM ticket_items i WHERE i.package_id = p.id AND i.status = 'pending') as pending_count
      FROM ticket_packages p
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);
    return NextResponse.json({ packages });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const {
      clientId, clientName, sourceType, classification, priority, businessReason,
      modulesAffected, missingInformation, clarificationEmailDraft, risks, assumptions,
      userStories, developerTasks,
    } = body;

    const rows = await sql(
      `INSERT INTO ticket_packages
        (client_id, client_name, source_type, classification, priority, business_reason,
         modules_affected, missing_information, clarification_email_draft, risks, assumptions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        clientId || null, clientName || null, sourceType || null, classification || null, priority || null,
        businessReason || null, JSON.stringify(modulesAffected || []), JSON.stringify(missingInformation || []),
        clarificationEmailDraft || null, JSON.stringify(risks || []), JSON.stringify(assumptions || []),
      ]
    );
    const pkg = rows[0];

    let orderIndex = 0;
    for (const story of (userStories || []) as UserStoryInput[]) {
      await sql(
        `INSERT INTO ticket_items (package_id, item_type, status, order_index, content)
         VALUES ($1, 'user_story', 'approved', $2, $3)`,
        [pkg.id, orderIndex++, JSON.stringify(story)]
      );
    }
    orderIndex = 0;
    for (const task of (developerTasks || []) as DevTaskInput[]) {
      await sql(
        `INSERT INTO ticket_items (package_id, item_type, status, order_index, content)
         VALUES ($1, 'dev_task', 'approved', $2, $3)`,
        [pkg.id, orderIndex++, JSON.stringify(task)]
      );
    }

    return NextResponse.json({ package: pkg });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const { id, status, businessReason } = body;
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const rows = await sql(
      `UPDATE ticket_packages
       SET status = COALESCE($2, status),
           business_reason = COALESCE($3, business_reason),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, status || null, businessReason || null]
    );
    return NextResponse.json({ package: rows[0] });
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
    await sql(`UPDATE ticket_packages SET deleted_at = now() WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
