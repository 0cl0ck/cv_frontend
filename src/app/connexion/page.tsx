'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Formulaire de connexion
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Vérifier les paramètres d'URL pour les messages
  useEffect(() => {
    // Vérification d'email réussie
    if (searchParams.get('verified') === 'true') {
      setSuccess('Votre compte a été vérifié avec succès. Vous pouvez maintenant vous connecter.');
    }
    
    // Inscription réussie
    if (searchParams.get('registered') === 'true') {
      setSuccess('Votre compte a été créé avec succès. Veuillez vérifier votre email pour activer votre compte.');
    }
    
    // Erreurs de vérification
    const errorType = searchParams.get('error');
    if (errorType) {
      switch (errorType) {
        case 'token_manquant':
          setError('Le lien de vérification est invalide. Veuillez réessayer.');
          break;
        case 'verification_failed':
          setError(searchParams.get('message') || 'La vérification a échoué. Le lien est peut-être expiré.');
          break;
        case 'erreur_systeme':
          setError('Une erreur système est survenue. Veuillez réessayer plus tard.');
          break;
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');



    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          collection: 'customers'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      // Connexion réussie, rediriger vers le tableau de bord client
      router.push('/compte');
      router.refresh(); // Pour rafraîchir les données de session
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757]">
      <h1 className="text-2xl font-bold mb-6 text-center text-[#D1D5DB]">Connexion</h1>
      
      {error && (
        <div className="bg-red-900 bg-opacity-25 text-red-300 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 bg-opacity-25 text-[#10B981] px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-[#BEC3CA] mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-[#BEC3CA] mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#007A72] hover:bg-[#059669] text-[#D1D5DB] font-medium py-2 px-4 rounded-md focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 size={20} className="animate-spin mr-2" />
              Connexion en cours...
            </span>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-[#BEC3CA]">
          Vous n&apos;avez pas de compte ?
          <Link href="/inscription" className="ml-1 text-[#10B981] hover:text-[#34D399] font-medium">
            Créer un compte
          </Link>
        </p>
        <p className="text-sm text-[#BEC3CA] mt-2">
          <Link href="/mot-de-passe-oublie" className="text-[#10B981] hover:text-[#34D399] font-medium">
            Mot de passe oublié ?
          </Link>
        </p>
      </div>
    </div>
  );
}

// Composant de chargement pour Suspense
function LoginFormLoading() {
  return (
    <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 text-center border border-[#155757]">
      <Loader2 size={40} className="inline-block animate-spin text-[#10B981]" />
      <p className="mt-4 text-[#BEC3CA]">Chargement...</p>
    </div>
  );
}

// Main page component
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001A1F] px-4">
      <Suspense fallback={<LoginFormLoading />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
