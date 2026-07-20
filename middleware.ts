// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Protect all /admin routes EXCEPT the auth pages
  const isAuthPage = path.startsWith('/admin/login') || path.startsWith('/admin/forgot-password') || path.startsWith('/admin/reset-password');
  
  if (path.startsWith('/admin') && !isAuthPage) {
    const session = request.cookies.get('admin_session');
    
    // If no session cookie exists, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Ensure middleware only runs on admin paths to save compute resources
export const config = {
  matcher: ['/admin/:path*'],
};