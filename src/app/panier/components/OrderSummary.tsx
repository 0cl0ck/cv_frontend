import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/utils/formatPrice';
import { httpClient } from '@/lib/httpClient';
import type { PromoResult, LoyaltyBenefits, Cart } from '../types';
import type { PricingTotals } from '@/lib/pricingClient';

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
  country = 'France',
}: Props) {
  const subtotal = totals?.subtotal ?? cart.subtotal ?? 0;
  const calculatedShipping = totals?.shippingCost ?? 0;
  const loyaltyDiscount = totals?.loyaltyDiscount ?? (loyaltyBenefits.discountAmount || 0);
  const promoDiscount = totals?.promoDiscount ?? (promoResult.applied ? promoResult.discount : 0);
  const baseTotal =
    totals?.total ?? Math.max(0, subtotal + calculatedShipping - loyaltyDiscount - promoDiscount);

  const [referralDiscount, setReferralDiscount] = useState<number>(0);
  const [referralChecked, setReferralChecked] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function checkReferral() {
      setReferralChecked(false);
      try {
        const body = {
          items: (cart.items || [])
            .filter((item) => !item.isGift)
            .map((item) => ({
              unitPrice: Number.isFinite(item.price) ? Number(item.price) : 0,
              quantity: Number.isFinite(item.quantity) ? Number(item.quantity) : 0,
            })),
          country,
        };

        const res = await httpClient.post('/cart/apply-referral', body, { withCsrf: true });
        const data = res.data as { success: boolean; eligible: boolean; discount: number };
        if (!cancelled) {
          setReferralDiscount(data?.eligible ? Number(data.discount || 0) : 0);
        }
      } catch {
        if (!cancelled) setReferralDiscount(0);
      } finally {
        if (!cancelled) setReferralChecked(true);
      }
    }

    if ((cart.items || []).filter((item) => !item.isGift).length > 0) {
      checkReferral();
    } else {
      setReferralDiscount(0);
      setReferralChecked(true);
    }

    return () => {
      cancelled = true;
    };
  }, [cart.items, country, subtotal]);

  const displayTotal = Math.max(0, baseTotal - (referralDiscount || 0));

  return (
    <div className="bg-[#002935] p-6 rounded-lg border border-[#3A4A4F]">
      <h2 className="text-xl font-bold mb-4 text-[#F4F8F5]">Récapitulatif</h2>
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-[#F4F8F5]">Sous-total</span>
          <span className="text-[#F4F8F5]">
            {loadingTotals ? 'Calcul...' : formatPrice(subtotal)}
          </span>
        </div>
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

