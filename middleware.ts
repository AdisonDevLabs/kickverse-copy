// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = request.cookies.get('admin_session');
  
  const isAuthPage = path.startsWith('/admin/login') || 
                     path.startsWith('/admin/forgot-password') || 
                     path.startsWith('/admin/reset-password');
  
  // UX Improvement: Prevent logged-in users from seeing auth pages
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Protect all /admin routes EXCEPT the auth pages
  if (path.startsWith('/admin') && !isAuthPage && !session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};