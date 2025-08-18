/**
 * Middleware để handle authentication và routing
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/admin', '/asset', '/unit']
const authRoutes = ['/login', '/register']
const publicRoutes = ['/api', '/_next', '/favicon.ico', '/public', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public routes and Next.js internals
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get auth token from localStorage (this is just a simple check)
  // In a real app, you'd check HTTP-only cookies or JWT tokens
  const isAuthenticated = request.cookies.get('auth_user')?.value

  // Redirect authenticated users away from auth pages
  if (authRoutes.some(route => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Redirect unauthenticated users to login for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Default redirect to admin for root
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
