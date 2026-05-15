import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { nextJsonError } from "@/lib/api-envelope";
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
    pathname !== "/super-admin/login" &&
    pathname !== "/super-admin/invite"
  );
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = new Set([
    '/',
    '/pricing',
    '/login',
    '/super-admin/login',
    '/super-admin/invite',
    '/temple-admin/signin',
  ]);

  const isLoginPage =
    pathname === '/login' ||
    pathname === '/super-admin/login' ||
    pathname === '/super-admin/invite' ||
    pathname === '/temple-admin/signin';
  const isPublicRoute = publicRoutes.has(pathname);
  const isApiRoute = pathname.startsWith('/api/');
  const isPublicAsset = pathname.match(/\.(.*)$/); // Match files like favicon.ico, images, etc.

  // Bypass next internal files and static assets
  if (pathname.startsWith('/_next') || isPublicAsset) {
    return NextResponse.next();
  }

  // Super-admin API proxies require a session cookie; handlers still enforce role + Bearer upstream.
  if (isApiRoute && isSuperAdminProtectedApiPath(pathname) && !token?.trim()) {
    return nextJsonError(
      401,
      "UNAUTHORIZED",
      "Authentication required.",
      "Sign in with a super-admin account to use this API."
    );
  }

  // Other API routes use their own auth (e.g. temple-admin, public marketing).
  if (isApiRoute) {
    return NextResponse.next();
  }

  // If user is logged in and tries to access the login page, redirect to dashboard
  if (token && isLoginPage) {
    if (pathname === '/temple-admin/signin') {
      return NextResponse.redirect(new URL('/temple-admin', request.url));
    }
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }
    return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
  }

  // If user is NOT logged in and tries to access a protected page, redirect to login
  if (!token && !isPublicRoute) {
    if (pathname.startsWith('/temple-admin')) {
      return NextResponse.redirect(new URL('/temple-admin/signin', request.url));
    }
    if (pathname.startsWith('/super-admin')) {
      return applyNoStoreHeaders(
        NextResponse.redirect(new URL('/super-admin/login', request.url))
      );
    }
    return applyNoStoreHeaders(
      NextResponse.redirect(new URL('/super-admin/login', request.url))
    );
  }

  const response = NextResponse.next();
  if (isSuperAdminProtectedPage(pathname)) {
    return applyNoStoreHeaders(response);
  }
  return response;
}

export const config = {
  matcher: [
    // Match all paths except those starting with `_next/static`, `_next/image`, `favicon.ico`, etc.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
