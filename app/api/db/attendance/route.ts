import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";
import { getToken } from "next-auth/jwt";
import { logAudit } from "@/lib/audit";

async function currentUser(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) return null;
  const rows = await sql(`SELECT id, name, is_developer FROM users WHERE email = $1`, [token.email]);
  return rows[0] || null;
}

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const me = await currentUser(req);
    if (!me) return NextResponse.json({ error: "No session" }, { status: 401 });

    const from = req.nextUrl.searchParams.get("from");
    const to = req.nextUrl.searchParams.get("to");
    const requestedUserId = req.nextUrl.searchParams.get("userId");

    // Anyone can see their own record; only the account owner can see
    // (or filter by) anyone else's - same is_developer gate used
    // elsewhere in the app (Team management, etc).
    const scopedUserId = me.is_developer ? requestedUserId : me.id;

    let query = `
      SELECT a.*, u.name as user_name, u.avatar_initials,
        EXTRACT(EPOCH FROM (COALESCE(a.clock_out, a.last_activity_at, a.clock_in) - a.clock_in)) / 3600 as hours_worked
      FROM attendance_records a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1`;
    const params: string[] = [];
    if (scopedUserId) { params.push(scopedUserId); query += ` AND a.user_id = $${params.length}`; }
    if (from) { params.push(from); query += ` AND a.date >= $${params.length}`; }
    if (to) { params.push(to); query += ` AND a.date <= $${params.length}`; }
    query += ` ORDER BY a.date DESC`;

    const records = await sql(query, params);

    let users: { id: string; name: string }[] = [];
    if (me.is_developer) {
      const userRows = await sql(`SELECT id, name FROM users WHERE is_active = true ORDER BY name ASC`);
      users = userRows as { id: string; name: string }[];
    }

    return NextResponse.json({ records, isOwner: me.is_developer, currentUserId: me.id, users });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const me = await currentUser(req);
    if (!me) return NextResponse.json({ error: "No session" }, { status: 401 });

    const body = await req.json();
    const { userId, date, clockIn, clockOut, status, notes } = body;
    if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

    // Editing someone else's record requires being the account owner -
    // editing your own is always allowed.
    const targetUserId = userId || me.id;
    if (targetUserId !== me.id && !me.is_developer) {
      return NextResponse.json({ error: "You can only edit your own attendance" }, { status: 403 });
    }

    const rows = await sql(
      `INSERT INTO attendance_records (user_id, date, clock_in, clock_out, status, notes, is_manual, edited_by)
       VALUES ($1, $2, $3, $4, $5, $6, true, $7)
       ON CONFLICT (user_id, date) DO UPDATE SET
         clock_in = COALESCE($3, attendance_records.clock_in),
         clock_out = $4,
         status = COALESCE($5, attendance_records.status),
         notes = COALESCE($6, attendance_records.notes),
         is_manual = true,
         edited_by = $7,
         updated_at = now()
       RETURNING *`,
      [targetUserId, date, clockIn || null, clockOut || null, status || null, notes ?? null, me.id]
    );

    await logAudit(req, "attendance_edited", "attendance", rows[0]?.id, `${date} - ${status || "updated"}`, { targetUserId, editedBy: me.name });

    return NextResponse.json({ record: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const me = await currentUser(req);
    if (!me) return NextResponse.json({ error: "No session" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const before = await sql(`SELECT user_id, date FROM attendance_records WHERE id = $1`, [id]);
    if (before[0] && before[0].user_id !== me.id && !me.is_developer) {
      return NextResponse.json({ error: "You can only delete your own attendance" }, { status: 403 });
    }

    await sql(`DELETE FROM attendance_records WHERE id = $1`, [id]);
    if (before[0]) await logAudit(req, "attendance_deleted", "attendance", id, before[0].date, {});
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
