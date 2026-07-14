import { auth } from "@/auth";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiError } from "@/lib/api-response";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Storefront-only auth pages — /admin/login is handled separately since
// /admin is never locale-prefixed.
const storefrontAuthRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const nonDefaultLocales = routing.locales.filter(
  (locale) => locale !== routing.defaultLocale
);

// Strips a leading /en or /ru segment (if present) so the rest of this file
// can classify routes the same way regardless of which locale is active.
// /admin and /api are never prefixed, so this is a no-op for them.
function splitLocale(pathname: string): { locale: string; rest: string } {
  for (const locale of nonDefaultLocales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return { locale, rest: pathname.slice(locale.length + 1) || "/" };
    }
  }
  return { locale: routing.defaultLocale, rest: pathname };
}

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

  const { locale, rest: unprefixedPathname } = splitLocale(pathname);
  const localizedPath = (path: string) =>
    locale === routing.defaultLocale ? path : `/${locale}${path}`;

  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const isAdminApiRoute = pathname.startsWith("/api/admin");
  const isAdminPageRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAccountRoute = unprefixedPathname.startsWith("/account");
  const isStorefrontAuthRoute = storefrontAuthRoutes.some(
    (route) => unprefixedPathname === route || unprefixedPathname.startsWith(route + "/")
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

  if (isAdminLogin) {
    if (isLoggedIn && isAdmin) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return passThrough(req, pathname);
  }

  if (isStorefrontAuthRoute) {
    if (isLoggedIn && unprefixedPathname === "/login") {
      return NextResponse.redirect(new URL(localizedPath("/account"), req.url));
    }
    return intlMiddleware(req);
  }

  if (isAdminPageRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return passThrough(req, pathname);
  }

  if (isAccountRoute && !isLoggedIn) {
    const loginUrl = new URL(localizedPath("/login"), req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Everything except /api, /admin, Next internals, and static files —
    // needed so next-intl can negotiate/rewrite the locale prefix on every
    // storefront page (including its /en, /ru, and unprefixed /az variants).
    "/((?!api|admin|_next|.*\\..*).*)",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/auth/:path*",
    "/api/orders/:path*",
    "/api/payments/:path*",
  ],
};
