'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { fetchWithCsrf } from '@/lib/security/csrf';
import { useAuthContext } from '@/context/AuthContext';
import { secureLogger as logger } from '@/utils/logger';

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
  
  // Utiliser le contexte d'authentification global
  const { isAuthenticated, loading: authLoading } = useAuthContext();

  // Protection contre les boucles de redirection
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const MAX_REDIRECT_ATTEMPTS = 3;

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    // Ne rien faire si la vérification d'authentification est en cours
    if (authLoading) return;
    
    // Protection contre les boucles : limiter le nombre de tentatives de redirection
    if (redirectAttempts >= MAX_REDIRECT_ATTEMPTS) {
      logger.warn('[LoginPage] Trop de tentatives de redirection, possible boucle détectée');
      setError('Problème de redirection détecté. Veuillez essayer de vous reconnecter ou accéder manuellement à votre compte.');
      return;
    }
    
    // Si l'utilisateur est authentifié, le rediriger vers la page compte
    if (isAuthenticated) {
      logger.info('[LoginPage] Utilisateur déjà authentifié, redirection vers /compte');
      const redirectPath = searchParams.get('redirect') || '/compte';
      
      // Éviter la boucle de redirection en vérifiant que nous ne sommes pas déjà en train de rediriger
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        setRedirectAttempts(prev => prev + 1);
        router.replace(redirectPath);
      }
    }
  }, [isAuthenticated, authLoading, router, searchParams, redirectAttempts]);
  
  // Vérifier les paramètres d'URL pour les messages
  useEffect(() => {
    // Vérification d'email réussie
    if (searchParams.get('verified') === 'true') {
      setSuccess('Votre compte a été vérifié avec succès. Vous pouvez maintenant vous connecter.');
    }
    
    // Inscription réussie
    if (searchParams.get('registered') === 'true') {
      setSuccess('Votre compte a été créé avec succès.');
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
      logger.debug('[Login Debug] Tentative de connexion avec fetchWithCsrf');
      
      // Utiliser fetchWithCsrf au lieu de fetch standard pour inclure l'en-tête CSRF
      const data = await fetchWithCsrf<{ error?: string, message?: string }>('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          collection: 'customers'
        })
      });

      if (data && data.error) {
        throw new Error(data.error || 'Erreur de connexion');
      }

      logger.debug('[Login Debug] Connexion réussie');
      // Connexion réussie, rediriger vers le tableau de bord client
      
      // Déclencher un événement personnalisé pour informer le Header et autres composants
      const loginEvent = new CustomEvent('login-status-change', { detail: { isLoggedIn: true } });
      window.dispatchEvent(loginEvent);
      
      // Également déclencher notre événement personnalisé auth-change pour le contexte
      const authChangeEvent = new Event('auth-change');
      window.dispatchEvent(authChangeEvent);
      
      // Ajouter une entrée dans localStorage pour déclencher l'événement storage
      localStorage.setItem('auth-token', 'true');
      localStorage.setItem('auth-status', Date.now().toString());
      
      // Récupérer la redirection si présente dans l'URL
      const redirectPath = searchParams.get('redirect') || '/compte';
      router.push(redirectPath);
      router.refresh(); // Pour rafraîchir les données de session
    } catch (err: unknown) {
      console.error('[Login Debug] Erreur de connexion:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757]">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">Connexion</h1>
      
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
          className="w-full bg-[#007A72] hover:bg-[#059669] text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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
        
        {/* Bouton de diagnostic en cas de problème de boucle */}
        {redirectAttempts > 0 && (
          <div className="mt-4 p-3 bg-yellow-900 bg-opacity-25 border border-yellow-600 rounded">
            <p className="text-sm text-yellow-300 mb-2">
              Problème de redirection détecté ({redirectAttempts}/{MAX_REDIRECT_ATTEMPTS})
            </p>
            <div className="space-y-2">
              <Link 
                href="/compte" 
                className="block text-sm text-[#10B981] hover:text-[#34D399] font-medium"
              >
                Accéder manuellement au compte →
              </Link>
              <Link 
                href="/api/auth/debug" 
                target="_blank"
                className="block text-sm text-blue-300 hover:text-blue-200 font-medium"
              >
                Diagnostic technique ↗
              </Link>
            </div>
          </div>
        )}
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
