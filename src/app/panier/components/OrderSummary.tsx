import React from 'react';
import Link from 'next/link';
import { formatPrice } from '@/utils/formatPrice';
import type { Cart, LoyaltyBenefits, PromoResult } from '../types';
import type { PricingTotals } from '@/lib/pricingClient';

// Multiplicateur Black Friday (-30%)
const BLACK_FRIDAY_MULTIPLIER = 0.7;

interface Props {
  cart: Cart;
  totals: PricingTotals | null;
  loadingTotals: boolean;
  promoResult: PromoResult;
  loyaltyBenefits: LoyaltyBenefits;
  isAuthenticated: boolean;
  onCheckout: () => void;
  checkoutMode: boolean;
  onBackToCart: () => void;
  onClearCart: () => void;
  country?: string;
}

export default function OrderSummary({
  cart,
  totals,
  loadingTotals,
  promoResult,
  loyaltyBenefits,
  isAuthenticated,
  onCheckout,
  checkoutMode,
  onBackToCart,
  onClearCart,
  country: _country = 'France',
}: Props) {
  const subtotal = totals?.subtotal ?? cart.subtotal ?? 0;
  const calculatedShipping = totals?.shippingCost ?? 0;
  const siteDiscount = totals?.siteDiscount ?? 0;
  const loyaltyDiscount = totals?.loyaltyDiscount ?? (loyaltyBenefits.discountAmount || 0);
  const promoDiscount = totals?.promoDiscount ?? (promoResult.applied ? promoResult.discount : 0);
  // Le parrainage est désormais calculé par le backend et inclus dans totals
  const referralDiscount = totals?.referralDiscount ?? 0;
  const referralChecked = true; // Toujours vrai maintenant car calculé côté serveur

  const baseTotal =
    totals?.total ??
    Math.max(
      0,
      subtotal + calculatedShipping - siteDiscount - loyaltyDiscount - promoDiscount - referralDiscount,
    );

  const totalWithoutShipping = Math.max(
    0,
    subtotal - siteDiscount - loyaltyDiscount - promoDiscount - referralDiscount,
  );

  const displayTotal = checkoutMode ? baseTotal : totalWithoutShipping;
  const shouldShowShipping = checkoutMode;
  const sitePromotionLabel =
    siteDiscount > 0
      ? totals?.appliedSitePromotion
        ? `${totals.appliedSitePromotion.label} (-${totals.appliedSitePromotion.percentage}%)`
        : ''
      : null;

  return (
    <div className="bg-[#002935] p-6 rounded-lg border border-[#3A4A4F]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#F4F8F5]">Récapitulatif</h2>
        <span className="inline-block px-3 py-1 bg-[#EFC368] text-[#001E27] text-xs font-semibold rounded-full">Black Friday -30%</span>
      </div>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-[#F4F8F5]">Sous-total</span>
          <span className="text-[#F4F8F5]">
            {loadingTotals ? 'Calcul...' : formatPrice(subtotal)}
          </span>
        </div>
        {shouldShowShipping ? (
          <div className="flex justify-between">
            <span className="text-[#F4F8F5]">Livraison</span>
            <span className="text-[#F4F8F5]">
              {loadingTotals
                ? 'Calcul...'
                : calculatedShipping === 0
                ? 'Gratuit'
                : formatPrice(calculatedShipping)}
            </span>
          </div>
        ) : (
          <div className="flex justify-between">
            <span className="text-[#F4F8F5]">Livraison</span>
            <span className="text-[#F4F8F5] text-sm">Calculée à l’étape suivante</span>
          </div>
        )}
        {siteDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-[#F4F8F5]">{sitePromotionLabel}</span>
            <span className="text-[#10B981]">-{formatPrice(siteDiscount)}</span>
          </div>
        )}
        {promoDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-[#F4F8F5]">
              Code promo {promoResult.code && `(${promoResult.code})`}
            </span>
            <span className="text-[#10B981]">-{formatPrice(promoDiscount)}</span>
          </div>
        )}
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-[#F4F8F5]">Remise fidélité</span>
            <span className="text-[#10B981]">-{formatPrice(loyaltyDiscount)}</span>
          </div>
        )}
        {referralChecked && referralDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-[#F4F8F5]">Parrainage</span>
            <span className="text-[#10B981]">-{formatPrice(referralDiscount)}</span>
          </div>
        )}
        {isAuthenticated && loyaltyBenefits.active && loyaltyBenefits.message && (
          <div className="mt-4 p-2 bg-[#003545] rounded text-[#F4F8F5] text-sm">
            {loyaltyBenefits.message}
          </div>
        )}
      </div>
      <div className="border-t border-[#3A4A4F] pt-3 flex justify-between">
        <span className="font-bold text-[#F4F8F5]">Total</span>
        <span className="font-bold text-[#F4F8F5]">
          {loadingTotals ? 'Calcul...' : formatPrice(displayTotal)}
        </span>
      </div>
      {!checkoutMode ? (
        <div className="space-y-3 mt-6">
          <button
            onClick={onCheckout}
            className="w-full bg-[#EFC368] hover:bg-[#D3A74F] text-[#001E27] py-3 rounded-md"
          >
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
          <button
            onClick={onClearCart}
            className="w-full border border-[#3A4A4F] text-[#F4F8F5] py-2 rounded-md"
          >
            Vider le panier
          </button>
        </div>
      )}
    </div>
  );
}
