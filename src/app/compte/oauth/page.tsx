'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

/**
 * OAuth Callback Page
 * 
 * This page handles the OAuth token exchange for cross-domain authentication.
 * It's a client-only page that:
 * 1. Reads oauth_token from URL
 * 2. Exchanges it for a session via the backend
 * 3. Redirects to /compte on success
 */
export default function OAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshAuth } = useAuthContext();
  const [status, setStatus] = useState<'exchanging' | 'success' | 'error'>('exchanging');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oauthToken = searchParams.get('oauth_token');
    
    if (!oauthToken) {
      setStatus('error');
      setError('Token OAuth manquant');
      return;
    }

    const exchangeToken = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/api/auth/oauth-exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ token: oauthToken }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de l\'authentification');
        }

        setStatus('success');
        
        // Refresh auth context
        await refreshAuth();
        
        // Dispatch auth change events
        window.dispatchEvent(new CustomEvent('login-status-change', { detail: { isLoggedIn: true } }));
        window.dispatchEvent(new Event('auth-change'));
        
        // Redirect to account page
        setTimeout(() => {
          router.push('/compte');
          router.refresh();
        }, 500);
      } catch (err) {
        console.error('OAuth exchange error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      }
    };

    exchangeToken();
  }, [searchParams, router, refreshAuth]);

  if (status === 'exchanging') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001A1F]">
        <div className="bg-[#002930] rounded-lg p-8 text-center shadow-xl border border-[#155757]">
          <Loader2 className="w-12 h-12 animate-spin text-[#10B981] mx-auto mb-4" />
          <p className="text-white text-lg">Connexion avec Google en cours...</p>
          <p className="text-[#BEC3CA] text-sm mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001A1F] px-4">
        <div className="bg-[#002930] rounded-lg p-8 text-center shadow-xl border border-[#155757] max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <p className="text-white text-lg mb-2">Erreur de connexion</p>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={() => router.push('/connexion')}
            className="bg-[#007A72] hover:bg-[#059669] text-white px-6 py-2 rounded-md"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  // Success state - brief message before redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001A1F]">
      <div className="bg-[#002930] rounded-lg p-8 text-center shadow-xl border border-[#155757]">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✓</span>
        </div>
        <p className="text-white text-lg">Connexion réussie !</p>
        <p className="text-[#BEC3CA] text-sm mt-2">Redirection...</p>
      </div>
    </div>
  );
}
