"use client";

import React, { useState, useEffect } from "react";
import { useCartContext } from "@/context/CartContext";
import { useAuthContext } from "@/context/AuthContext";

import { CartItemList, CheckoutSidebar } from "./components";
import Link from "next/link";
import {
  usePromoCode,
  useLoyaltyBenefits,
  useUserAddresses,
  useCheckout,
} from "./hooks";
import { CustomerInfo, FormErrors, Address } from "./types";
import { GiftProgressBanner } from "@/components/GiftProgressBanner";

export default function CartView() {
  const { cart, clearCart } = useCartContext();
  const { isAuthenticated, user } = useAuthContext();
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [walletApplied, setWalletApplied] = useState(false);

  // customer info + erreurs
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "France",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Hooks métier
  const {
    promoCode,
    setPromoCode,
    promoResult,
    isApplying,
    applyPromo,
    cancelPromo,
  } = usePromoCode(cart, customerInfo);

  const { loyaltyBenefits, loading: loadingLoyalty } = useLoyaltyBenefits(
    cart,
    customerInfo.country
  );

  const { userAddresses } = useUserAddresses(checkoutMode);

  const {
    isSubmitting,
    handleSubmit: handlePaymentSubmit,
    errors: checkoutErrors,
    paymentMethod,
    setPaymentMethod,
    setGuestCustomerId,
  } = useCheckout(
    cart,
    promoResult,
    loyaltyBenefits,
    customerInfo,
    clearCart,
    setErrors,
    walletApplied
  );

  // Initialiser l'email du compte pour les utilisateurs connectés
  useEffect(() => {
    if (isAuthenticated && user?.email && customerInfo.email !== user.email) {
      setCustomerInfo((prev) => ({
        ...prev,
        email: user.email,
      }));
    }
  }, [isAuthenticated, user?.email, customerInfo.email]);

  // Synchroniser les erreurs du checkout avec l'état d'erreurs local
  useEffect(() => {
    if (Object.keys(checkoutErrors).length > 0) {
      setErrors(checkoutErrors);
    }
  }, [checkoutErrors]);

  // UI handlers
  const handleCheckout = () => setCheckoutMode(true);
  const handleBack = () => setCheckoutMode(false);
  const handleWalletApply = () => setWalletApplied(true);

  const handleSelectAddress = (addr: Address) => {
    const ALLOWED_COUNTRIES = [
      "France",
      "Belgique",
      "Suisse",
      "Luxembourg",
      "Espagne",
      "Portugal",
      "Pays Bas",
    ] as const;
    type AllowedCountry = typeof ALLOWED_COUNTRIES[number];

    const normalize = (s: string) =>
      (s || "").trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const sanitizeCountry = (c: string): AllowedCountry => {
      const n = normalize(c);
      if (!n) return "France";
      if (n === 'fr' || n.startsWith('fr') || n === 'france') return "France";
      if (['be', 'bel', 'belgique', 'belgium', 'belgie', 'belge'].includes(n)) return "Belgique";
      if (['ch', 'che', 'suisse', 'switzerland', 'schweiz', 'svizzera'].includes(n)) return "Suisse";
      if (['lu', 'luxembourg', 'ltz'].includes(n)) return "Luxembourg";
      if (['es', 'esp', 'espagne', 'spain', 'espana', 'espana', 'espanol'].includes(n)) return "Espagne";
      if (['pt', 'prt', 'portugal'].includes(n)) return "Portugal";
      if (
        ['nl', 'nld', 'netherlands', 'holland', 'hollande', 'nederland', 'pays bas', 'pays-bas'].includes(n)
      ) return "Pays Bas";
      const label = (ALLOWED_COUNTRIES as readonly string[]).find(
        (x) => normalize(x) === n
      );
      return (label as AllowedCountry) || "France";
    };

    // Extraire le prénom et le nom à partir du champ name de l'adresse
    let firstName = "";
    let lastName = "";

    if (addr.name) {
      // Diviser au niveau du premier espace
      const nameParts = addr.name.split(" ");
      if (nameParts.length > 0) {
        firstName = nameParts[0];
        // Le reste est le nom de famille
        if (nameParts.length > 1) {
          lastName = nameParts.slice(1).join(" ");
        }
      }
    }

    // Utiliser l'email de l'utilisateur s'il est disponible
    const email = user?.email || "";

    setCustomerInfo((prev) => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      email: email || prev.email,
      address: addr.line1,
      addressLine2: addr.line2 || "",
      city: addr.city,
      postalCode: addr.postalCode,
      country: sanitizeCountry(addr.country),
      phone: addr.phone || prev.phone,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour le CheckoutForm qui utilise la signature (field, value)
  // const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
  //   setCustomerInfo(prev => ({ ...prev, [field]: value }));
  // };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto flex items-center justify-center h-[60vh] bg-[#001E27] text-center">
        <div>
          <h1 className="text-3xl font-bold text-[#F4F8F5] mb-6">
            Votre panier est vide
          </h1>
          <Link
            href="/produits"
            className="bg-[#EFC368] px-6 py-3 rounded-md text-[#001E27]"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#001E27]">
      {/* Bannière progression cadeaux */}
      <GiftProgressBanner />

      <h1 className="text-3xl font-bold mb-8 text-[#F4F8F5]">Votre panier</h1>

      {/* Bannière Cashback Noël */}
      <div className="mb-6 bg-gradient-to-r from-[#1a472a] to-[#002935] border border-green-500/30 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🎄</span>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1">Cashback Noël 2025</h3>
            <p className="text-white/90 text-sm mb-2">
              Gagnez jusqu&apos;à <span className="text-green-400 font-bold">20€ de cashback</span> sur vos commandes !
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-white/70">
              <span className="bg-green-500/20 px-2 py-1 rounded">25€ → 5€</span>
              <span className="bg-green-500/20 px-2 py-1 rounded">50€ → 10€</span>
              <span className="bg-green-500/20 px-2 py-1 rounded">100€ → 20€</span>
            </div>
            <p className="text-white/60 text-xs mt-2">
              💰 Valable du 19-31 décembre • Utilisable en janvier 2026
            </p>
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <CartItemList />

      {/* Sidebar unique */}
      <div className="mt-8 lg:mt-0 lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="lg:col-start-2">
          <CheckoutSidebar
            isAuthenticated={isAuthenticated}
            loyaltyBenefits={loyaltyBenefits}
            loadingLoyalty={loadingLoyalty}
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            promoResult={promoResult}
            isApplying={isApplying}
            onApply={applyPromo}
            onCancel={cancelPromo}
            cart={cart}
            customerInfo={customerInfo}
            errors={errors}
            handleInputChange={handleInputChange}
            selectedAddressId={customerInfo.address}
            userAddresses={userAddresses}
            handleSelectAddress={handleSelectAddress}
            checkoutMode={checkoutMode}
            onCheckout={handleCheckout}
            onBackToCart={handleBack}
            onPaymentSubmit={handlePaymentSubmit}
            clearCart={clearCart}
            isSubmitting={isSubmitting}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            walletApplied={walletApplied}
            onWalletApply={handleWalletApply}
            onGuestAccountCreated={setGuestCustomerId}
          />
        </div>
      </div>
    </div>
  );
}
