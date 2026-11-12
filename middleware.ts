import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function MUST be named 'middleware' or exported as 'default'
export function middleware(request: NextRequest) {
  const session = request.cookies.get('user_session');
  const { pathname } = request.nextUrl;
  
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/player');

  if (isProtectedRoute && !session) {
    // Redirect to home if no cookie is found
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Ensure your matcher is outside the function
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/player/:path*',
  ],
};