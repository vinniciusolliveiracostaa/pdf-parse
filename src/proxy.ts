import { headers } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const publicRoutes = [
  { path: '/sign-in', whenAuthenticated: 'redirect' },
  { path: '/sign-up', whenAuthenticated: 'redirect' },
  { path: '/forgot-password', whenAuthenticated: 'redirect' },
] as const

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = '/sign-in'
const REDIRECT_WHEN_AUTHENTICATED_ROUTE = '/'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  const publicRoute = publicRoutes.find((route) => route.path === path)

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session && publicRoute) {
    return NextResponse.next()
  }

  if (!session && !publicRoute) {
    return NextResponse.redirect(
      new URL(REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE, request.url),
    )
  }

  if (session && publicRoute && publicRoute.whenAuthenticated === 'redirect') {
    return NextResponse.redirect(
      new URL(REDIRECT_WHEN_AUTHENTICATED_ROUTE, request.url),
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
