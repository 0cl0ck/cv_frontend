import { NextRequest, NextResponse } from 'next/server';
import type { AxiosError, AxiosResponse } from 'axios';
import { httpClient } from '@/lib/httpClient';
import { checkOrigin } from '@/lib/security/origin-check';
import { secureLogger as logger } from '@/utils/logger';

type ForgotPasswordPayload = {
  email: string;
  collection?: 'customers' | 'admins';
};

const DEFAULT_SUCCESS_MESSAGE =
  "Si l'adresse email existe dans notre systeme, nous venons d'envoyer un email de reinitialisation.";

function extractErrorMessage(data: unknown): string | undefined {
  if (!data) return undefined;

  if (typeof data === 'string') {
    return data.trim() || undefined;
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

export async function POST(request: NextRequest) {
  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    rawBody = null;
  }

  const email = typeof rawBody === 'object' && rawBody !== null && 'email' in rawBody
    ? String((rawBody as Record<string, unknown>).email || '').trim()
    : '';

  const collection =
    typeof rawBody === 'object' &&
    rawBody !== null &&
    'collection' in rawBody &&
    ((rawBody as Record<string, unknown>).collection === 'admins' ||
      (rawBody as Record<string, unknown>).collection === 'customers')
      ? ((rawBody as Record<string, unknown>).collection as 'admins' | 'customers')
      : 'customers';

  if (!email) {
    return NextResponse.json(
      { error: "Veuillez fournir une adresse email valide." },
      { status: 400 },
    );
  }

  const payload: ForgotPasswordPayload = {
    email,
    collection,
  };

  const backendUrl =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000';

  const sendRequest = () =>
    httpClient.post(`${backendUrl}/api/auth/forgot-password`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  let response: AxiosResponse | undefined;

  try {
    response = await sendRequest();
  } catch (err) {
    const axiosErr = err as AxiosError;
    response = axiosErr.response;

    if (!response) {
      logger.error('[/api/auth/forgot-password] Backend unreachable', {
        code: axiosErr.code,
        message: axiosErr.message,
      });

      return NextResponse.json(
        {
          error: "Le service d'authentification est momentanement indisponible. Merci de reessayer dans quelques instants.",
        },
        { status: 502 },
      );
    }
  }

  const { status, data } = response!;
  const errorFromBackend = extractErrorMessage(data);

  if (status >= 400) {
    let message = errorFromBackend || "Impossible d'envoyer le lien de reinitialisation.";

    if (status === 404) {
      message = 'Service momentanement indisponible. Merci de reessayer plus tard.';
    } else if (status === 429) {
      message = 'Vous avez demande un lien plusieurs fois. Veuillez patienter avant de recommencer.';
    } else if (status === 401 || status === 403) {
      message = 'Authentification requise pour effectuer cette demande.';
    } else if (status >= 500) {
      message = "Le service d'authentification rencontre un probleme. Merci de reessayer.";
    }

    logger.warn('[/api/auth/forgot-password] Backend responded with error', {
      status,
      message,
    });

    return NextResponse.json({ error: message }, { status });
  }

  let successMessage = DEFAULT_SUCCESS_MESSAGE;
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as Record<string, unknown>).message === 'string'
  ) {
    const messageValue = (data as Record<string, unknown>).message as string;
    const trimmed = messageValue.trim();
    if (trimmed.length > 0) {
      successMessage = trimmed;
    } else if (errorFromBackend) {
      successMessage = errorFromBackend;
    }
  } else if (errorFromBackend) {
    successMessage = errorFromBackend;
  }

  logger.info('[/api/auth/forgot-password] Reset link request handled', {
    maskedEmail: email.replace(/(^.).*(@.*$)/, '$1***$2'),
    status,
  });

  const responseBody: Record<string, unknown> = {
    success: true,
    message: successMessage,
  };

  if (typeof data === 'object' && data !== null && 'userFound' in data) {
    responseBody.userFound = (data as Record<string, unknown>).userFound;
  }

  return NextResponse.json(responseBody, { status: 200 });
}
