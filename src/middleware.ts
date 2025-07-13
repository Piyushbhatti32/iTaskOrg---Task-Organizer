import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get the current pathname
  const path = request.nextUrl.pathname
  console.log('Middleware - Current path:', path);

  // Array of routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // Array of routes that require authentication
  const protectedRoutes = ['/tasks', '/calendar', '/stats', '/profile', '/settings', '/focus', '/templates', '/groups', '/team', '/completed']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  // Get the token from cookies
  const token = request.cookies.get('auth-token')
  console.log('Middleware - Auth token present:', !!token);

  // Check if token exists and is valid
  const hasValidToken = token?.value && token.value.length > 0
  console.log('Middleware - Has valid token:', hasValidToken);

  // If it's a protected route and user is not authenticated,
  // redirect to login page with the original path
  if (isProtectedRoute && !hasValidToken) {
    console.log('Middleware - Redirecting to login, no valid token');
    const url = new URL('/login', request.url)
    // Store the full URL to redirect back to
    url.searchParams.set('from', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  // If user is authenticated and trying to access public pages,
  // redirect to tasks page
  if (isPublicRoute && hasValidToken) {
    console.log('Middleware - Redirecting to tasks, user is authenticated');
    return NextResponse.redirect(new URL('/tasks', request.url))
  }

  // Handle root path redirect
  if (path === '/') {
    if (hasValidToken) {
      console.log('Middleware - Redirecting root to tasks, user is authenticated');
      return NextResponse.redirect(new URL('/tasks', request.url))
    } else {
      console.log('Middleware - Redirecting root to login, user is not authenticated');
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/reset-password',
    '/tasks/:path*',
    '/calendar/:path*',
    '/stats/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/focus/:path*',
    '/templates/:path*',
    '/groups/:path*',
    '/team/:path*',
    '/completed/:path*'
  ],
}
