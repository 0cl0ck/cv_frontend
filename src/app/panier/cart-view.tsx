'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartContext } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import apiConfig from '@/config/api';
import { MapPin, CheckCircle, Gift, Truck, AlertCircle } from 'lucide-react';

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
  phone?: string;
  isDefault: boolean;
}

export default function CartView() {
  const { cart, updateQuantity, removeItem, clearCart } = useCartContext();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const isSubmitting = useRef(false);
  
  // État pour les avantages du programme de fidélité
  const [loyaltyBenefits, setLoyaltyBenefits] = useState<{
    active: boolean;
    message: string;
    discountAmount: number;
    rewardType: 'none' | 'sample' | 'freeShipping' | 'freeProduct' | 'discount';
  }>({ 
    active: false, 
    message: '', 
    discountAmount: 0,
    rewardType: 'none' 
  });
  const [loadingLoyalty, setLoadingLoyalty] = useState(false);
  
  // État pour la gestion des codes promotionnels
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{
    applied: boolean;
    code: string;
    discount: number;
    message: string;
    type: 'percentage' | 'fixed' | 'free_shipping' | '';
  }>({
    applied: false,
    code: '',
    discount: 0,
    message: '',
    type: ''
  });
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  
  // État pour les adresses enregistrées
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Appliquer un code promo
  const handleApplyPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) return;
    
    try {
      setIsApplyingPromo(true);
      
      // Calcul des frais de livraison
      const shippingCost = customerInfo.country === 'Belgique' 
        ? 10 
        : cart.subtotal >= 49 ? 0 : 4.95;
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/cart/apply-promo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promoCode: promoCode.trim(),
          cartTotal: cart.subtotal,
          shippingCost
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.valid) {
        setPromoResult({
          applied: true,
          code: result.code,
          discount: result.discount,
          message: result.message,
          type: result.type
        });
      } else {
        setPromoResult({
          applied: false,
          code: '',
          discount: 0,
          message: result.message || 'Code promo invalide',
          type: ''
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'application du code promo:', error);
      setPromoResult({
        applied: false,
        code: '',
        discount: 0,
        message: 'Erreur technique lors de l\'application du code',
        type: ''
      });
    } finally {
      setIsApplyingPromo(false);
    }
  };
  
  // Annuler un code promo appliqué
  const handleCancelPromoCode = () => {
    setPromoResult({
      applied: false,
      code: '',
      discount: 0,
      message: '',
      type: ''
    });
    setPromoCode('');
  };

  // Vérifier si l'utilisateur est authentifié et récupérer les avantages de fidélité
  useEffect(() => {
    async function checkLoyaltyBenefits() {
      try {
        // Vérifier si le cookie d'authentification existe
        const cookies = document.cookie.split(';');
        
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('payload-token='));
        
        if (!authCookie) {
          // Utilisateur non connecté
          setIsAuthenticated(false);
          return;
        }
        
        // Utilisateur connecté
        setIsAuthenticated(true);
        setLoadingLoyalty(true);
        
        // Extraire le token JWT du cookie
        const token = authCookie.split('=')[1]?.trim();
        
        // Récupérer les informations du programme de fidélité
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        
        // Détails de la requête
        const requestData = {
          cartTotal: cart.subtotal,
          shippingCost: customerInfo.country === 'Belgique' ? 10 : cart.subtotal >= 49 ? 0 : 4.95,
          items: cart.items
        };
        
        const loyaltyResponse = await fetch(`${backendUrl}/api/cart/apply-loyalty`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include', // Inclure les cookies dans la requête
          body: JSON.stringify(requestData)
        });
        

        
        if (loyaltyResponse.ok) {
          const loyaltyData = await loyaltyResponse.json();
          
          // Gestion des avantages de fidélité pour le panier actuel
          if (loyaltyData.reward && loyaltyData.reward.type !== 'none') {

            
            setLoyaltyBenefits({
              active: true,
              message: loyaltyData.reward.message,
              discountAmount: loyaltyData.discount || 0,
              rewardType: loyaltyData.reward.type
            });
          } else {
            console.log('Aucun avantage de fidélité applicable au panier');
            
            // Même si aucun avantage n'est applicable au panier,
            // nous pouvons montrer le nombre de commandes validées
            if (loyaltyData.orderCount) {
              console.log(`Progression de fidélité: ${loyaltyData.orderCount} commande(s) validée(s)`);
            }
          }
        } else {
          // En cas d'erreur, tenter de lire le message d'erreur
          try {
            const errorData = await loyaltyResponse.json();
            console.error('Erreur de fidélité:', errorData);
          } catch (parseError) {
            console.error('Impossible de parser la réponse d\'erreur:', parseError);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des avantages de fidélité:', error);
        if (error instanceof Error) {
          console.error('Détails de l\'erreur:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        }
      } finally {
        setLoadingLoyalty(false);
      }
    }
    
    // N'exécuter que si le panier contient des articles
    if (cart.items.length > 0) {
      checkLoyaltyBenefits();
    }
  }, [cart.subtotal, cart.items, customerInfo.country]);
  
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
      country: address.country || 'France',
      phone: address.phone || prevInfo.phone // Conserver le téléphone existant si l'adresse n'en a pas
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const shippingCostCents = customerInfo.country === 'Belgique'
        ? 1000
        : cart.subtotal >= 49
          ? 0
          : 495;
      
      const totalCents = cart.subtotalCents ;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          amount: cart.subtotal 
            - (loyaltyBenefits.active ? loyaltyBenefits.discountAmount : 0)
            - (promoResult.applied ? promoResult.discount : 0)
            + (customerInfo.country === 'Belgique' 
                ? (promoResult.applied && promoResult.type === 'free_shipping' ? 0 : 10) 
                : (cart.subtotal >= 49 || (promoResult.applied && promoResult.type === 'free_shipping')) 
                  ? 0 
                  : 4.95),
          amountCents: Math.round(100 * (cart.subtotal 
            - (loyaltyBenefits.active ? loyaltyBenefits.discountAmount : 0)
            - (promoResult.applied ? promoResult.discount : 0)
            + (customerInfo.country === 'Belgique' 
                ? (promoResult.applied && promoResult.type === 'free_shipping' ? 0 : 10) 
                : (cart.subtotal >= 49 || (promoResult.applied && promoResult.type === 'free_shipping')) 
                  ? 0 
                  : 4.95))),
          subtotal: cart.subtotal,
          subtotalCents: cart.subtotalCents,
          shippingCost: customerInfo.country === 'Belgique' 
            ? (promoResult.applied && promoResult.type === 'free_shipping' ? 0 : 10) 
            : (cart.subtotal >= 49 || (promoResult.applied && promoResult.type === 'free_shipping'))
              ? 0
              : 4.95,
          shippingCostCents: customerInfo.country === 'Belgique' 
            ? (promoResult.applied && promoResult.type === 'free_shipping' ? 0 : 1000) 
            : (cart.subtotal >= 49 || (promoResult.applied && promoResult.type === 'free_shipping'))
              ? 0
              : 495,
          customerEmail: customerInfo.email,
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          customerPhone: customerInfo.phone,
          // Informations sur le code promo
          promoCode: promoResult.applied ? promoResult.code : null,
          promoDiscount: promoResult.applied ? promoResult.discount : 0,
          promoDiscountCents: promoResult.applied ? Math.round(promoResult.discount * 100) : 0,
          // Informations sur la fidélité
          loyaltyDiscount: loyaltyBenefits.active ? loyaltyBenefits.discountAmount : 0,
          loyaltyDiscountCents: loyaltyBenefits.active ? Math.round(loyaltyBenefits.discountAmount * 100) : 0
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
      <div className="container mx-auto flex flex-col items-center justify-center h-full min-h-[60vh] px-4 text-center bg-[#001E27]">
        <div>
          <h1 className="text-3xl font-bold mb-6 text-[#F4F8F5]">Votre panier est vide</h1>
          <p className="text-[#F4F8F5] mb-8">
            Vous n&apos;avez aucun article dans votre panier.
          </p>
          <Link
            href="/produits"
            className="inline-block bg-[#EFC368] hover:bg-[#D3A74F] text-[#001E27] px-6 py-3 rounded-md font-medium transition-colors"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#001E27]">
      <h1 className="text-3xl font-bold mb-8 text-[#F4F8F5]">Votre panier</h1>

      {/* En-tête du tableau (visible uniquement sur desktop) */}
      <div className="hidden md:grid md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 mb-4 pb-4 border-b border-[#3A4A4F]">
        <div className="text-sm font-medium text-[#F4F8F5]">Produit</div>
        <div className="text-sm font-medium text-[#F4F8F5] text-center">Prix</div>
        <div className="text-sm font-medium text-[#F4F8F5] text-center">Quantité</div>
        <div className="text-sm font-medium text-[#F4F8F5] text-center">Total</div>
        <div></div>
      </div>

      {/* Liste des produits */}
      <div className="space-y-6 mb-8">
        {cart.items.map((item, index) => (
          <div key={`${item.productId}-${item.variantId || ''}-${index}`} className="md:grid md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 py-6 border-b border-[#3A4A4F]">
            {/* Vue Mobile */}
            <div className="md:hidden">
              <div className="flex items-center mb-4">
                {/* Image plus grande pour mobile */}
                <div className="w-24 h-24 flex-shrink-0 bg-[#002935] rounded-md overflow-hidden relative">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 96px, 96px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-[#F4F8F5] font-medium text-lg">
                    <Link href={`/produits/${item.slug}`} className="hover:text-[#D3A74F]">
                      {item.name}
                    </Link>
                  </h3>
                  {/* Badge pour le poids */}
                  {item.weight && (
                    <span className="inline-block mt-1 px-2 py-1 bg-[#002935] text-xs text-[#F4F8F5] rounded-full border border-[#3A4A4F]">
                      {item.weight}g
                    </span>
                  )}
                </div>
                {/* Bouton de suppression avec meilleur style */}
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="p-2 bg-[#481818] text-red-500 hover:bg-red-900 hover:text-white rounded-full focus:outline-none transition-colors"
                  aria-label="Supprimer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
              
              {/* Informations plus claires pour mobile */}
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="bg-[#002935] p-3 rounded-md">
                  <span className="block text-xs text-[#8A9A9D] mb-1">Prix unitaire</span>
                  <span className="text-[#F4F8F5] font-medium">{formatPrice(item.price)}</span>
                </div>
                
                <div className="bg-[#002935] p-3 rounded-md">
                  <span className="block text-xs text-[#8A9A9D] mb-1">Total</span>
                  <span className="text-[#F4F8F5] font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>

              {/* Contrôles de quantité améliorés pour mobile */}
              <div className="mt-4 flex justify-center">
                <div className="flex items-center border border-[#3A4A4F] rounded-lg bg-[#002935] p-1">
                  <button
                    onClick={() => handleQuantityChange(index, item.quantity - 1)}
                    className="w-12 h-12 flex items-center justify-center text-[#F4F8F5] text-xl rounded-md hover:bg-[#10354b]"
                    aria-label="Diminuer la quantité"
                  >
                    -
                  </button>
                  <span className="w-16 text-center text-[#F4F8F5] font-medium text-lg">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(index, item.quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-[#F4F8F5] text-xl rounded-md hover:bg-[#10354b]"
                    aria-label="Augmenter la quantité"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Vue Desktop */}
            <div className="hidden md:flex md:items-center">
              <div className="w-20 h-20 flex-shrink-0 bg-[#002935] rounded-md overflow-hidden relative">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-[#F4F8F5] font-medium">
                  <Link href={`/produits/${item.slug}`} className="hover:text-[#D3A74F]">
                    {item.name}
                  </Link>
                </h3>
                {item.weight && (
                  <p className="text-sm text-[#F4F8F5]">
                    Poids: {item.weight}g
                  </p>
                )}
              </div>
            </div>

            {/* Prix - Desktop */}
            <div className="hidden md:flex md:justify-center md:items-center">
              <span className="text-[#F4F8F5]">{formatPrice(item.price)}</span>
            </div>

            {/* Quantité - Desktop */}
            <div className="hidden md:flex md:justify-center md:items-center">
              <div className="flex items-center border border-[#3A4A4F] rounded-md">
                <button
                  onClick={() => handleQuantityChange(index, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center text-[#F4F8F5]"
                  aria-label="Diminuer la quantité"
                >
                  -
                </button>
                <span className="w-10 text-center text-[#F4F8F5]">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(index, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-[#F4F8F5]"
                  aria-label="Augmenter la quantité"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total - Desktop */}
            <div className="hidden md:flex md:justify-center md:items-center">
              <span className="text-[#F4F8F5] font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>

            {/* Supprimer - Desktop */}
            <div className="hidden md:flex md:justify-center md:items-center">
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
          <div className="bg-[#002935] p-6 rounded-lg border border-[#3A4A4F]">
            {/* Section Code Promo */}
            <div className="mb-6 pb-6 border-b border-[#3A4A4F]">
              <h2 className="text-lg font-bold mb-3 text-[#F4F8F5]">Code Promotionnel</h2>
              
              {!promoResult.applied ? (
                <form onSubmit={handleApplyPromoCode} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Entrez votre code"
                    className="flex-grow p-2 border rounded border-[#3A4A4F] bg-[#001E27] text-[#F4F8F5] text-sm"
                    disabled={isApplyingPromo}
                  />
                  <button
                    type="submit"
                    disabled={isApplyingPromo || !promoCode.trim()}
                    className="bg-[#EFC368] hover:bg-[#D3A74F] text-[#001E27] px-3 py-2 rounded-md font-medium transition-colors disabled:opacity-70 text-sm whitespace-nowrap"
                  >
                    {isApplyingPromo ? 'Application...' : 'Appliquer'}
                  </button>
                </form>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-[#10B981] font-medium mr-2">✓</span>
                      <span className="text-[#F4F8F5]">
                        Code <span className="font-bold">{promoResult.code}</span> appliqué
                      </span>
                    </div>
                    <button 
                      onClick={handleCancelPromoCode}
                      className="text-[#F4F8F5] hover:text-red-400 text-sm"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              )}
              
              {promoResult.message && !promoResult.applied && (
                <div className="mt-2 p-2 rounded text-sm bg-red-900 bg-opacity-20 text-red-400">
                  {promoResult.message}
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold mb-4 text-[#F4F8F5]">Récapitulatif</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-[#F4F8F5]">Sous-total</span>
                <span className="text-[#F4F8F5]">{formatPrice(cart.subtotal)}</span>
              </div>
              
              {/* Calcul des frais de livraison */}
              <div className="flex justify-between">
                <span className="text-[#F4F8F5]">Livraison</span>
                <span className="text-[#F4F8F5]">
                  {customerInfo.country === 'Belgique' ? formatPrice(10) : cart.subtotal >= 49 ? 'Gratuit' : formatPrice(4.95)}
                </span>
              </div>
              
              {/* Section Avantages Fidélité */}
              {isAuthenticated && (
                <div className="mt-3">
                  {loadingLoyalty ? (
                    <div className="text-sm text-[#F4F8F5] italic">Vérification du programme fidélité...</div>
                  ) : loyaltyBenefits.active ? (
                    <div className="bg-[#03745C] bg-opacity-20 border border-[#03745C] rounded-md p-3 mt-2">
                      <div className="flex items-center text-[#10B981] font-medium mb-1">
                        {loyaltyBenefits.rewardType === 'freeProduct' && <Gift size={18} className="mr-2" />}
                        {loyaltyBenefits.rewardType === 'freeShipping' && <Truck size={18} className="mr-2" />}
                        {(loyaltyBenefits.rewardType === 'discount' || loyaltyBenefits.rewardType === 'sample') && 
                          <Gift size={18} className="mr-2" />}
                        Avantage fidélité appliqué!
                      </div>
                      <p className="text-sm text-[#F4F8F5]">{loyaltyBenefits.message}</p>
                      {loyaltyBenefits.discountAmount > 0 && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-[#F4F8F5]">Réduction</span>
                          <span className="text-[#10B981]">-{formatPrice(loyaltyBenefits.discountAmount)}</span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
              
              {/* Affichage de la réduction du code promo */}
              {promoResult.applied && promoResult.discount > 0 && (
                <div className="flex justify-between mt-3">
                  <span className="text-[#F4F8F5]">Code promo ({promoResult.code})</span>
                  <span className="text-[#10B981]">-{formatPrice(promoResult.discount)}</span>
                </div>
              )}
              
              {!isAuthenticated && (
                <div className="mt-3 bg-[#002935] border border-[#3A4A4F] rounded-md p-3">
                  <div className="flex items-center text-[#F4F8F5] mb-1">
                    <AlertCircle size={16} className="mr-2 text-[#EFC368]" />
                    <span className="font-medium">Programme de fidélité</span>
                  </div>
                  <p className="text-xs text-[#F4F8F5] mb-2">Connectez-vous pour bénéficier d&apos;avantages exclusifs selon votre historique de commandes.</p>
                  <Link href="/connexion" className="text-[#EFC368] text-xs hover:underline">
                    Se connecter pour en profiter
                  </Link>
                </div>
              )}
              
              <div className="border-t border-[#3A4A4F] pt-3 flex justify-between">
                <span className="font-bold text-[#F4F8F5]">Total</span>
                <span className="font-bold text-[#F4F8F5]">
                  {formatPrice(
                    // Sous-total
                    cart.subtotal 
                    // Moins réduction fidélité
                    - (loyaltyBenefits.active ? loyaltyBenefits.discountAmount : 0)
                    // Moins réduction code promo
                    - (promoResult.applied ? promoResult.discount : 0)
                    // Plus frais de livraison (gratuit si code promo de type free_shipping ou si conditions remplies)
                    + (customerInfo.country === 'Belgique' 
                        ? (promoResult.applied && promoResult.type === 'free_shipping' ? 0 : 10) 
                        : (cart.subtotal >= 49 || (promoResult.applied && promoResult.type === 'free_shipping')) 
                          ? 0 
                          : 4.95)
                  )}
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
                  className="w-full pointer bg-[#EFC368] hover:bg-[#D3A74F] text-[#001E27] py-3 px-4 rounded-md font-medium transition-colors"
                >
                  Procéder au paiement
                </button>
                
                <Link
                  href="/produits"
                  className="block text-center w-full text-[#F4F8F5] hover:text-green-400 py-2 transition-colors"
                >
                  Continuer mes achats
                </Link>
              </div>
            ) : (
              <>
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
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <MapPin size={14} className="text-[#001E27] mr-1" />
                            <span className="text-sm font-medium">Adresse de livraison</span>
                          </div>
                          {address.isDefault && (
                            <div className="bg-[#001E27] bg-opacity-10 text-[#001E27] text-xs rounded px-1.5 py-0.5 flex items-center">
                              <CheckCircle size={10} className="mr-1" /> Par défaut
                            </div>
                          )}
                        </div>
                        <p className="font-medium text-sm">{address.name}</p>
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
                
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <h3 className="font-medium text-lg text-[#F4F8F5]">Informations de contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#F4F8F5]">Prénom</label>
                    <input
                      type="text"
                      name="firstName"
                      value={customerInfo.firstName}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${errors.firstName ? 'border-red-500' : 'border-[#3A4A4F]'} bg-[#002935]`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#F4F8F5]">Nom</label>
                    <input
                      type="text"
                      name="lastName"
                      value={customerInfo.lastName}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${errors.lastName ? 'border-red-500' : 'border-[#3A4A4F]'} bg-[#002935]`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#F4F8F5]">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-[#3A4A4F]'} bg-[#002935]`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#F4F8F5]">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-[#3A4A4F]'} bg-[#002935]`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#F4F8F5]">Adresse</label>
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : 'border-[#3A4A4F]'} bg-[#002935]`}
                    placeholder="Rue et numéro"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#F4F8F5]">Complément d&rsquo;adresse <span className="text-xs text-neutral-500">(optionnel)</span></label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={customerInfo.addressLine2}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded border-[#3A4A4F] bg-[#002935]"
                    placeholder="Appartement, bâtiment, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#F4F8F5]">Code Postal</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={customerInfo.postalCode}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${errors.postalCode ? 'border-red-500' : 'border-[#3A4A4F]'} bg-[#002935]`}
                    />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#F4F8F5]">Ville</label>
                    <input
                      type="text"
                      name="city"
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded ${errors.city ? 'border-red-500' : 'border-[#3A4A4F]'} bg-[#002935]`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#F4F8F5]">Pays</label>
                  <select
                    name="country"
                    value={customerInfo.country}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full p-2 border rounded border-[#3A4A4F] bg-[#002935]"
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Luxembourg">Luxembourg</option>
                  </select>
                </div>
                
                <div className="text-xs text-[#F4F8F5] mt-2">
                  En passant commande, vous acceptez nos <Link href="/conditions-generales" className="text-[#03745C] hover:underline">conditions générales de vente</Link> et reconnaissez notre <Link href="/confidentialite" className="text-[#03745C] hover:underline">politique de confidentialité</Link>.
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isCheckingOut}
                    className="w-full bg-[#EFC368] hover:bg-[#D3A74F] text-[#001E27] py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-70"
                  >
                    {isCheckingOut ? 'Traitement en cours...' : 'Finaliser le paiement'}
                  </button>
                  
                  {!isCheckingOut && (
                    <button
                      type="button"
                      onClick={() => setCheckoutMode(false)}
                      className="w-full text-[#F4F8F5] hover:text-[#F4F8F5] py-2 mt-2 transition-colors"
                    >
                      Retour au panier
                    </button>
                  )}
                  
                  {/* Suggestion de création de compte pour clients invités */}
                  {!isAuthenticated && !isCheckingOut && (
                    <div className="mt-6 pt-4 border-t border-[#3A4A4F]">
                      <div className="text-center">
                        <p className="text-sm text-[#F4F8F5] mb-2">
                          Créez un compte pour sauvegarder vos adresses et suivre facilement vos commandes
                        </p>
                        <Link 
                          href="/inscription"
                          className="inline-block text-[#03745C] hover:text-[#03745C] text-sm font-medium hover:underline"
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
              className="bg-[#002935] hover:bg-[#003a4d] border border-[#3A4A4F] text-[#F4F8F5] py-2 px-4 rounded-md transition-colors"
            >
              Vider le panier
            </button>
            
            {/* {!cart.shipping && (
              <Link
                href="/livraison"
                className="bg-[#002935] hover:bg-[#003a4d] border border-[#3A4A4F] text-[#F4F8F5] py-2 px-4 rounded-md transition-colors"
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
