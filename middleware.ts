// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-fallback-key-change-me'
);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionToken = request.cookies.get('admin_session')?.value;
  
  const isAuthPage = path.startsWith('/admin/login') || 
                     path.startsWith('/admin/forgot-password') || 
                     path.startsWith('/admin/reset-password');

  let isValidSession = false;

  // Cryptographically verify the token at the Edge
  if (sessionToken) {
    try {
      await jwtVerify(sessionToken, JWT_SECRET);
      isValidSession = true;
    } catch (error) {
      // Token is expired, malformed, or tampered with
      isValidSession = false;
    }
  }
  
  // UX Improvement: Prevent logged-in users from seeing auth pages
  if (isAuthPage && isValidSession) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Protect all /admin routes EXCEPT the auth pages
  if (path.startsWith('/admin') && !isAuthPage && !isValidSession) {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    
    // Clear the invalid/forged cookie to prevent infinite redirect loops
    if (sessionToken && !isValidSession) {
      response.cookies.delete('admin_session');
    }
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};