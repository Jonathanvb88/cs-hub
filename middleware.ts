import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If authenticated, allow through
    if (token) {
      // Add security headers to every response
      const res = NextResponse.next();
      res.headers.set("X-Frame-Options", "DENY");
      res.headers.set("X-Content-Type-Options", "nosniff");
      res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
      return res;
    }

    // Not authenticated - redirect to login
    const loginUrl = new URL("/api/auth/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  },
  {
    callbacks: {
      // Return true to run middleware, false to skip
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/api/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    // Protect all app pages
    "/(app)/:path*",
    // Protect all database API routes
    "/api/db/:path*",
    // Protect Graph API routes
    "/api/graph/:path*",
    // Protect AI route
    "/api/ai/:path*",
    // Exclude auth routes, static files, and public assets
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
