import React from 'react';
import Link from 'next/link';
import { formatPrice } from '@/utils/utils';
import { PriceService } from '@/utils/priceCalculations';
import { PromoResult, LoyaltyBenefits, Cart } from '../types';

interface Props {
  subtotal: number;
  shippingCost: number;
  promoResult: PromoResult;
  loyaltyBenefits: LoyaltyBenefits;
  isAuthenticated: boolean;
  onCheckout: () => void;
  checkoutMode: boolean;
  onBackToCart: () => void;
  onClearCart: () => void;
  country?: string; // Pays pour le calcul des frais de livraison
}

export default function OrderSummary({
  subtotal,
  shippingCost,
  promoResult,
  loyaltyBenefits,
  isAuthenticated,
  onCheckout,
  checkoutMode,
  onBackToCart,
  onClearCart,
  country = 'France'
}: Props) {
  // Créer un objet cart compatible avec PriceService
  const cartObj: Cart = { 
    subtotal, 
    subtotalCents: Math.round(subtotal * 100), 
    items: [],
    total: 0, // sera remplacé par le calcul
    totalCents: 0 // sera remplacé par le calcul
  };
  
  // Utiliser le service centralisé pour le calcul du total
  const priceDetails = PriceService.calculateTotalPrice(cartObj, country || 'France', loyaltyBenefits, promoResult);
  // Récupérer toutes les informations calculées par le service
  const {
    shippingCost: calculatedShipping,
    loyaltyDiscount,
    promoDiscount,
    total
  } = priceDetails;

  return (
    <div className="bg-[#002935] p-6 rounded-lg border border-[#3A4A4F]">
      <h2 className="text-xl font-bold mb-4 text-[#F4F8F5]">Récapitulatif</h2>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-[#F4F8F5]">Sous-total</span>
          <span className="text-[#F4F8F5]">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#F4F8F5]">Livraison</span>
          <span className="text-[#F4F8F5]">{calculatedShipping === 0 ? 'Gratuit' : formatPrice(calculatedShipping)}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-[#F4F8F5]">Code promo {promoResult.code && `(${promoResult.code})`}</span>
            <span className="text-[#10B981]">-{formatPrice(promoDiscount)}</span>
          </div>
        )}
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-[#F4F8F5]">Remise fidélité</span>
            <span className="text-[#10B981]">-{formatPrice(loyaltyDiscount)}</span>
          </div>
        )}
        {/* Afficher des infos sur les avantages si l'utilisateur est connecté */}
        {isAuthenticated && loyaltyBenefits.active && loyaltyBenefits.message && (
          <div className="mt-4 p-2 bg-[#003545] rounded text-[#F4F8F5] text-sm">
            {loyaltyBenefits.message}
          </div>
        )}
      </div>
      <div className="border-t border-[#3A4A4F] pt-3 flex justify-between">
        <span className="font-bold text-[#F4F8F5]">Total</span>
        <span className="font-bold text-[#F4F8F5]">{formatPrice(total)}</span>
      </div>
      {!checkoutMode ? (
        <div className="space-y-3 mt-6">
          <button onClick={onCheckout} className="w-full bg-[#EFC368] hover:bg-[#D3A74F] text-[#001E27] py-3 rounded-md">
            Procéder au paiement
          </button>
          <Link href="/produits" className="block text-center text-[#F4F8F5]">
            Continuer mes achats
          </Link>
        </div>
      ) : (
        <div className="space-y-3 mt-6">
          <button onClick={onBackToCart} className="w-full text-[#F4F8F5]">
            Retour au panier
          </button>
          <button onClick={onClearCart} className="w-full border border-[#3A4A4F] text-[#F4F8F5] py-2 rounded-md">
            Vider le panier
          </button>
        </div>
      )}
    </div>
  );
}
