import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { getServerSession } from "next-auth";
import { markEmailRead } from "@/lib/graphClient";

export async function POST(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  const session = await getServerSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  try {
    const { messageId } = await req.json();
    if (!messageId) return NextResponse.json({ error: "messageId is required" }, { status: 400 });
    await markEmailRead(session.accessToken, messageId);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
