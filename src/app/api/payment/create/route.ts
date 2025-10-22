import { NextRequest, NextResponse } from 'next/server'
import { checkOrigin } from '@/lib/security/origin-check'

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * Route BFF pour la création de paiement VivaWallet.
 * Proxy dédié vers le backend Payload pour éviter les appels directs depuis le navigateur.
 */
export async function POST(request: NextRequest) {
  const originCheck = checkOrigin(request)
  if (originCheck) return originCheck

  try {
    const body = await request.json()

    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    })

    const forwardableHeaders = [
      ['Cookie', 'cookie'],
      ['Authorization', 'authorization'],
      ['X-CSRF-Token', 'x-csrf-token'],
      ['Payload-CSRF', 'payload-csrf'],
      ['X-XSRF-Token', 'x-xsrf-token'],
      ['X-Requested-With', 'x-requested-with'],
      ['User-Agent', 'user-agent'],
      ['Accept-Language', 'accept-language'],
      ['Origin', 'origin'],
      ['Referer', 'referer'],
      ['X-Forwarded-For', 'x-forwarded-for'],
      ['X-Real-IP', 'x-real-ip'],
    ] as const

    for (const [targetName, sourceName] of forwardableHeaders) {
      const value = request.headers.get(sourceName)
      if (value) {
        headers.set(targetName, value)
      }
    }

    const response = await fetch(`${BACKEND_URL}/api/payment/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[BFF /api/payment/create] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
