'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = params;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Vérifier la validité du token au chargement de la page
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setIsTokenValid(true);
        } else {
          setError(data.error || 'Ce lien de réinitialisation n\'est plus valide ou a expiré.');
        }
      } catch {
        setError('Erreur lors de la vérification du lien. Veuillez réessayer.');
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError('Lien de réinitialisation invalide.');
      setIsVerifying(false);
    }
  }, [token]);

  const validatePassword = () => {
    // Réinitialiser l'erreur
    setPasswordError('');

    // Vérifier que le mot de passe est suffisamment fort
    if (password.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères.');
      return false;
    }

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
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
          collection: 'customers'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'INVALID_TOKEN') {
          setError('Ce lien de réinitialisation n\'est plus valide ou a expiré.');
        } else {
          throw new Error(data.error || 'Erreur lors de la réinitialisation du mot de passe');
        }
      } else {
        setSuccess(true);
        
        // Redirection automatique vers la page de connexion après 5 secondes
        setTimeout(() => {
          router.push('/connexion');
        }, 5000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher un indicateur de chargement pendant la vérification
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001A1F] px-4">
        <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757]">
          <div className="text-center">
            <Loader2 size={40} className="mx-auto mb-4 animate-spin text-[#10B981]" />
            <p className="text-[#BEC3CA]">Vérification du lien de réinitialisation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001A1F] px-4">
      <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757]">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Réinitialisation du mot de passe</h1>
        
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
            <p className="font-bold">Mot de passe mis à jour</p>
            <p className="text-sm">
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion dans quelques secondes.
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
                Veuillez choisir un nouveau mot de passe sécurisé pour votre compte.
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                    required
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-[#8B93A0]">
                    8 caractères minimum, incluant lettres, chiffres et caractères spéciaux
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                    required
                  />
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-300">{passwordError}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#007A72] hover:bg-[#059669] text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin mr-2" />
                      Réinitialisation en cours...
                    </span>
                  ) : (
                    'Réinitialiser mon mot de passe'
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
