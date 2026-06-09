import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { nextJsonError } from "@/lib/api-envelope";
import { verifyToken } from "@/lib/auth-utils";
import {
  isTempleAdminProtectedApiPath,
  isTempleAdminPublicApiPath,
} from "@/lib/temple-admin-api-paths";
import { isTempleAdminPublicPath } from "@/lib/temple-admin-login";
import { isTempleScopedAuthPayload } from "@/lib/temple-admin-session";
import { isSuperAdminProtectedApiPath } from "@/lib/super-admin-api-paths";

function applyNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

function isSuperAdminProtectedPage(pathname: string): boolean {
  return (
    pathname.startsWith("/super-admin") &&
    pathname !== "/super-admin/invite"
  );
}

function isTempleAdminProtectedPage(pathname: string): boolean {
  return pathname.startsWith("/temple-admin") && !isTempleAdminPublicPath(pathname);
}

async function tokenPayload(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token?.trim()) return null;
  const payload = await verifyToken(token);
  return payload as Record<string, unknown> | null;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = new Set([
    "/",
    "/pricing",
    "/login",
    "/super-admin/invite",
    "/temple-admin/forgot-password",
  ]);

  const isLoginPage = pathname === "/login";
  const isPublicRoute = publicRoutes.has(pathname);
  const isApiRoute = pathname.startsWith("/api/");
  const isPublicAsset = pathname.match(/\.(.*)$/);

  if (pathname.startsWith("/_next") || isPublicAsset) {
    return NextResponse.next();
  }

  const legacyViewTemple = pathname.match(/^\/super-admin\/edit-temple\/([^/]+)\/?$/);
  if (legacyViewTemple && request.nextUrl.searchParams.get("view") === "1") {
    const tenantId = legacyViewTemple[1];
    const target = new URL(`/super-admin/view-temple/${encodeURIComponent(tenantId)}`, request.url);
    return applyNoStoreHeaders(NextResponse.redirect(target));
  }

  if (isApiRoute && isSuperAdminProtectedApiPath(pathname) && !token?.trim()) {
    return nextJsonError(
      401,
      "UNAUTHORIZED",
      "Authentication required.",
      "Sign in with a super-admin account to use this API."
    );
  }

  if (isApiRoute && isTempleAdminProtectedApiPath(pathname) && !isTempleAdminPublicApiPath(pathname)) {
    if (!token?.trim()) {
      return nextJsonError(
        401,
        "UNAUTHORIZED",
        "Authentication required.",
        "Sign in with a temple administrator account to use this API."
      );
    }
    const payload = await tokenPayload(request);
    
    if (!isTempleScopedAuthPayload(payload)) {
      return nextJsonError(
        403,
        "FORBIDDEN",
        "Temple-admin session required",
        "Sign in with a temple administrator account to use this API."
      );
    }
  }

  if (isApiRoute) {
    return NextResponse.next();
  }

  const payload = token ? await tokenPayload(request) : null;
  const hasTempleSession = isTempleScopedAuthPayload(payload);

  if (token && isLoginPage) {
    if (hasTempleSession) {
      return NextResponse.redirect(new URL("/temple-admin", request.url));
    }
    return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
  }

  if (!token && !isPublicRoute) {
    return applyNoStoreHeaders(
      NextResponse.redirect(new URL("/login", request.url))
    );
  }

  if (isTempleAdminProtectedPage(pathname) && !hasTempleSession) {
    return applyNoStoreHeaders(
      NextResponse.redirect(new URL("/login", request.url))
    );
  }

  const response = NextResponse.next();
  if (isSuperAdminProtectedPage(pathname) || isTempleAdminProtectedPage(pathname)) {
    return applyNoStoreHeaders(response);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
