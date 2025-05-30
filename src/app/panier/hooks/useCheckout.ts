'use client';

import { useRef, useState } from 'react';
import { Cart } from '@/app/panier/types';
import { PromoResult, LoyaltyBenefits, CustomerInfo } from '../types';
import { calculateTotalPrice } from '@/utils/priceCalculations';
import { secureLogger as logger } from '@/utils/logger';
import { httpClient } from '@/lib/httpClient';

interface UseCheckoutReturn {
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  errors: Record<string, string>;
}

export default function useCheckout(
  cart: Cart,
  promoResult: PromoResult,
  loyaltyBenefits: LoyaltyBenefits,
  customerInfo: CustomerInfo,
  clearCart: () => void,
  setErrors?: (errors: Record<string, string>) => void // Nouveau paramètre pour mettre à jour les erreurs dans le composant parent
): UseCheckoutReturn {
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    
    // Réinitialiser les erreurs
    const newErrors: Record<string, string> = {};
    
    // Validation des données avant envoi
    // Vérification informations personnelles
    if (!customerInfo.firstName) newErrors.firstName = "Le prénom est requis";
    if (!customerInfo.lastName) newErrors.lastName = "Le nom est requis";
    if (!customerInfo.email) newErrors.email = "L'email est requis";
    
    // Vérification de l'adresse
    if (!customerInfo.address) newErrors.address = "L'adresse est requise";
    if (!customerInfo.city) newErrors.city = "La ville est requise";
    if (!customerInfo.postalCode) newErrors.postalCode = "Le code postal est requis";
    
    // Vérification du téléphone (format français : 10 chiffres commençant par 0)
    if (!customerInfo.phone) {
      newErrors.phone = "Le numéro de téléphone est requis";
    } else {
      const phoneDigits = customerInfo.phone.replace(/\D/g, '');
      if (!/^0\d{9}$/.test(phoneDigits)) {
        newErrors.phone = "Format invalide (ex: 0612345678)";
      }
    }
    
    // Si des erreurs sont présentes, on les affiche et on arrête la soumission
    if (Object.keys(newErrors).length > 0) {
      // Mettre à jour l'état des erreurs local
      setFormErrors(newErrors);
      
      // Si une fonction pour mettre à jour les erreurs parent est fournie, l'utiliser
      if (setErrors) {
        setErrors(newErrors);
      }
      
      // Faire défiler vers le premier champ avec erreur
      const firstErrorField = document.querySelector(`[name="${Object.keys(newErrors)[0]}"]`);
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }
    
    // Aucune erreur, on continue la soumission
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    // Réinitialiser les erreurs
    setFormErrors({});
    if (setErrors) setErrors({});

    try {
      // Utiliser l'utilitaire centralisé pour calculer tous les éléments de prix
      const priceDetails = calculateTotalPrice(cart, customerInfo.country, loyaltyBenefits, promoResult);

      // Décodage token
      const token = document.cookie
        .split('; ')
        .find(r => r.startsWith('payload-token='))
        ?.split('=')[1] || '';
      let userId: string | null = null;
      let isCustomer = false;
      let userEmail: string | null = null;
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
          if (payload.collection === 'customers' && payload.id) {
            userId = payload.id;
            userEmail = payload.email;
            isCustomer = true;
          }
        }
      } catch {}

      // ✅ RÈGLE 1 & 2 : Les utilisateurs connectés DOIVENT utiliser leur email de compte
      if (isCustomer && userEmail) {
        // Forcer l'utilisation de l'email du compte pour la fidélité
        if (customerInfo.email !== userEmail) {
          logger.warn('Email du formulaire différent de l\'email du compte', {
            formEmail: customerInfo.email,
            accountEmail: userEmail
          });
          // On utilise l'email du compte comme source de vérité pour la fidélité
          customerInfo.email = userEmail;
        }
      }

      // Utiliser le montant total calculé par l'utilitaire (déjà validé comme positif)
      const finalAmount = Math.max(0.01, priceDetails.total);
      
      // Log pour vérifier les données avant envoi
      logger.debug('Données de paiement à envoyer', {
        finalAmount,
        customerId: userId || null
      });

      const checkoutData = {
        order: {
          status: 'pending',
          total: finalAmount,
          items: cart.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            title: item.name,
            price: item.price,
            priceCents: item.priceCents,
            quantity: item.quantity,
            attributes: {}
          })),
          // ✅ RÈGLE 1 : Utilisateurs connectés = commande associée au compte
          ...(isCustomer && userId ? { customer: userId } : {}),
          guestInformation: {
            // ✅ RÈGLE 2 : Email = identifiant fidélité (automatiquement celui du compte si connecté)
            email: customerInfo.email, // Déjà forcé à userEmail pour les utilisateurs connectés
            firstName: customerInfo.firstName,
            lastName: customerInfo.lastName,
            phone: customerInfo.phone
          },
          // ✅ RÈGLE 3 : Formulaire = source de vérité pour les adresses et détails de commande
          billingAddress: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            line1: customerInfo.address,
            line2: customerInfo.addressLine2,
            city: customerInfo.city,
            postalCode: customerInfo.postalCode,
            country: customerInfo.country
          },
          shippingAddress: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            line1: customerInfo.address,
            line2: customerInfo.addressLine2,
            city: customerInfo.city,
            postalCode: customerInfo.postalCode,
            country: customerInfo.country
          },
          shipping: { method: '67fffcd911f3717499195edf', cost: priceDetails.shippingCost },
          subtotal: priceDetails.subtotal,
          loyaltyDiscount: priceDetails.loyaltyDiscount,
          promoDiscount: priceDetails.promoDiscount,
          notes: ''
        },
        payment: {
          amount: finalAmount,
          amountCents: priceDetails.totalCents,
          currency: 'EUR',
          // ✅ RÈGLE 4 : Email de contact libre (peut être différent de l'email du compte)
          customerEmail: customerInfo.email, // Pour les notifications
          customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
          promoCode: promoResult.applied ? promoResult.code : undefined,
          discountAmount: priceDetails.loyaltyDiscount + priceDetails.promoDiscount
        }
      };

      // Log pour vérifier la cohérence des règles
      logger.info('✅ Vérification des règles de checkout', {
        isAuthenticated: isCustomer,
        userAccountEmail: userEmail,
        checkoutEmail: customerInfo.email,
        emailsMatch: userEmail === customerInfo.email,
        customerLinked: !!(isCustomer && userId),
        loyaltyEmail: customerInfo.email // Email utilisé pour la fidélité
      });

      // Faire la requête via httpClient pour éviter les problèmes CORS
      const response = await httpClient.post('/payment/create', checkoutData, {
        withCsrf: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      // httpClient retourne la réponse axios, donc nous avons besoin de response.data
      const paymentResponse = response.data as { smartCheckoutUrl?: string };
      if (paymentResponse.smartCheckoutUrl) {
        clearCart();
        window.location.href = paymentResponse.smartCheckoutUrl;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      
      // Analyser l'erreur pour voir si c'est un problème de validation
      try {
        // Avec axios, les erreurs HTTP sont dans err.response.data
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { details?: Record<string, string>, message?: string } } };
          const errorData = axiosError.response?.data;
          
          if (errorData?.details && errorData.details['order.guestInformation.phone']) {
            // Erreur spécifique de validation de téléphone
            const phoneError = { phone: errorData.details['order.guestInformation.phone'] };
            setFormErrors(phoneError);
            if (setErrors) setErrors(phoneError);
            
            // Faire défiler jusqu'au champ de téléphone
            const phoneField = document.querySelector('[name="phone"]');
            if (phoneField) {
              phoneField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } else if (errorData?.message) {
            // Autres erreurs du serveur avec message
            const generalError = { general: errorData.message };
            setFormErrors(generalError);
            if (setErrors) setErrors(generalError);
          } else {
            // Erreur générique
            const generalError = { general: "Erreur lors de l'initialisation du paiement." };
            setFormErrors(generalError);
            if (setErrors) setErrors(generalError);
          }
        } else {
          // Erreur non-axios (réseau, etc.)
          const generalError = { general: "Erreur de connexion au serveur." };
          setFormErrors(generalError);
          if (setErrors) setErrors(generalError);
        }
      } catch {
        // Erreur pendant l'analyse de l'erreur
        const generalError = { general: "Erreur lors de l'initialisation du paiement." };
        setFormErrors(generalError);
        if (setErrors) setErrors(generalError);
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit, errors: formErrors };
}
