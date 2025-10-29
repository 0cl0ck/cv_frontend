'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

// Formulaire de recuperation de mot de passe
function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setStatusMessage('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          collection: 'customers',
        }),
        withCsrf: true,
      });

      const rawPayload = await response.text();
      let data: unknown = null;

      if (rawPayload) {
        try {
          data = JSON.parse(rawPayload);
        } catch {
          data = rawPayload.trim();
        }
      }

      if (!response.ok) {
        const fallbackMessage = "Impossible d'envoyer le lien pour le moment. Veuillez reessayer.";
        let message = fallbackMessage;

        if (typeof data === 'object' && data !== null) {
          const payload = data as Record<string, unknown>;
          const possibleError = payload.error;
          const possibleMessage = payload.message;

          if (typeof possibleError === 'string') {
            message = possibleError;
          } else if (
            possibleError &&
            typeof possibleError === 'object' &&
            'message' in possibleError &&
            typeof (possibleError as Record<string, unknown>).message === 'string'
          ) {
            message = String((possibleError as Record<string, unknown>).message);
          } else if (typeof possibleMessage === 'string') {
            message = possibleMessage;
          } else if (
            possibleError &&
            typeof possibleError === 'object' &&
            'details' in possibleError &&
            possibleError.details &&
            typeof (possibleError.details as Record<string, unknown>).fields === 'object'
          ) {
            const fields = (possibleError.details as Record<string, unknown>).fields as Record<string, unknown>;
            const firstKey = Object.keys(fields)[0];
            const firstVal = fields[firstKey];
            const firstMsg = Array.isArray(firstVal)
              ? firstVal[0]
              : typeof firstVal === 'string'
                ? firstVal
                : undefined;
            if (typeof firstMsg === 'string') {
              message = firstMsg;
            }
          }
        } else if (typeof data === 'string' && data.length > 0) {
          message = data;
        }

        if (message === fallbackMessage) {
          if (response.status === 400 || response.status === 422) {
            message = "Merci de verifier l'adresse email indiquee.";
          } else if (response.status === 404) {
            message = 'Service momentanement indisponible. Merci de reessayer plus tard.';
          } else if (response.status === 429) {
            message = 'Vous avez demande un lien plusieurs fois. Veuillez patienter avant de recommencer.';
          } else if (response.status >= 500) {
            message = 'Le service rencontre un probleme. Merci de reessayer dans quelques instants.';
          }
        }

        throw new Error(message);
      }

      let successMessage = "Si l'adresse email existe dans notre systeme, un email de reinitialisation a ete envoye.";
      if (
        typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof (data as Record<string, unknown>).message === 'string'
      ) {
        successMessage = (data as Record<string, unknown>).message as string;
      } else if (typeof data === 'string' && data.length > 0) {
        successMessage = data;
      }

      setStatusMessage(successMessage);
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur inattendue est survenue.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757]">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">Mot de passe oublie</h1>

      {success ? (
        <div className="bg-green-900 bg-opacity-25 text-white px-4 py-3 rounded mb-4" role="alert">
          <p className="font-bold">Demande envoyee</p>
          <p className="text-sm">
            {statusMessage || (
              <>
                Si un compte est associe a l&apos;adresse <span className="font-semibold">{email}</span>, vous recevrez un email
                avec les instructions pour reinitialiser votre mot de passe.
              </>
            )}
          </p>
          <p className="mt-4 text-center">
            <Link href="/connexion" className="text-[#10B981] hover:text-[#34D399] font-medium">
              Retour a la connexion
            </Link>
          </p>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-900 bg-opacity-25 text-red-300 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <p className="mb-4 text-[#BEC3CA]">
            Entrez votre adresse email et nous vous enverrons un lien pour reinitialiser votre mot de passe.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-[#BEC3CA] mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#007A72] hover:bg-[#059669] text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Envoi en cours...
                </span>
              ) : (
                'Envoyer le lien de reinitialisation'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-[#BEC3CA]">
              <Link href="/connexion" className="text-[#10B981] hover:text-[#34D399] font-medium">
                Retour a la connexion
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// Main page component
export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001A1F] px-4">
      <ForgotPasswordForm />
    </div>
  );
}
