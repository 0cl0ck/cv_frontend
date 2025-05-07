'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Composant qui utilise useSearchParams avec Suspense boundary
function VerifierEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification de votre adresse email...');

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus('error');
        setMessage('Lien de vérification invalide. Token manquant.');
        return;
      }

      try {
        // Appel à la bonne API d'authentification
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Votre adresse email a été vérifiée avec succès !');
          // Rediriger vers la page de connexion après 3 secondes
          setTimeout(() => {
            router.push('/connexion?verified=true');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Une erreur est survenue lors de la vérification.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Une erreur est survenue lors de la vérification. Veuillez réessayer plus tard.');
        console.error('Erreur de vérification:', error);
      }
    }

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001A1F] px-4">
      <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757] text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={60} className="animate-spin text-[#10B981] mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4 text-white">Vérification en cours</h1>
            <p className="text-[#BEC3CA]">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={60} className="text-[#10B981] mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4 text-white">Vérification réussie</h1>
            <p className="text-[#BEC3CA] mb-6">{message}</p>
            <p className="text-[#BEC3CA]">Vous allez être redirigé vers la page de connexion...</p>
            <div className="mt-6">
              <Link 
                href="/connexion" 
                className="bg-[#007A72] hover:bg-[#059669] text-white font-medium py-2 px-4 rounded-md focus:outline-none transition-colors"
              >
                Se connecter maintenant
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle size={60} className="text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4 text-white">Vérification échouée</h1>
            <p className="text-[#BEC3CA] mb-6">{message}</p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/connexion" 
                className="bg-[#007A72] hover:bg-[#059669] text-white font-medium py-2 px-4 rounded-md focus:outline-none transition-colors"
              >
                Se connecter
              </Link>
              <Link 
                href="/" 
                className="border border-[#155757] hover:border-[#10B981] text-[#BEC3CA] font-medium py-2 px-4 rounded-md focus:outline-none transition-colors"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Composant principal avec Suspense boundary
export default function VerifierEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#001A1F] px-4">
        <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757] text-center">
          <Loader2 size={60} className="animate-spin text-[#10B981] mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4 text-white">Chargement...</h1>
          <p className="text-[#BEC3CA]">Préparation de la vérification...</p>
        </div>
      </div>
    }>
      <VerifierEmailContent />
    </Suspense>
  );
}
