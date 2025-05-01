'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartContext } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import apiConfig from '@/config/api';
import { MapPin, CheckCircle } from 'lucide-react';

// Types pour les adresses
type AddressType = 'shipping' | 'billing' | 'both';

interface Address {
  id?: string;
  type: AddressType;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function CartView() {
  const { cart, updateQuantity, removeItem, clearCart } = useCartContext();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const isSubmitting = useRef(false);
  
  // État pour les adresses enregistrées
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
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
  const [errors, setErrors] = useState<{
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  }>({});

  // Gestion de la quantité
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(index, newQuantity);
  };

  // Supprimer un article
  const handleRemoveItem = (index: number) => {
    removeItem(index);
  };

  // Récupérer les adresses enregistrées du client s'il est connecté
  useEffect(() => {
    async function fetchUserAddresses() {
      // Ne récupérer les adresses que si le mode checkout est activé
      if (!checkoutMode) return;
      
      try {
        setLoadingAddresses(true);
        
        // Vérifier si le cookie d'authentification existe
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('payload-token='));
        
        if (!authCookie) {
          // Utilisateur non connecté
          setIsAuthenticated(false);
          setLoadingAddresses(false);
          return;
        }
        
        // Extraire le token JWT du cookie
        const token = authCookie.split('=')[1]?.trim();
        
        // Décoder le payload JWT (sans vérification de signature)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Format de token JWT invalide');
          setLoadingAddresses(false);
          return;
        }
        
        // Décoder le payload (deuxième partie du token)
        const payloadBase64 = tokenParts[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        
        // Récupérer les données utilisateur depuis le backend
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const backendResponse = await fetch(`${backendUrl}/api/customers/${decodedPayload.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (backendResponse.ok) {
          const backendData = await backendResponse.json();
          
          // Filtrer uniquement les adresses de type livraison
          const shippingAddresses = backendData.addresses?.filter(
            (addr: Address) => addr.type === 'shipping' || addr.type === 'both'
          ) || [];
          
          setUserAddresses(shippingAddresses);
          setIsAuthenticated(true);
          
          // Pré-remplir les infos de base du client (mais pas l'adresse automatiquement)
          setCustomerInfo(prevInfo => ({
            ...prevInfo,
            email: backendData.email || '',
            firstName: backendData.firstName || '',
            lastName: backendData.lastName || '',
            phone: backendData.phoneNumber || ''
          }));
        } else {
          console.error('Erreur lors de la récupération des données utilisateur');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des adresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    }
    
    fetchUserAddresses();
  }, [checkoutMode]);

  // Sélectionner une adresse et pré-remplir le formulaire
  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id || null);
    
    // Pré-remplir le formulaire avec l'adresse sélectionnée
    setCustomerInfo(prevInfo => ({
      ...prevInfo,
      address: address.line1,
      addressLine2: address.line2 || '',
      city: address.city,
      postalCode: address.postalCode,
      country: address.country || 'France'
    }));
  };

  // Procéder au checkout
  const handleCheckout = () => {
    setCheckoutMode(true);
  };

  // Gestion des changements dans les champs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      address?: string;
      city?: string;
      postalCode?: string;
    } = {};
    let isValid = true;

    if (!customerInfo.email) {
      newErrors.email = 'L\'email est requis';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      newErrors.email = 'Email invalide';
      isValid = false;
    }

    if (!customerInfo.firstName) {
      newErrors.firstName = 'Le prénom est requis';
      isValid = false;
    }
    
    if (!customerInfo.lastName) {
      newErrors.lastName = 'Le nom est requis';
      isValid = false;
    }

    if (!customerInfo.phone) {
      newErrors.phone = 'Le numéro de téléphone est requis';
      isValid = false;
    }

    if (!customerInfo.address) {
      newErrors.address = 'L\'adresse est requise';
      isValid = false;
    }

    if (!customerInfo.city) {
      newErrors.city = 'La ville est requise';
      isValid = false;
    }

    if (!customerInfo.postalCode) {
      newErrors.postalCode = 'Le code postal est requis';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Soumission du paiement
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
  
    // Protection contre les soumissions multiples
    if (isSubmitting.current) return;
    isSubmitting.current = true;

    try {
      setIsCheckingOut(true);
      
      // Calcul des frais de port selon le pays
      const shippingCost = customerInfo.country === 'Belgique'
        ? 10
        : cart.subtotal >= 49
          ? 0
          : 4.95;
      const shippingCostCents = customerInfo.country === 'Belgique'
        ? 1000
        : cart.subtotalCents >= 4900
          ? 0
          : 495;
      
      const totalCents = cart.subtotalCents + shippingCostCents;
      const total = totalCents / 100;
      
      // Créer l'objet commande et paiement combiné
      const checkoutData = {
        order: {
          items: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            title: item.name,
            price: item.price, // Prix en euros pour l'affichage
            priceCents: item.priceCents, // Prix en centimes pour les calculs
            quantity: item.quantity,
            attributes: {}
          })),
          guestInformation: {
            email: customerInfo.email,
            firstName: customerInfo.firstName,
            lastName: customerInfo.lastName,
            phone: customerInfo.phone
          },
          billingAddress: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            line1: customerInfo.address,
            line2: customerInfo.addressLine2 || "",
            city: customerInfo.city,
            postalCode: customerInfo.postalCode,
            country: customerInfo.country
          },
          shippingAddress: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            line1: customerInfo.address,
            line2: customerInfo.addressLine2 || "",
            city: customerInfo.city,
            postalCode: customerInfo.postalCode,
            country: customerInfo.country
          },
          shipping: {
            method: "67fffcd911f3717499195edf", // ID livraison standard
            cost: shippingCost
          },
          notes: ""
        },
        payment: {
          amount: total,
          amountCents: totalCents,
          subtotal: cart.subtotal,
          subtotalCents: cart.subtotalCents,
          shippingCost: shippingCost,
          shippingCostCents: shippingCostCents,
          customerEmail: customerInfo.email,
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          customerPhone: customerInfo.phone
        }
      };
      
      console.log('Initialisation du checkout...', checkoutData);
      
      // Utilisation du point d'entrée unifié pour la création de commande et l'initialisation du paiement
      const paymentResponse = await fetch(apiConfig.endpoints.payment, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutData)
      });

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        throw new Error(`Erreur de paiement: ${errorText}`);
      }
      
      const paymentResult = await paymentResponse.json();
      
      // Afficher l'URL complète pour débogage
      console.log('PAYMENT URL RECEIVED:', paymentResult.smartCheckoutUrl);
      
      if (paymentResult.smartCheckoutUrl) {
        // Vider le panier avant de rediriger
        clearCart();
        
        // Rediriger vers la page de paiement SANS forçage de demo
        console.log('REDIRECTING TO PAYMENT:', paymentResult.smartCheckoutUrl);
        window.location.href = paymentResult.smartCheckoutUrl;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (error) {
      console.error("Erreur lors du processus de paiement:", error);
      alert("Une erreur est survenue lors de l'initialisation du paiement. Veuillez réessayer.");
    } finally {
      setIsCheckingOut(false);
      // Réinitialiser le verrouillage de soumission
      isSubmitting.current = false;
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white">Votre panier est vide</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Vous n&apos;avez aucun article dans votre panier.
        </p>
        <Link
          href="/produits"
          className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Continuer mes achats
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-neutral-900 dark:text-white">Votre panier</h1>

      {/* En-tête du tableau (visible uniquement sur desktop) */}
      <div className="hidden md:grid md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Produit</div>
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 text-center">Prix</div>
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 text-center">Quantité</div>
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 text-center">Total</div>
        <div></div>
      </div>

      {/* Liste des produits */}
      <div className="space-y-6 mb-8">
        {cart.items.map((item, index) => (
          <div key={`${item.productId}-${item.variantId || ''}-${index}`} className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 py-6 border-b border-neutral-200 dark:border-neutral-800">
            {/* Produit */}
            <div className="flex items-center">
              <div className="w-20 h-20 flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden relative">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 80px, 80px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-neutral-900 dark:text-white font-medium">
                  <Link href={`/produits/${item.slug}`} className="hover:text-primary">
                    {item.name}
                  </Link>
                </h3>
                {item.weight && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Poids: {item.weight}g
                  </p>
                )}
              </div>
            </div>

            {/* Prix */}
            <div className="flex md:justify-center items-center">
              <span className="md:hidden text-sm text-neutral-600 dark:text-neutral-400 mr-2">Prix:</span>
              <span className="text-neutral-900 dark:text-white">{formatPrice(item.price)}</span>
            </div>

            {/* Quantité */}
            <div className="flex md:justify-center items-center">
              <span className="md:hidden text-sm text-neutral-600 dark:text-neutral-400 mr-2">Quantité:</span>
              <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-md">
                <button
                  onClick={() => handleQuantityChange(index, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-400"
                  aria-label="Diminuer la quantité"
                >
                  -
                </button>
                <span className="w-10 text-center text-neutral-900 dark:text-white">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(index, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-400"
                  aria-label="Augmenter la quantité"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="flex md:justify-center items-center">
              <span className="md:hidden text-sm text-neutral-600 dark:text-neutral-400 mr-2">Total:</span>
              <span className="text-neutral-900 dark:text-white font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>

            {/* Supprimer */}
            <div className="flex md:justify-center items-center">
              <button
                onClick={() => handleRemoveItem(index)}
                className="text-red-500 hover:text-red-600 focus:outline-none"
                aria-label="Supprimer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Récapitulatif et actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-start-2">
          <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">Récapitulatif</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Sous-total</span>
                <span className="text-neutral-900 dark:text-white">{formatPrice(cart.subtotal)}</span>
              </div>
              
              {/* Calcul des frais de livraison */}
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Livraison</span>
                <span className="text-neutral-900 dark:text-white">
                  {customerInfo.country === 'Belgique' ? formatPrice(10) : cart.subtotal >= 49 ? 'Gratuit' : formatPrice(4.95)}
                </span>
              </div>
              
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex justify-between">
                <span className="font-bold text-neutral-900 dark:text-white">Total</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {formatPrice(cart.subtotal + (customerInfo.country === 'Belgique' ? 10 : cart.subtotal >= 49 ? 0 : 4.95))}
                </span>
              </div>
              
              {customerInfo.country !== 'Belgique' && cart.subtotal < 49 && (
                <div className="text-xs text-green-600 mt-1">
                  Plus que {formatPrice(49 - cart.subtotal)} pour bénéficier de la livraison gratuite
                </div>
              )}
            </div>
            
            {!checkoutMode ? (
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-md font-medium transition-colors"
                >
                  Procéder au paiement
                </button>
                
                <Link
                  href="/produits"
                  className="block text-center w-full text-primary hover:text-primary-dark py-2 transition-colors"
                >
                  Continuer mes achats
                </Link>
              </div>
            ) : (
              <>
                {isAuthenticated && userAddresses.length > 0 && (
                <div className="mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                  <h3 className="text-base font-bold mb-3 text-neutral-800 dark:text-neutral-200">Vos adresses de livraison</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {userAddresses.map((address) => (
                      <div 
                        key={address.id} 
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedAddressId === address.id 
                          ? 'border-primary bg-primary bg-opacity-5 dark:bg-opacity-10' 
                          : 'border-neutral-300 dark:border-neutral-700 hover:border-primary'}`}
                        onClick={() => handleSelectAddress(address)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <MapPin size={14} className="text-primary mr-1" />
                            <span className="text-sm font-medium">Adresse de livraison</span>
                          </div>
                          {address.isDefault && (
                            <div className="bg-primary bg-opacity-10 text-primary text-xs rounded px-1.5 py-0.5 flex items-center">
                              <CheckCircle size={10} className="mr-1" /> Par défaut
                            </div>
                          )}
                        </div>
                        <p className="font-medium text-sm">{address.name}</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">{address.line1}</p>
                        {address.line2 && <p className="text-xs text-neutral-600 dark:text-neutral-400">{address.line2}</p>}
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
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
                
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <h3 className="font-medium text-lg text-neutral-900 dark:text-white">Informations de contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Prénom</label>
                    <input
                      type="text"
                      name="firstName"
                      value={customerInfo.firstName}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${errors.firstName ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} bg-white dark:bg-neutral-800`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Nom</label>
                    <input
                      type="text"
                      name="lastName"
                      value={customerInfo.lastName}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${errors.lastName ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} bg-white dark:bg-neutral-800`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} bg-white dark:bg-neutral-800`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} bg-white dark:bg-neutral-800`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Adresse</label>
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} bg-white dark:bg-neutral-800`}
                    placeholder="Rue et numéro"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Complément d&rsquo;adresse <span className="text-xs text-neutral-500">(optionnel)</span></label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={customerInfo.addressLine2}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                    placeholder="Appartement, bâtiment, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Code Postal</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={customerInfo.postalCode}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${errors.postalCode ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} bg-white dark:bg-neutral-800`}
                    />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Ville</label>
                    <input
                      type="text"
                      name="city"
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'} bg-white dark:bg-neutral-800`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">Pays</label>
                  <select
                    name="country"
                    value={customerInfo.country}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full p-2 border rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Luxembourg">Luxembourg</option>
                  </select>
                </div>
                
                <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                  En passant commande, vous acceptez nos <Link href="/conditions-generales" className="text-primary hover:underline">conditions générales de vente</Link> et reconnaissez notre <Link href="/confidentialite" className="text-primary hover:underline">politique de confidentialité</Link>.
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isCheckingOut}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-70"
                  >
                    {isCheckingOut ? 'Traitement en cours...' : 'Finaliser le paiement'}
                  </button>
                  
                  {!isCheckingOut && (
                    <button
                      type="button"
                      onClick={() => setCheckoutMode(false)}
                      className="w-full text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 py-2 mt-2 transition-colors"
                    >
                      Retour au panier
                    </button>
                  )}
                  
                  {/* Suggestion de création de compte pour clients invités */}
                  {!isAuthenticated && !isCheckingOut && (
                    <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="text-center">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                          Créez un compte pour sauvegarder vos adresses et suivre facilement vos commandes
                        </p>
                        <Link 
                          href="/inscription"
                          className="inline-block text-primary hover:text-primary-dark text-sm font-medium hover:underline"
                        >
                          Créer un compte en quelques secondes
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </form>
              </>
            )}
          </div>
        </div>
        
        <div className="lg:col-start-1 lg:row-start-1">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={clearCart}
              className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 py-2 px-4 rounded-md transition-colors"
            >
              Vider le panier
            </button>
            
            {/* {!cart.shipping && (
              <Link
                href="/livraison"
                className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 py-2 px-4 rounded-md transition-colors"
              >
                Calculer les frais de livraison
              </Link>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
