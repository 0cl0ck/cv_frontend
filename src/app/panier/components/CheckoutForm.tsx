import React from 'react';
import Link from 'next/link';
import { CustomerInfo, FormErrors } from '../types';

interface Props {
  customerInfo: CustomerInfo;
  errors: FormErrors;
  onChange: (field: keyof CustomerInfo, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  isAuthenticated: boolean;
}

export default function CheckoutForm({ customerInfo, errors, onChange, onSubmit, isSubmitting, isAuthenticated }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h3 className="font-medium text-lg text-[#F4F8F5]">Informations de contact</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(['firstName','lastName'] as const).map(field => (
          <div key={field}>
            <label className="block text-sm mb-1 text-[#F4F8F5]">{field === 'firstName' ? 'Prénom' : 'Nom'}</label>
            <input
              type="text"
              value={customerInfo[field]}
              onChange={e => onChange(field, e.target.value)}
              className={`w-full p-2 border rounded ${errors[field] ? 'border-red-500' : 'border-[#3A4A4F]'} bg-[#002935] text-[#F4F8F5] focus:outline-none focus:ring-2 focus:ring-[#EFC368] focus:border-transparent`}
            />
            {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
          </div>
        ))}
      </div>
      {(['email','phone','address','postalCode','city'] as const).map(field => (
        <div key={field}>
          <label className="block text-sm mb-1 text-[#F4F8F5]">
            {field === 'postalCode' ? 'Code Postal' : field === 'address' ? 'Adresse' : field === 'city' ? 'Ville' : field === 'phone' ? 'Téléphone' : 'Email'}
            {isAuthenticated && field === 'email' && (
              <span className="ml-2 text-xs text-[#EFC368]">(email du compte)</span>
            )}
          </label>
          <input
            type={field === 'email' ? 'email' : 'text'}
            value={customerInfo[field]}
            onChange={e => onChange(field, e.target.value)}
            disabled={isAuthenticated && field === 'email'}
            className={`w-full p-2 border rounded ${errors[field] ? 'border-red-500' : 'border-[#3A4A4F]'} bg-[#002935] text-[#F4F8F5] focus:outline-none focus:ring-2 focus:ring-[#EFC368] focus:border-transparent ${isAuthenticated && field === 'email' ? 'opacity-70 cursor-not-allowed' : ''}`}
          />
          {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
          {isAuthenticated && field === 'email' && (
            <p className="text-xs text-[#EFC368] mt-1">
              L'email de votre compte sera utilisé pour la fidélité. Vous pouvez utiliser un autre email pour les notifications en nous contactant.
            </p>
          )}
        </div>
      ))}
      <div>
        <label className="block text-sm mb-1 text-[#F4F8F5]">Complément d’adresse <span className="text-neutral-500 text-xs">(optionnel)</span></label>
        <input
          type="text"
          value={customerInfo.addressLine2}
          onChange={e => onChange('addressLine2', e.target.value)}
          className="w-full p-2 border rounded border-[#3A4A4F] bg-[#002935] text-[#F4F8F5] focus:outline-none focus:ring-2 focus:ring-[#EFC368] focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm mb-1 text-[#F4F8F5]">Pays</label>
        <select
          value={customerInfo.country}
          onChange={e => onChange('country', e.target.value)}
          className="w-full p-2 border rounded border-[#3A4A4F] bg-[#002935] text-[#F4F8F5] focus:outline-none focus:ring-2 focus:ring-[#EFC368]"
        >
          <option>France</option>
          <option>Belgique</option>
          <option>Suisse</option>
          <option>Luxembourg</option>
        </select>
      </div>

      <p className="text-xs text-[#F4F8F5]">
        En passant commande, vous acceptez nos{' '}
        <Link href="/conditions-generales" className="text-[#03745C] hover:underline">CGV</Link> et notre{' '}
        <Link href="/confidentialite" className="text-[#03745C] hover:underline">politique de confidentialité</Link>.
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#EFC368] hover:bg-[#D3A74F] text-[#001E27] py-3 rounded-md disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EFC368]"
      >
        {isSubmitting ? 'Traitement en cours...' : 'Finaliser le paiement'}
      </button>
    </form>
  );
}
