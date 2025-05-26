'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { httpClient } from '@/lib/httpClient';
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

  // Stockage local pour suivre les tentatives de redirection
  const redirectAttemptKey = 'loginRedirectAttempts';
  const redirectTimestampKey = 'loginRedirectTimestamp';
  const MAX_REDIRECT_ATTEMPTS = 3;
  const REDIRECT_RESET_TIME = 30 * 60 * 1000; // 30 minutes en millisecondes
  
  // Récupérer l'état depuis sessionStorage au chargement de la page
  const [redirectState, setRedirectState] = useState<{
    attempts: number;
    timestamp: number;
    showError: boolean;
  }>({ attempts: 0, timestamp: 0, showError: false });

  // Initialiser l'état depuis sessionStorage
  useEffect(() => {
    try {
      const storedAttempts = sessionStorage.getItem(redirectAttemptKey);
      const storedTimestamp = sessionStorage.getItem(redirectTimestampKey);
      
      if (storedAttempts && storedTimestamp) {
        const attempts = parseInt(storedAttempts, 10);
        const timestamp = parseInt(storedTimestamp, 10);
        const now = Date.now();
        
        // Réinitialiser si trop ancien
        if (now - timestamp > REDIRECT_RESET_TIME) {
          sessionStorage.setItem(redirectAttemptKey, '0');
          sessionStorage.setItem(redirectTimestampKey, now.toString());
          setRedirectState({ attempts: 0, timestamp: now, showError: false });
        } else {
          const showError = attempts >= MAX_REDIRECT_ATTEMPTS;
          setRedirectState({ attempts, timestamp, showError });
          
          if (showError) {
            logger.warn('[LoginPage] Trop de tentatives de redirection, possible boucle détectée');
            setError('Problème de redirection détecté. Veuillez essayer de vous reconnecter ou accéder manuellement à votre compte.');
          }
        }
      } else {
        // Première visite
        const now = Date.now();
        sessionStorage.setItem(redirectAttemptKey, '0');
        sessionStorage.setItem(redirectTimestampKey, now.toString());
        setRedirectState({ attempts: 0, timestamp: now, showError: false });
      }
    } catch (e) {
      // Ignorer les erreurs de sessionStorage (mode privé, etc.)
      console.error('Erreur lors de l\'accès à sessionStorage:', e);
    }
  }, [REDIRECT_RESET_TIME]);

  // Gérer la redirection si l'utilisateur est authentifié
  useEffect(() => {
    // Ne rien faire si les cas suivants :
    if (authLoading || // Chargement en cours
        redirectState.showError || // Erreur déjà affichée
        !isAuthenticated) { // Non authentifié
      return;
    }
    
    // Récupérer les paramètres d'URL
    const reason = searchParams.get('reason');
    const status = searchParams.get('status');
    
    // Si nous sommes redirigés depuis /compte avec une erreur d'auth, ne pas rediriger à nouveau
    if (reason === 'auth-failed' || reason === 'no-token') {
      logger.warn(`[LoginPage] Redirection bloquée : échec d'authentification détecté (${status || 'unknown'})`);
      setError(`L'authentification a échoué côté serveur. Veuillez vous reconnecter. ${status ? `(Code: ${status})` : ''}`);
      return;
    }
    
    // Vérifier le chemin actuel pour éviter les redirections inutiles
    const redirectPath = searchParams.get('redirect') || '/compte';
    const currentPath = window.location.pathname;
    
    if (currentPath !== redirectPath) {
      try {
        // Incrémenter le compteur d'essais
        const newAttempts = redirectState.attempts + 1;
        const now = Date.now();
        
        sessionStorage.setItem(redirectAttemptKey, newAttempts.toString());
        sessionStorage.setItem(redirectTimestampKey, now.toString());
        
        if (newAttempts >= MAX_REDIRECT_ATTEMPTS) {
          logger.warn('[LoginPage] Trop de tentatives de redirection, possible boucle détectée');
          setError('Problème de redirection détecté. Veuillez essayer de vous reconnecter ou accéder manuellement à votre compte.');
          setRedirectState(prev => ({ ...prev, attempts: newAttempts, showError: true }));
        } else {
          logger.info(`[LoginPage] Utilisateur authentifié, redirection vers ${redirectPath} (tentative ${newAttempts}/${MAX_REDIRECT_ATTEMPTS})`);
          setRedirectState(prev => ({ ...prev, attempts: newAttempts }));
          router.replace(redirectPath);
        }
      } catch (e) {
        console.error('Erreur lors de la mise à jour des tentatives:', e);
      }
    }
  }, [isAuthenticated, authLoading, router, searchParams, redirectState.attempts, redirectState.showError]);
  
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
      logger.debug('[Login Debug] Tentative de connexion avec httpClient');
      
      // Utiliser httpClient au lieu de fetch standard pour éviter les problèmes CORS
      const response = await httpClient.post<{ error?: string, message?: string }>('/auth/login', {
        email: formData.email,
        password: formData.password,
        collection: 'customers'
      }, { withCsrf: true });
      
      const data = response.data;

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
        {redirectState.attempts > 0 && (
          <div className="mt-4 p-3 bg-yellow-900 bg-opacity-25 border border-yellow-600 rounded">
            <p className="text-sm text-yellow-300 mb-2">
              Problème de redirection détecté ({redirectState.attempts}/{MAX_REDIRECT_ATTEMPTS})
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
