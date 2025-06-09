import React from 'react';
import Link from 'next/link';
import { CustomerInfo, FormErrors, PaymentMethod } from '../types';

interface Props {
  customerInfo: CustomerInfo;
  errors: FormErrors;
  onChange: (field: keyof CustomerInfo, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  isAuthenticated: boolean;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
}

export default function CheckoutForm({ 
  customerInfo, 
  errors, 
  onChange, 
  onSubmit, 
  isSubmitting, 
  isAuthenticated,
  paymentMethod,
  onPaymentMethodChange
}: Props) {
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
              L&#39;email de votre compte sera automatiquement utilisé pour la fidélité. Vous pouvez utiliser un autre email pour les notifications en nous contactant.
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

      {/* Choix de la méthode de paiement */}
      <div className="mt-8 mb-6">
        <h3 className="font-medium text-lg text-[#F4F8F5] mb-3">Méthode de paiement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div 
            className={`p-4 border rounded cursor-pointer ${
              paymentMethod === 'card' 
                ? 'border-[#EFC368] bg-[#002935]/70' 
                : 'border-[#3A4A4F] bg-[#002935]/30'
            } transition-colors`}
            onClick={() => onPaymentMethodChange('card')}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border ${
                paymentMethod === 'card' ? 'border-[#EFC368]' : 'border-[#3A4A4F]'
              } mr-3 flex items-center justify-center`}>
                {paymentMethod === 'card' && <div className="w-3 h-3 rounded-full bg-[#EFC368]"></div>}
              </div>
              <div>
                <p className="font-medium text-[#F4F8F5]">Carte bancaire</p>
                <p className="text-xs text-[#F4F8F5]/70">Paiement sécurisé immédiat via VivaWallet</p>
              </div>
            </div>
          </div>
          
          <div 
            className={`p-4 border rounded cursor-pointer ${
              paymentMethod === 'bank_transfer' 
                ? 'border-[#EFC368] bg-[#002935]/70' 
                : 'border-[#3A4A4F] bg-[#002935]/30'
            } transition-colors`}
            onClick={() => onPaymentMethodChange('bank_transfer')}
          >
            <div className="flex items-center">
              <div className={`w-5 h-5 rounded-full border ${
                paymentMethod === 'bank_transfer' ? 'border-[#EFC368]' : 'border-[#3A4A4F]'
              } mr-3 flex items-center justify-center`}>
                {paymentMethod === 'bank_transfer' && <div className="w-3 h-3 rounded-full bg-[#EFC368]"></div>}
              </div>
              <div>
                <p className="font-medium text-[#F4F8F5]">Virement bancaire</p>
                <p className="text-xs text-[#F4F8F5]/70">Paiement manuel sur notre compte bancaire</p>
              </div>
            </div>
          </div>
        </div>
        
        {paymentMethod === 'bank_transfer' && (
          <div className="mt-3 p-3 bg-[#002935]/50 border border-[#3A4A4F] rounded">
            <p className="text-sm text-[#F4F8F5]">
              <strong>Comment ça marche :</strong> Après validation de votre commande, vous recevrez nos coordonnées 
              bancaires et une référence à indiquer pour votre virement. Votre commande ne sera expédiée qu&apos;après réception 
              et vérification de votre paiement.
            </p>
          </div>
        )}
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
        {isSubmitting ? 'Traitement en cours...' : paymentMethod === 'bank_transfer' ? 'Valider la commande' : 'Procéder au paiement'}
      </button>
    </form>
  );
}
