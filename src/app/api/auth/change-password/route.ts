import { NextRequest, NextResponse } from 'next/server';
import { checkOrigin } from '@/lib/security/origin-check';

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;

  try {
    const token = request.cookies.get('payload-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errorMessage = 'Erreur lors de la mise à jour du mot de passe';

      if (typeof data?.error === 'string') {
        errorMessage = data.error;
      } else if (typeof data?.message === 'string') {
        errorMessage = data.message;
      } else if (data?.error?.message) {
        errorMessage = data.error.message as string;
      }

      return NextResponse.json({ error: errorMessage, details: data?.error?.details }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[/api/auth/change-password] erreur:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
