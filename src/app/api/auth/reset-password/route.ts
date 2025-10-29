import { NextRequest, NextResponse } from 'next/server';
import type { AxiosError, AxiosResponse } from 'axios';
import { httpClient } from '@/lib/httpClient';
import { checkOrigin } from '@/lib/security/origin-check';
import { secureLogger as logger } from '@/utils/logger';

const DEFAULT_VERIFY_ERROR = 'Impossible de verifier ce lien de reinitialisation.';
const DEFAULT_RESET_ERROR = "Impossible de reinitialiser le mot de passe pour le moment.";
const DEFAULT_RESET_SUCCESS =
  'Mot de passe mis a jour. Vous pouvez desormais vous connecter avec vos nouveaux identifiants.';

function getBackendBaseUrl(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000'
  );
}

function extractErrorMessage(data: unknown): string | undefined {
  if (!data) return undefined;

  if (typeof data === 'string') {
    const trimmed = data.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (typeof data !== 'object') {
    return undefined;
  }

  const payload = data as Record<string, unknown>;
  const { error, message } = payload;

  if (typeof error === 'string' && error.trim().length > 0) {
    return error.trim();
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  ) {
    return String((error as Record<string, unknown>).message);
  }

  if (
    error &&
    typeof error === 'object' &&
    'details' in error &&
    error.details &&
    typeof (error.details as Record<string, unknown>).fields === 'object'
  ) {
    const fields = (error.details as Record<string, unknown>).fields as Record<string, unknown>;
    const firstKey = Object.keys(fields)[0];
    if (firstKey) {
      const value = fields[firstKey];
      if (Array.isArray(value) && typeof value[0] === 'string') {
        return value[0];
      }
      if (typeof value === 'string') {
        return value;
      }
    }
  }

  if (typeof message === 'string' && message.trim().length > 0) {
    return message.trim();
  }

  return undefined;
}

async function callBackend<T>(
  requestFn: () => Promise<AxiosResponse<T>>
): Promise<AxiosResponse<T> | { networkError: AxiosError }> {
  try {
    return await requestFn();
  } catch (err) {
    const axiosErr = err as AxiosError;
    if (axiosErr.response) {
      return axiosErr.response as AxiosResponse<T>;
    }
    return { networkError: axiosErr };
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim();
  if (!token) {
    return NextResponse.json(
      { error: 'Token manquant' },
      { status: 400 }
    );
  }

  const backendUrl = getBackendBaseUrl();
  const targetUrl = new URL(`${backendUrl}/api/auth/reset-password`);
  targetUrl.searchParams.set('token', token);

  const response = await callBackend(() =>
    httpClient.get(targetUrl.toString())
  );

  if ('networkError' in response) {
    const { networkError } = response;
    logger.error('[/api/auth/reset-password] Backend unreachable during token verification', {
      code: networkError.code,
      message: networkError.message,
    });

    return NextResponse.json(
      { error: DEFAULT_VERIFY_ERROR },
      { status: 502 }
    );
  }

  const { status, data } = response;
  const extractedMessage = extractErrorMessage(data);

  if (status >= 400) {
    let message = extractedMessage || DEFAULT_VERIFY_ERROR;

    if (status === 404) {
      message = 'Ce lien de reinitialisation n\'est plus valide ou a expire.';
    } else if (status === 429) {
      message = 'Trop de tentatives de verification detectees. Merci de patienter un instant.';
    } else if (status >= 500) {
      message = 'Le service de verification rencontre un probleme. Merci de reessayer plus tard.';
    }

    logger.warn('[/api/auth/reset-password] Token verification failed', {
      status,
      message,
    });

    return NextResponse.json(
      { valid: false, message },
      { status }
    );
  }

  return NextResponse.json(data ?? { valid: true });
}

export async function POST(request: NextRequest) {
  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    rawBody = null;
  }

  const token = typeof rawBody === 'object' && rawBody !== null && 'token' in rawBody
    ? String((rawBody as Record<string, unknown>).token || '').trim()
    : '';

  const newPassword = typeof rawBody === 'object' && rawBody !== null && 'newPassword' in rawBody
    ? String((rawBody as Record<string, unknown>).newPassword || '')
    : '';

  const collection =
    typeof rawBody === 'object' &&
    rawBody !== null &&
    'collection' in rawBody &&
    ((rawBody as Record<string, unknown>).collection === 'admins' ||
      (rawBody as Record<string, unknown>).collection === 'customers')
      ? ((rawBody as Record<string, unknown>).collection as 'admins' | 'customers')
      : 'customers';

  if (!token) {
    return NextResponse.json(
      { error: 'Token manquant' },
      { status: 400 }
    );
  }

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: 'Le mot de passe doit contenir au moins 8 caracteres.' },
      { status: 422 }
    );
  }

  const backendUrl = getBackendBaseUrl();
  const payload = { token, newPassword, collection };

  const response = await callBackend(() =>
    httpClient.post(`${backendUrl}/api/auth/reset-password`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  );

  if ('networkError' in response) {
    const { networkError } = response;
    logger.error('[/api/auth/reset-password] Backend unreachable during password reset', {
      code: networkError.code,
      message: networkError.message,
    });

    return NextResponse.json(
      { error: DEFAULT_RESET_ERROR },
      { status: 502 }
    );
  }

  const { status, data } = response;
  const extractedMessage = extractErrorMessage(data);

  if (status >= 400) {
    let message = extractedMessage || DEFAULT_RESET_ERROR;

    if (status === 400 || status === 422) {
      message = "Merci de verifier les informations fournies avant de reessayer.";
    } else if (status === 401 || status === 403) {
      message = 'Authentification requise pour poursuivre.';
    } else if (status === 404 || extractedMessage === 'Utilisateur introuvable') {
      message = 'Nous ne retrouvons pas ce compte. Merci de redemander un nouveau lien.';
    } else if (status === 410 || extractedMessage === 'Lien de reinitialisation invalide ou expire') {
      message = 'Ce lien de reinitialisation n\'est plus valide ou a expire.';
    } else if (status >= 500) {
      message = 'Le service de reinitialisation rencontre un probleme. Merci de reessayer dans quelques instants.';
    }

    logger.warn('[/api/auth/reset-password] Password reset failed', {
      status,
      message,
    });

    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }

  const successPayload =
    (typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as Record<string, unknown>).message === 'string')
      ? (data as Record<string, unknown>).message
      : extractedMessage || DEFAULT_RESET_SUCCESS;

  logger.info('[/api/auth/reset-password] Password successfully reset', {
    tokenHash: token.slice(0, 4) + '...' + token.slice(-4),
    status,
  });

  return NextResponse.json({
    success: true,
    message: successPayload,
  });
}
