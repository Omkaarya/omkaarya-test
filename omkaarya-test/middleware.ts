import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Define public routes
  const isLoginPage = pathname === '/super-admin/invite';
  const isApiRoute = pathname.startsWith('/api/');
  const isPublicAsset = pathname.match(/\.(.*)$/); // Match files like favicon.ico, images, etc.

  // Bypass next internal files and static assets
  if (pathname.startsWith('/_next') || isPublicAsset) {
    return NextResponse.next();
  }

  // Allow API routes to pass through (API routes have their own auth checks)
  if (isApiRoute) {
    return NextResponse.next();
  }

  // If user is logged in and tries to access the login page, redirect to dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is NOT logged in and tries to access a protected page, redirect to login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/super-admin/invite', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except those starting with `_next/static`, `_next/image`, `favicon.ico`, etc.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
