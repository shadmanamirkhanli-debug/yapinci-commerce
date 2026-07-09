import { auth } from "@/auth";
import { ADMIN_ROLES } from "@/lib/auth/roles";
import { NextResponse } from "next/server";

const publicAuthRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/admin/login",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isAccountRoute = pathname.startsWith("/account");
  const isPublicAuthRoute = publicAuthRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
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
  ],
};
