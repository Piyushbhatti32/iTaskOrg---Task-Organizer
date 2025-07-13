import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get the current pathname
  const path = request.nextUrl.pathname

  // Array of routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // Array of routes that require authentication
  const protectedRoutes = ['/tasks', '/calendar', '/stats', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  // Get the token from cookies
  const token = request.cookies.get('auth-token')?.value

  // If it's a protected route and user is not authenticated,
  // redirect to login page
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is authenticated and trying to access login/register pages,
  // redirect to home page
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/login',
    '/register',
    '/reset-password',
    '/tasks/:path*',
    '/calendar/:path*',
    '/stats/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
}
