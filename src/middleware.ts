/**
 * Middleware để handle authentication và routing
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// const protectedRoutes = ['/admin']
const protectedRoutes: string[] = []

const authRoutes = ['/login', '/register']

const publicRoutes = ['/api', '/_next', '/favicon.ico', '/public', '/admin', '/asset', '/unit']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Always redirect to /admin for all other routes
  if (pathname !== '/admin' && !pathname.startsWith('/admin/')) {
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
