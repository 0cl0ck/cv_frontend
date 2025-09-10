'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

// Formulaire de récupération de mot de passe
function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          collection: 'customers'
        }),
        withCsrf: true
      });

      const data = await response.json();

      if (!response.ok) {
        let message = 'Erreur lors de la demande de réinitialisation';
        if (data?.error) {
          message = typeof data.error === 'string' ? data.error : (data.error?.message || data.message || message);
          const fields = data.error?.details?.fields;
          if (fields && typeof fields === 'object') {
            const firstKey = Object.keys(fields)[0];
            const firstVal = fields[firstKey];
            const firstMsg = Array.isArray(firstVal) ? firstVal[0] : (typeof firstVal === 'string' ? firstVal : undefined);
            if (firstMsg) message = firstMsg;
          }
        } else if (data?.message) {
          message = data.message;
        }
        throw new Error(message);
      }

      // Demande réussie
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757]">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">Mot de passe oublié</h1>
      
      {success ? (
        <div className="bg-green-900 bg-opacity-25 text-white px-4 py-3 rounded mb-4" role="alert">
          <p className="font-bold">Demande envoyée</p>
          <p className="text-sm">
            Si un compte est associé à l&apos;adresse <span className="font-semibold">{email}</span>, 
            vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
          </p>
          <p className="mt-4 text-center">
            <Link href="/connexion" className="text-[#10B981] hover:text-[#34D399] font-medium">
              Retour à la connexion
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
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
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
                onChange={(e) => setEmail(e.target.value)}
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
                'Envoyer le lien de réinitialisation'
              )}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-[#BEC3CA]">
              <Link href="/connexion" className="text-[#10B981] hover:text-[#34D399] font-medium">
                Retour à la connexion
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
