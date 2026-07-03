import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * Call this at the top of any API route handler.
 * Returns null if authenticated, or a 401 Response if not.
 *
 * Usage:
 *   const authError = await requireAuth(req);
 *   if (authError) return authError;
 */
export async function requireAuth(req: NextRequest): Promise<NextResponse | null> {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorised — please sign in to access this resource" },
        { status: 401 }
      );
    }

    return null; // authenticated, proceed
  } catch {
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 401 }
    );
  }
}
