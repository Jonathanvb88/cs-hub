import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAuth(req);
  if (authError) return authError;

  return NextResponse.json({
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || null,
    branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    environment: process.env.VERCEL_ENV || "development",
  });
}
