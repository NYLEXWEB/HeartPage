import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run middleware on /hp/admin paths
  if (pathname.startsWith("/hp/admin")) {
    const token = request.cookies.get("admin_token")?.value;

    // Check if the current route is the login page
    const isLoginPage = pathname === "/hp/admin/login";

    // Skip verification for API login route if any
    const isLoginApi = pathname === "/hp/admin/api/login";

    if (isLoginApi) {
      return NextResponse.next();
    }

    let payload = null;
    if (token) {
      payload = await verifyToken(token);
    }

    if (isLoginPage) {
      // If user is already logged in, redirect them to dashboard
      if (payload) {
        return NextResponse.redirect(new URL("/hp/admin/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // For all other /hp/admin/* pages
    if (!payload) {
      // Redirect to login page and preserve attempt URL (optional)
      const loginUrl = new URL("/hp/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/hp/admin/:path*"],
};
