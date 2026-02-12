'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

// ---------------------------------------------------------------------------
// Validation côté client (miroir de auth.schema.ts backend)
// ---------------------------------------------------------------------------
type FieldErrors = Record<string, string>;

function validateForm(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gdprConsent: { termsAccepted: boolean; privacyAccepted: boolean };
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!data.firstName.trim()) {
    errors.firstName = 'Le prénom est requis';
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = 'Le prénom doit contenir au moins 2 caractères';
  }

  if (!data.lastName.trim()) {
    errors.lastName = 'Le nom est requis';
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = 'Le nom doit contenir au moins 2 caractères';
  }

  if (!data.email.trim()) {
    errors.email = 'L\'email est requis';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email invalide';
  }

  if (!data.password) {
    errors.password = 'Le mot de passe est requis';
  } else {
    if (data.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/[A-Z]/.test(data.password)) {
      errors.password = 'Le mot de passe doit contenir au moins une majuscule';
    } else if (!/[0-9]/.test(data.password)) {
      errors.password = 'Le mot de passe doit contenir au moins un chiffre';
    }
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'La confirmation du mot de passe est requise';
  } else if (data.password && data.confirmPassword !== data.password) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas';
  }

  if (!data.gdprConsent.termsAccepted) {
    errors.termsAccepted = 'Vous devez accepter les conditions générales';
  }
  if (!data.gdprConsent.privacyAccepted) {
    errors.privacyAccepted = 'Vous devez accepter la politique de confidentialité';
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Extraction d'erreurs depuis la réponse structurée du backend
// Format attendu: { error: { type, message, details: { fields: { field: [msg] } } } }
// ---------------------------------------------------------------------------
function extractBackendErrors(data: Record<string, unknown>): {
  fieldErrors: FieldErrors;
  globalError: string;
} {
  const fieldErrors: FieldErrors = {};
  let globalError = '';

  const error = data.error as Record<string, unknown> | string | undefined;

  if (typeof error === 'string') {
    globalError = error;
  } else if (error && typeof error === 'object') {
    globalError = (error.message as string) || 'Erreur lors de l\'inscription';

    const details = error.details as Record<string, unknown> | undefined;
    const fields = details?.fields as Record<string, string[]> | undefined;

    if (fields && typeof fields === 'object') {
      for (const [key, messages] of Object.entries(fields)) {
        const msg = Array.isArray(messages) ? messages[0] : messages;
        if (typeof msg === 'string') {
          // Map backend field paths (e.g. "gdprConsent.termsAccepted") to form field names
          const fieldKey = key.includes('.') ? key.split('.').pop()! : key;
          fieldErrors[fieldKey] = msg;
        }
      }
      // If we have per-field errors, clear the global one (the fields are more useful)
      if (Object.keys(fieldErrors).length > 0) {
        globalError = '';
      }
    }
  } else if (data.message && typeof data.message === 'string') {
    globalError = data.message;
  } else {
    globalError = 'Erreur lors de l\'inscription';
  }

  return { fieldErrors, globalError };
}

// ---------------------------------------------------------------------------
// Composant d'erreur inline pour un champ
// ---------------------------------------------------------------------------
function FieldError({ error, id }: { error?: string; id?: string }) {
  if (!error) return null;
  return (
    <p className="mt-1 text-xs text-red-400" role="alert" id={id}>
      {error}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Input wrapper avec border d'erreur
// ---------------------------------------------------------------------------
function inputClass(hasError: boolean): string {
  const base = 'w-full px-3 py-2 bg-[#00424A] border rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors';
  return hasError
    ? `${base} border-red-500 focus:ring-red-500`
    : `${base} border-[#155757] focus:ring-[#10B981]`;
}

// Formulaire d'inscription
function RegisterForm() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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

  // Clear field error when user types
  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

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
    
    // Clear field error on change
    clearFieldError(name);
    
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
    
    // Validation côté client
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGlobalError('');
      return;
    }
    
    setIsLoading(true);
    setGlobalError('');
    setFieldErrors({});

    try {
      // If referral code provided, validate & set cookie before registering
      if (formData.referralCode) {
        const ok = await validateReferral(formData.referralCode);
        if (!ok) {
          setGlobalError('Code parrainage invalide. Veuillez vérifier le code.');
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
        const { fieldErrors: backendFieldErrors, globalError: backendGlobalError } = extractBackendErrors(data);
        setFieldErrors(backendFieldErrors);
        setGlobalError(backendGlobalError);
        setIsLoading(false);
        return;
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
        }
      } catch {}

      // Afficher un message de succès et proposer un CTA vers /compte
      setSuccess('Votre compte a été créé avec succès.');
      setShowModal(true);
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Une erreur est survenue');
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
      
      {globalError && (
        <div className="bg-red-900 bg-opacity-25 text-red-300 px-4 py-3 rounded mb-4" role="alert" data-testid="global-error">
          <span className="block sm:inline">{globalError}</span>
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

      <form onSubmit={handleSubmit} noValidate>
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
              className={inputClass(!!fieldErrors.firstName)}
              aria-invalid={!!fieldErrors.firstName}
              aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
              required
            />
            <FieldError error={fieldErrors.firstName} id="firstName-error" />
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
              className={inputClass(!!fieldErrors.lastName)}
              aria-invalid={!!fieldErrors.lastName}
              aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
              required
            />
            <FieldError error={fieldErrors.lastName} id="lastName-error" />
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
            className={inputClass(!!fieldErrors.email)}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            required
          />
          <FieldError error={fieldErrors.email} id="email-error" />
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
            className={inputClass(!!fieldErrors.password)}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? 'password-error' : 'password-hint'}
            required
            minLength={8}
          />
          {fieldErrors.password ? (
            <FieldError error={fieldErrors.password} id="password-error" />
          ) : (
            <p className="mt-1 text-xs text-[#8B93A0]" id="password-hint">
              8 caractères minimum, incluant une majuscule et un chiffre
            </p>
          )}
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
            className={inputClass(!!fieldErrors.confirmPassword)}
            aria-invalid={!!fieldErrors.confirmPassword}
            aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
            required
          />
          <FieldError error={fieldErrors.confirmPassword} id="confirmPassword-error" />
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
              className={`mt-1 h-4 w-4 focus:ring-[#10B981] bg-[#00424A] rounded ${fieldErrors.termsAccepted ? 'border-red-500 text-red-500' : 'border-[#155757] text-[#10B981]'}`}
              required
            />
            <div className="ml-2">
              <label htmlFor="termsAccepted" className="block text-sm text-[#BEC3CA]">
                J&apos;accepte les <Link href="/conditions-generales" className="text-[#10B981] hover:text-[#34D399]">conditions générales de vente</Link>
              </label>
              <FieldError error={fieldErrors.termsAccepted} id="termsAccepted-error" />
            </div>
          </div>
          
          <div className="flex items-start">
            <input
              type="checkbox"
              id="privacyAccepted"
              name="privacyAccepted"
              checked={formData.gdprConsent.privacyAccepted}
              onChange={handleChange}
              className={`mt-1 h-4 w-4 focus:ring-[#10B981] bg-[#00424A] rounded ${fieldErrors.privacyAccepted ? 'border-red-500 text-red-500' : 'border-[#155757] text-[#10B981]'}`}
              required
            />
            <div className="ml-2">
              <label htmlFor="privacyAccepted" className="block text-sm text-[#BEC3CA]">
                J&apos;accepte la <Link href="/politique-confidentialite" className="text-[#10B981] hover:text-[#34D399]">politique de confidentialité</Link>
              </label>
              <FieldError error={fieldErrors.privacyAccepted} id="privacyAccepted-error" />
            </div>
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
          S&apos;inscrire avec Google
        </a>
      </div>
      
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
