import { auth } from "@/auth";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { checkRateLimit } from "@/lib/rate-limit";
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
];

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? "unknown";
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
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAccountRoute = pathname.startsWith("/account");
  const isPublicAuthRoute = publicAuthRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublicAuthRoute) {
    if (isLoggedIn && pathname === "/login") {
      return NextResponse.redirect(new URL("/account", req.url));
    }
    if (isLoggedIn && isAdminLogin && userRole && ADMIN_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (isAdminRoute && !isAdminLogin) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!userRole || !ADMIN_ROLES.includes(userRole)) {
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

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/api/auth/:path*",
    "/api/orders/:path*",
    "/api/payments/:path*",
  ],
};
