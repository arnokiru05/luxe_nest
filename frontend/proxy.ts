// @ts-nocheck
import { NextResponse } from 'next/server';

// Paths that require authentication (redirect to login if no token cookie present)
const protectedPaths = [
  '/admin',
];

// Public paths — always allow through
const publicPrefixes = [
  '/_next',
  '/api',
  '/favicon',
  '/icon',
  '/public',
];

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Always allow public prefixes (API routes handle their own auth)
  if (publicPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Check if path requires auth
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    // Only check if a token cookie EXISTS — actual verification is done server-side
    const token = request.cookies.get('token')?.value;

    if (!token) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|icon.png|public).*)',
  ],
};
