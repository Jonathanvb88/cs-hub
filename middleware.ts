import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return res;
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Vercel Cron calls this endpoint on a schedule and carries no session cookie —
        // let it through by User-Agent, everything else on this path still needs a token.
        if (
          req.nextUrl.pathname === "/api/db/health-calculate" &&
          (req.headers.get("user-agent") || "").includes("vercel-cron")
        ) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/projects/:path*",
    "/communications/:path*",
    "/followups/:path*",
    "/reminders/:path*",
    "/calendar/:path*",
    "/documents/:path*",
    "/knowledge/:path*",
    "/health/:path*",
    "/intelligence/:path*",
    "/reports/:path*",
    "/team/:path*",
    "/search/:path*",
    "/inbox/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/api/db/:path*",
    "/api/graph/:path*",
    "/api/ai/:path*",
  ],
};
