'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Formulaire d'inscription
function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      // Inscription réussie, rediriger vers la page de connexion
      router.push('/connexion?registered=true');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757]">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">Créer un compte</h1>
      
      {error && (
        <div className="bg-red-900 bg-opacity-25 text-red-300 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
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
      
      <div className="mt-4 text-center">
        <p className="text-sm text-[#BEC3CA]">
          Vous avez déjà un compte ?
          <Link href="/connexion" className="ml-1 text-[#10B981] hover:text-[#34D399] font-medium">
            Se connecter
          </Link>
        </p>
      </div>
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
