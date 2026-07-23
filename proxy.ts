import { auth } from "@/auth";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";
import { NextResponse } from "next/server";

const publicAuthRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/admin/login",
];

type RateRule = {
  prefix: string;
  limit: number;
  windowMs: number;
};

const rateLimitedApiRoutes: RateRule[] = [
  { prefix: "/api/auth/register", limit: 5, windowMs: 60000 },
  { prefix: "/api/auth/forgot-password", limit: 5, windowMs: 60000 },
  { prefix: "/api/auth/reset-password", limit: 5, windowMs: 60000 },
  { prefix: "/api/orders", limit: 20, windowMs: 60000 },
  { prefix: "/api/payments", limit: 20, windowMs: 60000 },
  { prefix: "/api/survey/responses", limit: 30, windowMs: 60000 },
];

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
}

// Server layouts (e.g. app/admin/layout.tsx) can't read the pathname
// directly, so forward it as a header for route-aware guards there.
function passThrough(req: Request, pathname: string) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const rateLimitRule = rateLimitedApiRoutes.find((rule) =>
    pathname.startsWith(rule.prefix)
  );

  if (rateLimitRule) {
    const ip = getClientIp(req);
    const key = rateLimitRule.prefix + ":" + ip;
    const result = checkRateLimit(key, rateLimitRule.limit, rateLimitRule.windowMs);

    if (!result.allowed) {
      return NextResponse.json(
        { success: false, error: "Çox sayda cəhd. Bir az sonra yenidən cəhd edin." },
        { status: 429 }
      );
    }
  }

  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  const isAdminPageRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAccountRoute = pathname.startsWith("/account");
  const isPublicAuthRoute = publicAuthRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isAdmin = !!userRole && ADMIN_ROLES.includes(userRole);

  // Backstop for admin API routes: each handler already calls requireAdmin(),
  // this just ensures a missing/forgotten check doesn't leave a route exposed.
  // JSON (not a redirect) since these are called by fetch/XHR, not navigated to.
  if (isAdminApiRoute) {
    if (!isLoggedIn || !isAdmin) {
      return apiError("Unauthorized", 401);
    }
    return passThrough(req, pathname);
  }

  if (isPublicAuthRoute) {
    if (isLoggedIn && pathname === "/login") {
      return NextResponse.redirect(new URL("/account", req.url));
    }
    if (isLoggedIn && isAdminLogin && isAdmin) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return passThrough(req, pathname);
  }

  if (isAdminPageRoute && !isAdminLogin) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  if (isAccountRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return passThrough(req, pathname);
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/account/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/api/auth/:path*",
    "/api/orders/:path*",
    "/api/payments/:path*",
    "/api/survey/:path*",
  ],
};
