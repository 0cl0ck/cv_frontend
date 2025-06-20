'use client';

import React, { useState, useEffect } from 'react';
import { useCartContext } from '@/context/CartContext';
import { useAuthContext } from '@/context/AuthContext';

import {
  CartItemList,
  CheckoutSidebar
} from './components';
import Link from 'next/link';
import {
  usePromoCode,
  useLoyaltyBenefits,
  useUserAddresses,
  useCheckout
} from './hooks';
import { CustomerInfo, FormErrors, Address } from './types';

export default function CartView() {
  const { cart, clearCart } = useCartContext();
  const { isAuthenticated, user } = useAuthContext();
  const [checkoutMode, setCheckoutMode] = useState(false);

  // customer info + erreurs
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'France',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Hooks métier
  const {
    promoCode,
    setPromoCode,
    promoResult,
    isApplying,
    applyPromo,
    cancelPromo
  } = usePromoCode(cart, customerInfo);

  const {
    loyaltyBenefits,
    loading: loadingLoyalty
  } = useLoyaltyBenefits(cart, customerInfo.country);

  const { userAddresses } = useUserAddresses(checkoutMode);

  const {
    isSubmitting,
    handleSubmit: handlePaymentSubmit,
    errors: checkoutErrors,
    paymentMethod,
    setPaymentMethod
  } = useCheckout(cart, promoResult, loyaltyBenefits, customerInfo, clearCart, setErrors);
  
  // Initialiser l'email du compte pour les utilisateurs connectés
  useEffect(() => {
    if (isAuthenticated && user?.email && customerInfo.email !== user.email) {
      setCustomerInfo(prev => ({
        ...prev,
        email: user.email
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
  const handleBack     = () => setCheckoutMode(false);

  const handleSelectAddress = (addr: Address) => {
    // Extraire le prénom et le nom à partir du champ name de l'adresse
    let firstName = '';
    let lastName = '';
    
    if (addr.name) {
      // Diviser au niveau du premier espace
      const nameParts = addr.name.split(' ');
      if (nameParts.length > 0) {
        firstName = nameParts[0];
        // Le reste est le nom de famille
        if (nameParts.length > 1) {
          lastName = nameParts.slice(1).join(' ');
        }
      }
    }
    
    // Utiliser l'email de l'utilisateur s'il est disponible
    const email = user?.email || '';
    
    setCustomerInfo(prev => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      email: email || prev.email,
      address: addr.line1,
      addressLine2: addr.line2 || '',
      city: addr.city,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone || prev.phone,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  // Fonction pour le CheckoutForm qui utilise la signature (field, value)
  // const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
  //   setCustomerInfo(prev => ({ ...prev, [field]: value }));
  // };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto flex items-center justify-center h-[60vh] bg-[#001E27] text-center">
        <div>
          <h1 className="text-3xl font-bold text-[#F4F8F5] mb-6">Votre panier est vide</h1>
          <Link href="/produits" className="bg-[#EFC368] px-6 py-3 rounded-md text-[#001E27]">Continuer mes achats</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#001E27]">
      {/* Bannière promotionnelle temporaire */}
      <div className="bg-[#EFC368] text-[#001E27] p-4 rounded-md mb-6 shadow-md border-2 border-[#F4F8F5] text-center">
        <p className="text-lg font-bold">🎁 PROMOTION TEMPORAIRE 🎁</p>
        <p>Livraison Gratuite pour toutes les commandes</p>
        <p className="text-sm mt-1">2g offerts avec votre commande, peu importe le montant (passe à 5g dès 50€)</p>
        <p className="text-sm mt-1">Dès 60€ → +5g offerts</p>
        <p className="text-sm mt-1">Dès 90€ → 12g offerts</p>
        <p className="text-sm mt-1">Dès 120€ → 20g offerts</p>
        <p className="text-xs italic mt-2">*Pour 120€ : 25g offerts en tout (20 + 5)</p>
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
