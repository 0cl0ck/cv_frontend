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

export default function CartView() {
  const { cart, clearCart } = useCartContext();
  const { isAuthenticated, user } = useAuthContext();
  const [checkoutMode, setCheckoutMode] = useState(false);

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
  } = useCheckout(
    cart,
    promoResult,
    loyaltyBenefits,
    customerInfo,
    clearCart,
    setErrors
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
      if (['be','bel','belgique','belgium','belgie','belge'].includes(n)) return "Belgique";
      if (['ch','che','suisse','switzerland','schweiz','svizzera'].includes(n)) return "Suisse";
      if (['lu','luxembourg','ltz'].includes(n)) return "Luxembourg";
      if (['es','esp','espagne','spain','espana','espana','espanol'].includes(n)) return "Espagne";
      if (['pt','prt','portugal'].includes(n)) return "Portugal";
      if (
        ['nl','nld','netherlands','holland','hollande','nederland','pays bas','pays-bas'].includes(n)
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
      {/* Bannière promotionnelle temporaire */}
      <div className="bg-[#EFC368] text-[#001E27] p-4 rounded-md mb-6 shadow-md border-2 border-[#F4F8F5] text-center">
        <p className="text-lg font-bold uppercase">Cadeaux automatiques</p>
        <p className="text-sm mt-1">Livraison offerte + cadeaux selon le montant du panier.</p>
        <div className="mt-2 space-y-1 text-sm">
          <p>50 EUR : Livraison offerte* + 2g offerts</p>
          <p>90 EUR : Livraison offerte* + 10g offerts + 1 pre-roll</p>
          <p>160 EUR : Livraison offerte* + 20g offerts + 2 pre-rolls</p>
        </div>
        <p className="text-xs mt-3">Montant calcule apres remises et fidelite.</p>
        <p className="text-xs mt-1 italic">* Livraison offerte à partir de 50 EUR pour la France, 200 EUR pour les autres pays.</p>
      </div>

      <h1 className="text-3xl font-bold mb-8 text-[#F4F8F5]">Votre panier</h1>

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
          />
        </div>
      </div>
    </div>
  );
}
