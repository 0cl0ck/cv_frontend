'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const rawTokenParam = params?.token;
  const token = Array.isArray(rawTokenParam) ? rawTokenParam[0] : rawTokenParam;

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const parseRawPayload = (raw: string): unknown => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      const trimmed = raw.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  };

  const extractMessage = (data: unknown, fallback: string): string => {
    if (!data) return fallback;

    if (typeof data === 'string') {
      const trimmed = data.trim();
      return trimmed.length > 0 ? trimmed : fallback;
    }

    if (typeof data !== 'object' || data === null) {
      return fallback;
    }

    const payload = data as Record<string, unknown>;
    const possibleError = payload.error;
    const possibleMessage = payload.message;

    if (typeof possibleError === 'string' && possibleError.trim().length > 0) {
      return possibleError.trim();
    }

    if (
      possibleError &&
      typeof possibleError === 'object' &&
      'message' in possibleError &&
      typeof (possibleError as Record<string, unknown>).message === 'string'
    ) {
      const nested = String((possibleError as Record<string, unknown>).message).trim();
      if (nested.length > 0) {
        return nested;
      }
    }

    if (
      possibleError &&
      typeof possibleError === 'object' &&
      'details' in possibleError &&
      possibleError.details &&
      typeof (possibleError.details as Record<string, unknown>).fields === 'object'
    ) {
      const fields = (possibleError.details as Record<string, unknown>).fields as Record<string, unknown>;
      const firstKey = Object.keys(fields)[0];
      if (firstKey) {
        const value = fields[firstKey];
        if (Array.isArray(value) && typeof value[0] === 'string') {
          const nested = value[0].trim();
          if (nested.length > 0) return nested;
        }
        if (typeof value === 'string' && value.trim().length > 0) {
          return value.trim();
        }
      }
    }

    if (typeof possibleMessage === 'string' && possibleMessage.trim().length > 0) {
      return possibleMessage.trim();
    }

    return fallback;
  };

  const isResponseValid = (data: unknown): boolean => {
    if (!data || typeof data !== 'object') return true;
    const payload = data as Record<string, unknown>;
    if (typeof payload.valid === 'boolean') {
      return payload.valid;
    }
    if (typeof payload.success === 'boolean') {
      return payload.success;
    }
    return true;
  };

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token || '')}`);
        const rawPayload = await response.text();
        const data = parseRawPayload(rawPayload);
        const fallbackMessage = "Ce lien de reinitialisation n'est plus valide ou a expire.";

        if (response.ok && isResponseValid(data)) {
          setIsTokenValid(true);
          setError('');
        } else {
          setIsTokenValid(false);
          const message = extractMessage(data, fallbackMessage);
          setError(message);
        }
      } catch {
        setIsTokenValid(false);
        setError('Erreur lors de la verification du lien. Veuillez reessayer.');
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError('Lien de reinitialisation invalide.');
      setIsVerifying(false);
    }
  }, [token]);

  const validatePassword = () => {
    setPasswordError('');

    if (password.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caracteres.');
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
          collection: 'customers',
        }),
        withCsrf: true,
      });

      const rawPayload = await response.text();
      const data = parseRawPayload(rawPayload);
      const fallbackError = 'Erreur lors de la reinitialisation du mot de passe.';

      if (!response.ok) {
        const message = extractMessage(data, fallbackError);
        throw new Error(message);
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/connexion');
      }, 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001A1F] px-4">
        <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757]">
          <div className="text-center">
            <Loader2 size={40} className="mx-auto mb-4 animate-spin text-[#10B981]" />
            <p className="text-[#BEC3CA]">Verification du lien de reinitialisation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001A1F] px-4">
      <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757]">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Reinitialisation du mot de passe</h1>

        {error && !isTokenValid && (
          <div className="bg-red-900 bg-opacity-25 text-red-300 px-4 py-3 rounded mb-4" role="alert">
            <p className="font-bold">Lien invalide</p>
            <p className="text-sm">{error}</p>
            <p className="mt-4 text-center">
              <Link href="/mot-de-passe-oublie" className="text-[#10B981] hover:text-[#34D399] font-medium">
                Demander un nouveau lien
              </Link>
            </p>
          </div>
        )}

        {success ? (
          <div className="bg-green-900 bg-opacity-25 text-white px-4 py-3 rounded mb-4" role="alert">
            <p className="font-bold">Mot de passe mis a jour</p>
            <p className="text-sm">
              Votre mot de passe a ete reinitialise avec succes. Vous allez etre redirige vers la page de connexion dans
              quelques secondes.
            </p>
            <p className="mt-4 text-center">
              <Link href="/connexion" className="text-[#10B981] hover:text-[#34D399] font-medium">
                Se connecter maintenant
              </Link>
            </p>
          </div>
        ) : (
          isTokenValid && (
            <>
              {error && (
                <div className="bg-red-900 bg-opacity-25 text-red-300 px-4 py-3 rounded mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <p className="mb-4 text-[#BEC3CA]">
                Veuillez choisir un nouveau mot de passe securise pour votre compte.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-[#BEC3CA] mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                    required
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-[#8B93A0]">
                    8 caracteres minimum, incluant lettres, chiffres et caracteres speciaux
                  </p>
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#BEC3CA] mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                    required
                  />
                  {passwordError && <p className="mt-1 text-sm text-red-300">{passwordError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#007A72] hover:bg-[#059669] text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Reinitialisation en cours...
                    </span>
                  ) : (
                    'Reinitialiser mon mot de passe'
                  )}
                </button>
              </form>
            </>
          )
        )}
      </div>
    </div>
  );
}
