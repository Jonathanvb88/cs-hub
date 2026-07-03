import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { getServerSession } from "next-auth";
import { getTodayEvents } from "@/lib/graphClient";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  const session = await getServerSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const events = await getTodayEvents(session.accessToken);
    return NextResponse.json({ events });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
