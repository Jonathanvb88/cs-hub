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
      authorized: ({ token }) => !!token,
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
