import React from 'react';
import PromoCodeForm from './PromoCodeForm';
import GuestLoyaltyBanner from './GuestLoyaltyBanner';
import LoyaltyBenefitsPanel from './LoyaltyBenefitsPanel';
import OrderSummary from './OrderSummary';
import CheckoutForm from './CheckoutForm';
import { useCartPricing } from '../hooks/useCartPricing';
import { formatPrice } from '@/utils/formatPrice';
import { Cart, Address, LoyaltyBenefits, PromoResult, CustomerInfo, FormErrors, PaymentMethod } from '../types';
import { WalletWidget } from '@/components/Wallet';
interface CheckoutSidebarProps {
    isAuthenticated: boolean;
    loyaltyBenefits: LoyaltyBenefits;
    loadingLoyalty: boolean;
    promoCode: string;
    setPromoCode: (c: string) => void;
    promoResult: PromoResult;
    isApplying: boolean;            // Nom utilisé dans cart-view.tsx
    onApply: (e: React.FormEvent) => Promise<void>; // Nom utilisé dans cart-view.tsx
    onCancel: () => void;          // Nom utilisé dans cart-view.tsx
    cart: Cart;
    customerInfo: CustomerInfo;
    errors: FormErrors;            // Type FormErrors correct
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedAddressId: string | null;
    userAddresses: Address[];
    handleSelectAddress: (a: Address) => void;
    checkoutMode: boolean;
    onCheckout: () => void;
    onBackToCart: () => void;      // Fonction pour revenir au panier
    onPaymentSubmit: (e: React.FormEvent) => Promise<void>;
    clearCart: () => void;
    isSubmitting?: boolean;        // Flag pour indiquer si le formulaire est en cours de soumission
    paymentMethod: PaymentMethod;   // Méthode de paiement choisie
    setPaymentMethod: (method: PaymentMethod) => void; // Fonction pour changer la méthode de paiement
    walletDiscount?: number;       // Montant de cagnotte appliqué
    onWalletApply?: (amount: number) => void; // Callback pour appliquer le wallet
  }

