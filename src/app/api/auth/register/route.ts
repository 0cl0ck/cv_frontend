import { NextRequest, NextResponse } from 'next/server';
import { secureLogger as logger } from '@/utils/logger';
import { httpClient } from '@/lib/httpClient';
import { checkOrigin } from '@/lib/security/origin-check';
import type { AxiosError, AxiosResponse } from 'axios';

export async function POST(request: NextRequest) {
  // Protection CSRF basique par Origin/Referer (même logique que login)
  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;

  try {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const body = await request.json();

    const sendRequest = async () =>
      httpClient.post(`${backendUrl}/api/auth/register`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

    let response: AxiosResponse | undefined;
    try {
      response = await sendRequest();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError;
      response = axiosErr.response;
    }

    const data = response?.data as Record<string, unknown> | undefined;

    if (!response || response.status < 200 || response.status >= 300) {
      let errorMessage = "Erreur d'inscription";
      if (data) {
        if (typeof data.error === 'string') errorMessage = data.error;
        else if (data && typeof (data as { message?: string }).message === 'string') errorMessage = (data as { message: string }).message;
      }
      logger.error('[/api/auth/register] Erreur retournée au client', { errorMessage });
      return NextResponse.json({ error: errorMessage }, { status: response?.status || 500 });
    }

    // Si le backend renvoie un token (même logique que login), on le place en cookie
    const token = (data && typeof data === 'object' ? (data as { token?: string }).token : undefined) || '';

    const jsonResponse = NextResponse.json(
      {
        ...data,
        registered: true,
        message: "Inscription réussie",
      },
      { status: 200 }
    );

    if (token) {
      logger.debug('[/api/auth/register] Token reçu du backend', { length: token.length });
      jsonResponse.cookies.set('payload-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        path: '/',
      });
    }

    return jsonResponse;
  } catch (error) {
    console.error('[/api/auth/register] Erreur:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
      },
      { status: 500 }
    );
  }
}
