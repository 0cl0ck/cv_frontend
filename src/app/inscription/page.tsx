'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

// Formulaire d'inscription
function RegisterForm() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    gdprConsent: {
      termsAccepted: false,
      privacyAccepted: false,
    }
  });

  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect');
  const [referralValid, setReferralValid] = useState<null | boolean>(null);

  // Validate and track referral code (sets HttpOnly cookie if valid)
  const validateReferral = async (code: string): Promise<boolean> => {
    const c = (code || '').trim();
    if (!c) {
      setReferralValid(null);
      return true; // nothing to validate
    }
    try {
      const res = await fetch(`/api/referral/track?code=${encodeURIComponent(c)}`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data && (data.valid === true || data.success === true)) {
        const isValid = data.valid !== false; // default true when not provided
        setReferralValid(isValid);
        return isValid;
      }
      setReferralValid(false);
      return false;
    } catch {
      // On network error, don't block registration but mark unknown
      setReferralValid(null);
      return true;
    }
  };

  // Prefill from URL (?ref=..., ?code=..., ?parrain=...)
  useEffect(() => {
    const q = searchParams?.get('ref') || searchParams?.get('code') || searchParams?.get('parrain') || '';
    if (q) {
      setFormData(prev => ({ ...prev, referralCode: q }));
      // Validate asynchronously; no need to block UI
      validateReferral(q).catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated || hasRedirected) {
      return;
    }

    const safeRedirect = redirectParam && redirectParam.startsWith('/') ? redirectParam : null;
    const destination = safeRedirect ?? (user?.collection === 'customers' ? '/compte' : '/');
    setHasRedirected(true);
    router.replace(destination);
    router.refresh();
  }, [authLoading, hasRedirected, isAuthenticated, redirectParam, router, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'termsAccepted' || name === 'privacyAccepted') {
        setFormData(prev => ({
          ...prev,
          gdprConsent: {
            ...prev.gdprConsent,
            [name]: checked
          }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation de base
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (!formData.gdprConsent.termsAccepted || !formData.gdprConsent.privacyAccepted) {
      setError('Vous devez accepter les conditions générales et la politique de confidentialité');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // If referral code provided, validate & set cookie before registering
      if (formData.referralCode) {
        const ok = await validateReferral(formData.referralCode);
        if (!ok) {
          setError('Code parrainage invalide. Veuillez verifier le code.');
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          gdprConsent: formData.gdprConsent,
          // Not used by backend today, but harmless to include
          referralCode: formData.referralCode || undefined,
        }),
        withCsrf: true
      });

      const data = await response.json();

      if (!response.ok) {
        let message = 'Erreur lors de l\'inscription';
        if (data?.error) {
          message = typeof data.error === 'string' ? data.error : (data.error?.message || data.message || message);
          // Essayer d\'extraire une erreur de champ s\'il y en a
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

      // Inscription réussie: tenter une connexion locale via l'API front pour poser le cookie sur le bon domaine
      try {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password, collection: 'customers' })
        });
        if (loginRes.ok) {
          setLoggedIn(true);
          // Notifier le contexte d'auth et les composants (comme la page de login)
          window.dispatchEvent(new CustomEvent('login-status-change', { detail: { isLoggedIn: true } }));
          window.dispatchEvent(new Event('auth-change'));
          try {
            localStorage.setItem('auth-token', 'true');
            localStorage.setItem('auth-status', Date.now().toString());
          } catch {}
        }
      } catch {}

      // Afficher un message de succès et proposer un CTA vers /compte
      setSuccess('Votre compte a été créé avec succès.');
      setShowModal(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (!authLoading && isAuthenticated) {
    return (
      <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757] text-center">
        <Loader2 size={32} className="mx-auto mb-4 animate-spin text-[#10B981]" />
        <p className="text-[#BEC3CA]">Vous etes deja connecte. Redirection en cours...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757]">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">Créer un compte</h1>
      
      {error && (
        <div className="bg-red-900 bg-opacity-25 text-red-300 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* CTA déplacé en haut */}
      {success && (
        <div className="bg-green-900 bg-opacity-25 text-emerald-300 px-4 py-3 rounded mb-4" role="alert">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="block">{success} {loggedIn ? 'Vous pouvez accéder à votre espace.' : ''}</span>
            <button
              onClick={() => { router.push('/compte'); router.refresh(); }}
              className="self-start sm:self-auto bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-md"
            >
              Accéder à mon compte
            </button>
          </div>
        </div>
      )}

      {false && success && (
        <div className="bg-green-900 bg-opacity-25 text-emerald-300 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{success} {loggedIn ? 'Vous pouvez accéder à votre espace.' : ''}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-[#BEC3CA] mb-1">
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-[#BEC3CA] mb-1">
              Nom
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              required
            />
          </div>
        </div>
        
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
        
        <div className="mb-4">
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
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            required
          />
        </div>

        {/* Referral code (optional) */}
        <div className="mb-4">
          <label htmlFor="referralCode" className="block text-sm font-medium text-[#BEC3CA] mb-1">
            Code parrainage (optionnel)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="referralCode"
              name="referralCode"
              value={formData.referralCode}
              onChange={e => { setFormData(prev => ({ ...prev, referralCode: e.target.value })); setReferralValid(null) }}
              onBlur={() => validateReferral(formData.referralCode)}
              placeholder="ex: cv-prenom-nom-xxxxx"
              className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>
          {referralValid === false && (
            <p className="mt-1 text-xs text-red-300">Code parrainage invalide.</p>
          )}
          {referralValid === true && formData.referralCode && (
            <p className="mt-1 text-xs text-emerald-300">Code parrainage valide. La remise sera appliquee a votre premiere commande eligibile.</p>
          )}
          {referralValid === null && formData.referralCode && (
            <p className="mt-1 text-xs text-[#8B93A0]">Nous verifierons votre code au moment de l&#39;inscription.</p>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex items-start mb-2">
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              checked={formData.gdprConsent.termsAccepted}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-[#10B981] focus:ring-[#10B981] bg-[#00424A] border-[#155757] rounded"
              required
            />
            <label htmlFor="termsAccepted" className="ml-2 block text-sm text-[#BEC3CA]">
              J&apos;accepte les <Link href="/conditions-generales" className="text-[#10B981] hover:text-[#34D399]">conditions générales de vente</Link>
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              type="checkbox"
              id="privacyAccepted"
              name="privacyAccepted"
              checked={formData.gdprConsent.privacyAccepted}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-[#10B981] focus:ring-[#10B981] bg-[#00424A] border-[#155757] rounded"
              required
            />
            <label htmlFor="privacyAccepted" className="ml-2 block text-sm text-[#BEC3CA]">
              J&apos;accepte la <Link href="/politique-confidentialite" className="text-[#10B981] hover:text-[#34D399]">politique de confidentialité</Link>
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#007A72] hover:bg-[#059669] text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <Loader2 size={20} className="animate-spin mr-2" />
              Inscription en cours...
            </span>
          ) : (
            'Créer mon compte'
          )}
        </button>
      </form>

      {false && success && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => { router.push('/compte'); router.refresh(); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-md"
          >
            Accéder à mon compte
          </button>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-sm text-[#BEC3CA]">
          Vous avez déjà un compte ?
          <Link href="/connexion" className="ml-1 text-[#10B981] hover:text-[#34D399] font-medium">
            Se connecter
          </Link>
        </p>
      </div>
      {/* Success modal overlay */}
      <SuccessModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => { router.push('/compte'); router.refresh(); }}
        message={success}
        loggedIn={loggedIn}
      />
    </div>
  );
}

// Main page component
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001A1F] px-4">
      <Suspense fallback={<div className="text-[#D1D5DB]">Chargement...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}

// Lightweight modal component
function SuccessModal({
  open,
  onClose,
  onConfirm,
  message,
  loggedIn,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  loggedIn: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button aria-hidden className="absolute inset-0 bg-black/60" onClick={onClose} />
      {/* Dialog */}
      <div role="dialog" aria-modal="true" className="relative w-full max-w-md rounded-lg bg-[#002930] border border-[#155757] shadow-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Compte créé</h2>
        <p className="text-[#D1D5DB] mb-4">{message} {loggedIn ? 'Vous pouvez accéder à votre espace.' : ''}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-md">
            Accéder à mon compte
          </button>
          <button onClick={onClose} className="border border-[#155757] text-[#D1D5DB] hover:border-[#10B981] hover:text-white font-medium py-2 px-4 rounded-md">
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}

