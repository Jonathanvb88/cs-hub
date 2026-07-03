import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAuth } from "@/lib/requireAuth";

interface TimelineEvent {
  type: string;
  title: string;
  date: string;
  meta: string;
}

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const clientId = req.nextUrl.searchParams.get("clientId");
    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    const comms = await sql(
      `SELECT subject as title, received_at as date, type, direction FROM communications WHERE client_id = $1 AND deleted_at IS NULL`,
      [clientId]
    );
    const docs = await sql(
      `SELECT title, created_at as date, type, status FROM documents WHERE client_id = $1 AND deleted_at IS NULL`,
      [clientId]
    );
    const followUps = await sql(
      `SELECT title, created_at as date, status, priority FROM follow_ups WHERE client_id = $1 AND deleted_at IS NULL`,
      [clientId]
    );
    const projects = await sql(
      `SELECT name as title, created_at as date, status, type FROM projects WHERE client_id = $1 AND deleted_at IS NULL`,
      [clientId]
    );

    const events: TimelineEvent[] = [
      ...comms.map((c: Record<string, unknown>) => ({
        type: "communication",
        title: c.title as string,
        date: c.date as string,
        meta: `${c.type} · ${c.direction}`,
      })),
      ...docs.map((d: Record<string, unknown>) => ({
        type: "document",
        title: d.title as string,
        date: d.date as string,
        meta: `${(d.type as string).toUpperCase()} · ${d.status}`,
      })),
      ...followUps.map((f: Record<string, unknown>) => ({
        type: "followup",
        title: f.title as string,
        date: f.date as string,
        meta: `${f.priority} priority · ${f.status}`,
      })),
      ...projects.map((p: Record<string, unknown>) => ({
        type: "project",
        title: p.title as string,
        date: p.date as string,
        meta: `${p.type} · ${p.status}`,
      })),
    ];

    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ events });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
