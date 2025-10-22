import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authCookie = request.cookies.get('maintenance-authorized')?.value

  if (
    pathname === '/maintenance' ||
    pathname === '/api/maintenance/unlock' ||
    pathname === '/api/maintenance/lock' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  if (authCookie === '1') {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = '/maintenance'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = {
  matcher: '/:path*',
}
