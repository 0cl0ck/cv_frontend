import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

function getCookieDomain(): string | undefined {
  const d = process.env.COOKIE_DOMAIN
  if (typeof d === 'string' && d.trim().length > 0) return d.trim()
  return undefined
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { password } = (await request.json()) as { password?: string }
    const expected = process.env.MAINTENANCE_PASSWORD
    if (!expected || !password || password !== expected) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const res = NextResponse.json({ success: true })
    res.cookies.set('maintenance-authorized', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: getCookieDomain(),
      maxAge: 60 * 60 * 8,
    })
    return res
  } catch {
    return NextResponse.json({ success: false, message: 'Bad Request' }, { status: 400 })
  }
}
