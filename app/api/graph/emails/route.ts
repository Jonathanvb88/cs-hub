import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { getServerSession } from "next-auth";
import { getRecentEmails } from "@/lib/graphClient";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  const session = await getServerSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const emails = await getRecentEmails(session.accessToken, 15);
    return NextResponse.json({ emails });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
