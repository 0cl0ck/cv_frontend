'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
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
  const { isAuthenticated, user, loading: authLoading } = useAuthContext(); // Récupérer l'objet user

  // Redirection simple si utilisateur déjà authentifié
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) { // Vérifier aussi la présence de user
      // Rediriger vers /compte uniquement si l'utilisateur est de la collection 'customers'
      if (user.collection === 'customers') {
        const redirectPath = searchParams.get('redirect') || '/compte';
        router.replace(redirectPath);
      } else {
        // Optionnel : rediriger les non-clients ailleurs ou afficher un message
        // Par exemple, rediriger les admins vers un dashboard admin
        // if (user.collection === 'admins') {
        //   router.replace('/admin');
        // } else {
        //   // Pour les autres types d'utilisateurs ou si la collection n'est pas 'customers'
        //   // On pourrait choisir de ne pas rediriger ou de rediriger vers la page d'accueil
        //   // ou afficher un message "Vous êtes connecté mais pas en tant que client"
        //   logger.warn(`[Login Page] Utilisateur authentifié mais non client (collection: ${user.collection}). Redirection vers /compte annulée.`);
        // }
        // Pour l'instant, pour stopper la boucle, on ne redirige pas si ce n'est pas un customer.
        // Vous pourrez affiner cette logique plus tard.
        logger.info(`[Login Page] Utilisateur ${user.email} (collection: ${user.collection}) authentifié, mais pas un client. Redirection vers /compte bloquée.`);
      }
    }
  }, [isAuthenticated, user, authLoading, router, searchParams]);

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
      type LoginResponse = { error?: string | { message?: string }; message?: string; token?: string; exp?: number }
      const response = await httpClient.post<LoginResponse>('/auth/login', {
        email: formData.email,
        password: formData.password,
        collection: 'customers'
      }, { withCsrf: true });
      
      const data = response.data;

      if (data?.error) {
        const errField = data.error;
        const msg = typeof errField === 'string'
          ? errField
          : (errField?.message || data.message || 'Erreur de connexion');
        throw new Error(msg);
      }

      logger.debug('[Login Debug] Connexion réussie');
      
      // Déclencher un événement personnalisé pour informer le Header et autres composants
      const loginEvent = new CustomEvent('login-status-change', { detail: { isLoggedIn: true } });
      window.dispatchEvent(loginEvent);
      
      // Également déclencher notre événement personnalisé auth-change pour le contexte
      const authChangeEvent = new Event('auth-change');
      window.dispatchEvent(authChangeEvent);
      
      // Récupérer la redirection si présente dans l'URL
      const redirectPath = searchParams.get('redirect') || '/compte';
      router.push(redirectPath);
      router.refresh(); // Pour rafraîchir les données de session
      } catch (err: unknown) {
        console.error('[Login Debug] Erreur de connexion:', err);
        let message = 'Une erreur est survenue lors de la connexion.';
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          type ErrorData = { error?: string | { message?: string }; message?: string }
          const data = err.response?.data as ErrorData | undefined;
          if (status === 401) {
            message = 'Email ou mot de passe incorrect.';
          } else if (data?.error) {
            message = typeof data.error === 'string' ? data.error : (data.error.message || data.message || message);
          } else if (data?.message) {
          message = data.message;
        } else if (err.message) {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message || message;
      }
      setError(message);
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
      
      {/* Google OAuth */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#155757]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#002930] text-[#BEC3CA]">ou</span>
          </div>
        </div>
        
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/api/customers/oauth/google`}
          className="mt-4 w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2.5 px-4 rounded-md transition-colors border border-gray-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google
        </a>
      </div>
      
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
