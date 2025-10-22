import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

function getCookieDomain(): string | undefined {
  const d = process.env.COOKIE_DOMAIN
  if (typeof d === 'string' && d.trim().length > 0) return d.trim()
  return undefined
}

export async function POST(_request: NextRequest): Promise<NextResponse> {
  const res = NextResponse.json({ success: true })
  res.cookies.set('maintenance-authorized', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    domain: getCookieDomain(),
    maxAge: 0,
  })
  return res
}