export default function CheckoutSidebar({
  isAuthenticated,
  loyaltyBenefits,
  loadingLoyalty,
  promoCode,
  setPromoCode,
  promoResult,
  isApplying,
  onApply,
  onCancel,
  cart,
  customerInfo,
  errors,
  handleInputChange,
  selectedAddressId,
  userAddresses,
  handleSelectAddress,
  checkoutMode,
  onCheckout,
  onBackToCart,
  onPaymentSubmit,
  clearCart,
  isSubmitting = false,
  paymentMethod = 'card',
  setPaymentMethod,
  walletDiscount = 0,
  onWalletApply,
}: CheckoutSidebarProps) {
  // Le backend calcule automatiquement TOUTES les remises
  const {
    totals,
    loading: pricingLoading,
    error: pricingError,
  } = useCartPricing(cart, customerInfo.country, promoResult.applied ? promoResult.code : undefined);

  const subtotal = totals?.subtotal ?? cart.subtotal ?? 0;
  const shippingCost = totals?.shippingCost ?? 0;
  const siteDiscountValue = totals?.siteDiscount ?? 0;
  const loyaltyDiscountValue = totals?.loyaltyDiscount ?? 0;
  const promoDiscountValue = totals?.promoDiscount ?? 0;
  const referralDiscountValue = totals?.referralDiscount ?? 0;
  const totalAmount =
    totals?.total ??
    Math.max(
      0,
      subtotal +
        shippingCost -
        siteDiscountValue -
        loyaltyDiscountValue -
        promoDiscountValue -
        referralDiscountValue,
    );
  const sitePromotionLabel =
    siteDiscountValue > 0
      ? totals?.appliedSitePromotion
        ? `${totals.appliedSitePromotion.label} (-${totals.appliedSitePromotion.percentage}%)`
        : ''
      : null;
  
  // Reconstruction des bénéfices à partir de totals pour rétrocompatibilité UI
  const actualLoyaltyBenefits: LoyaltyBenefits = {
    ...loyaltyBenefits,
    discountAmount: loyaltyDiscountValue,
    active: loyaltyDiscountValue > 0,
    message: totals?.appliedLoyalty?.tier === 'silver' 
      ? 'Fidélité Argent : -10% sur votre commande'
      : totals?.appliedLoyalty?.tier === 'bronze'
      ? 'Fidélité Bronze : -5% sur votre commande'
      : loyaltyBenefits.message,
  };

  if (!checkoutMode) {
    // Mode normal : affichage du résumé, promos, fidélité
    return (
      <div className="bg-[#002935] p-6 rounded-lg border border-[#3A4A4F] space-y-6">
        {/* 1) Formulaire code promo */}
        <PromoCodeForm
          promoCode={promoCode}
          setPromoCode={setPromoCode}
          onApply={onApply}
          onCancel={onCancel}
          promoResult={promoResult}
          isApplying={isApplying}
          disableApply={promoCode.trim().toUpperCase().startsWith('PAR-') && cart.subtotal < 100}
          applyHint={promoCode.trim().toUpperCase().startsWith('PAR-') && cart.subtotal < 100 ? 'Ce code parrain est valable dès 100€ de panier.' : undefined}
        />

        {/* 2) Programme de fidélité */}
        {isAuthenticated ? (
          <LoyaltyBenefitsPanel
            loyaltyBenefits={actualLoyaltyBenefits}
            loading={loadingLoyalty}
            isAuthenticated
          />
        ) : (
          <GuestLoyaltyBanner />
        )}

        {/* 3) Cagnotte (wallet) - Uniquement pour les clients connectés */}
        {isAuthenticated && onWalletApply && (
          <WalletWidget
            compact
            cartTotal={totalAmount}
            onWalletApply={onWalletApply}
          />
        )}

        {/* 4) Récapitulatif & checkout */}
        <OrderSummary
          cart={cart}
          totals={totals}
          loadingTotals={pricingLoading}
          promoResult={promoResult}
          loyaltyBenefits={actualLoyaltyBenefits}
          isAuthenticated={isAuthenticated}
          onCheckout={onCheckout}
          checkoutMode={checkoutMode}
          onBackToCart={onBackToCart}
          onClearCart={clearCart}
          country={customerInfo.country}
        />
      </div>
    );
  }

  // Mode checkout : affichage du formulaire de livraison
  return (
    <div className="bg-[#002935] p-6 rounded-lg border border-[#3A4A4F] space-y-6">
      {/* Récapitulatif en haut du formulaire (version simplifiée) */}
      {/* 1) Formulaire code promo pour le mode checkout */}
      <PromoCodeForm
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        onApply={onApply}
        onCancel={onCancel}
        promoResult={promoResult}
        isApplying={isApplying}
        disableApply={promoCode.trim().toUpperCase().startsWith('PAR-') && cart.subtotal < 100}
        applyHint={promoCode.trim().toUpperCase().startsWith('PAR-') && cart.subtotal < 100 ? 'Ce code parrain est valable dès 100€ de panier.' : undefined}
      />

      {/* 2) Programme de fidélité pour le mode checkout */}
      {isAuthenticated ? (
        <LoyaltyBenefitsPanel
          loyaltyBenefits={actualLoyaltyBenefits}
          loading={loadingLoyalty}
          isAuthenticated
        />
      ) : (
        <GuestLoyaltyBanner />
      )}

      {/* 3) Cagnotte (wallet) - Uniquement pour les clients connectés */}
      {isAuthenticated && onWalletApply && (
        <WalletWidget
          compact
          cartTotal={totalAmount}
          onWalletApply={onWalletApply}
        />
      )}

      {/* 4) Récapitulatif pour le mode checkout */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2 text-[#F4F8F5]">Récapitulatif</h2>
        {pricingError && (
          <div className="mb-2 text-sm text-red-400">
            {pricingError}
          </div>
        )}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <span className="text-[#F4F8F5]">Sous-total</span>
            <span className="text-[#F4F8F5]">
              {pricingLoading ? 'Calcul...' : formatPrice(subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#F4F8F5]">Livraison</span>
            <span className="text-[#F4F8F5]">
              {pricingLoading
                ? 'Calcul...'
                : shippingCost === 0
                ? 'Gratuit'
                : formatPrice(shippingCost)}
            </span>
          </div>
          {siteDiscountValue > 0 && (
            <div className="flex justify-between">
              <span className="text-[#F4F8F5]">{sitePromotionLabel}</span>
              <span className="text-[#10B981]">-{formatPrice(siteDiscountValue)}</span>
            </div>
          )}
          {promoDiscountValue > 0 && (
            <div className="flex justify-between">
              <span className="text-[#F4F8F5]">
                Code promo {promoResult.code && `(${promoResult.code})`}
              </span>
              <span className="text-[#10B981]">-{formatPrice(promoDiscountValue)}</span>
            </div>
          )}
          {loyaltyDiscountValue > 0 && (
            <div className="flex justify-between">
              <span className="text-[#F4F8F5]">Remise fidélité</span>
              <span className="text-[#10B981]">-{formatPrice(loyaltyDiscountValue)}</span>
            </div>
          )}
          {referralDiscountValue > 0 && (
            <div className="flex justify-between">
              <span className="text-[#F4F8F5]">Parrainage</span>
              <span className="text-[#10B981]">-{formatPrice(referralDiscountValue)}</span>
            </div>
          )}
          {walletDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-[#F4F8F5]">💰 Cagnotte</span>
              <span className="text-[#10B981]">-{formatPrice(walletDiscount)}</span>
            </div>
          )}
          {isAuthenticated && loyaltyBenefits.active && loyaltyBenefits.message && (
            <div className="mt-3 p-2 bg-[#003545] rounded text-[#F4F8F5] text-xs">
              {loyaltyBenefits.message}
            </div>
          )}
        </div>
        <div className="border-t border-[#3A4A4F] pt-2 flex justify-between font-medium">
          <span className="text-[#F4F8F5]">Total</span>
          <span className="text-[#F4F8F5]">
            {pricingLoading ? 'Calcul...' : formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      {/* Si connecté, liste des adresses : */}
      {isAuthenticated && userAddresses.length > 0 && (
        <div className="mb-6 border-b border-[#3A4A4F] pb-6">
          <h3 className="text-base font-bold mb-3 text-[#F4F8F5]">Vos adresses de livraison</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {userAddresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedAddressId === address.id
                  ? 'border-[#03745C] bg-[#03745C] bg-opacity-5'
                  : 'border-[#3A4A4F] hover:border-[#03745C]'}`}
                onClick={() => handleSelectAddress(address)}
              >
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="text-sm font-medium text-[#F4F8F5]">Adresse de livraison</span>
                  </div>
                </div>
                <p className="font-medium text-sm text-[#F4F8F5]">{address.name}</p>
                <p className="text-xs text-[#F4F8F5]">{address.line1}</p>
                {address.line2 && <p className="text-xs text-[#F4F8F5]">{address.line2}</p>}
                <p className="text-xs text-[#F4F8F5]">
                  {address.postalCode} {address.city}
                </p>
              </div>
            ))}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Sélectionnez une adresse ou remplissez le formulaire ci-dessous
          </div>
        </div>
      )}

      {/* Le formulaire de checkout */}
      <CheckoutForm
        customerInfo={customerInfo}
        errors={errors}
        onChange={(field, value) => {
          // Adapter le format d'événement pour handleInputChange
          const mockEvent = {
            target: { name: field, value }
          } as React.ChangeEvent<HTMLInputElement>;
          handleInputChange(mockEvent);
        }}
        onSubmit={onPaymentSubmit}
        isSubmitting={isSubmitting}
        isAuthenticated={isAuthenticated}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
      />

      {/* Actions du formulaire */}
      <div className="flex flex-col space-y-3 mt-4">
        <button 
          onClick={onBackToCart} 
          className="text-sm text-[#F4F8F5] hover:text-[#10B981] flex items-center self-start"
        >
          <span className="mr-1">←</span> Retour au panier
        </button>
      </div>
    </div>
  );
}
