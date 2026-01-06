'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

/**
 * OAuth Exchange Component
 * 
 * Detects oauth_token in URL params (from cross-domain OAuth redirect)
 * and exchanges it for a proper session cookie.
 */
export default function OAuthExchange() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshAuth } = useAuthContext();
  const [status, setStatus] = useState<'idle' | 'exchanging' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oauthToken = searchParams.get('oauth_token');
    
    if (!oauthToken) {
      return; // No token to exchange
    }

    const exchangeToken = async () => {
      setStatus('exchanging');
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/api/auth/oauth-exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important for cookie handling
          body: JSON.stringify({ token: oauthToken }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de l\'authentification');
        }

        setStatus('success');
        
        // Refresh auth context to pick up the new session
        await refreshAuth();
        
        // Dispatch auth change event
        window.dispatchEvent(new CustomEvent('login-status-change', { detail: { isLoggedIn: true } }));
        window.dispatchEvent(new Event('auth-change'));
        
        // Remove the token from URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('oauth_token');
        newUrl.searchParams.set('oauth', 'success');
        router.replace(newUrl.pathname + newUrl.search);
        
        // Refresh the page to show authenticated content
        router.refresh();
      } catch (err) {
        console.error('OAuth exchange error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      }
    };

    exchangeToken();
  }, [searchParams, router, refreshAuth]);

  // Show loading state while exchanging
  if (status === 'exchanging') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001A1F]/90">
        <div className="bg-[#002930] rounded-lg p-8 text-center shadow-xl border border-[#155757]">
          <Loader2 className="w-12 h-12 animate-spin text-[#10B981] mx-auto mb-4" />
          <p className="text-white text-lg">Connexion avec Google en cours...</p>
        </div>
      </div>
    );
  }

  // Show error if exchange failed
  if (status === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001A1F]/90">
        <div className="bg-[#002930] rounded-lg p-8 text-center shadow-xl border border-[#155757] max-w-md mx-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <p className="text-white text-lg mb-2">Erreur de connexion</p>
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={() => router.push('/connexion')}
            className="bg-[#007A72] hover:bg-[#059669] text-white px-6 py-2 rounded-md"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // No UI when idle or success (page will render normally)
  return null;
}
