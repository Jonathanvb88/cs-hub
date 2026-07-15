import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  const session = await getServerSession();

  return NextResponse.json({
    aiFeatures: process.env.ANTHROPIC_API_KEY ? "active" : "paused",
    graphIntegration: session?.accessToken ? "active" : "pending",
  });
}
