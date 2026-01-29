'use client';

import { useRef, useState } from 'react';
import { Cart } from '@/app/panier/types';
import { PromoResult, LoyaltyBenefits, CustomerInfo, PaymentMethod } from '../types';
import { calculateCartTotals } from '@/lib/pricingClient';
import { secureLogger as logger } from '@/utils/logger';
import { httpClient } from '@/lib/httpClient';

interface UseCheckoutReturn {
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  errors: Record<string, string>;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  setGuestCustomerId: (id: string | null) => void;
}

export default function useCheckout(
  cart: Cart,
  promoResult: PromoResult,
  loyaltyBenefits: LoyaltyBenefits,
  customerInfo: CustomerInfo,
  clearCart: () => void,
  setErrors?: (errors: Record<string, string>) => void, // Paramètre pour mettre à jour les erreurs dans le composant parent
  walletApplied?: boolean // Si true, la cagnotte est appliquée au calcul du paiement
): UseCheckoutReturn {
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [guestCustomerId, setGuestCustomerId] = useState<string | null>(null);

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
      // Le backend gère automatiquement: fidélité (JWT), parrainage (cookie), promo (code)
      // Si walletApplied est true, le wallet est déduit du total
      const priceDetails = await calculateCartTotals({
        cart,
        country: customerInfo.country,
        promoCode: promoResult.applied ? promoResult.code : undefined,
        applyWallet: walletApplied,
      });

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
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          if (payload.collection === 'customers' && payload.id) {
            userId = payload.id;
            userEmail = payload.email;
            isCustomer = true;
          }
        }
      } catch { }

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

      // Fonction pour vérifier si un ID est valide au format MongoDB ObjectId
      const isValidMongoId = (id?: string) => id && /^[0-9a-f]{24}$/i.test(id);

      // Transformer les articles pour assurer que les IDs sont compatibles MongoDB
      const transformedItems = cart.items.map(item => {
        // Si c'est un cadeau avec ID non-standard, utiliser un ObjectId factice
        const productId = item.isGift && !isValidMongoId(item.productId)
          ? '000000000000000000000000' // ID factice mais valide pour MongoDB
          : item.productId;

        // Même correction pour variantId si présent
        const variantId = item.variantId && !isValidMongoId(item.variantId)
          ? null // null pour variantId car optionnel
          : item.variantId;

        return {
          productId,
          variantId,
          name: item.name,
          productName: item.name, // Utiliser name comme fallback
          title: item.name, // Utiliser name comme fallback 
          price: item.price,
          priceCents: item.priceCents,
          quantity: item.quantity,
          isGift: item.isGift || false,
          attributes: {}, // Objet vide par défaut,
          // FIX: Ajout du champ variantName manquant qui ne remonte pas jusqu'au backend
          variantName: item.variantName || '',
          sku: item.sku || '',
          // Conservation de l'ID original pour référence métier
          originalGiftId: item.isGift && productId !== item.productId ? item.productId : undefined
        };
      });

      // Créer l'objet de données pour le checkout
      // Déterminer le customerId à utiliser : compte connecté > compte créé depuis guest
      const effectiveCustomerId = isCustomer && userId ? userId : guestCustomerId;

      const checkoutData = {
        order: {
          status: 'pending',
          total: finalAmount,
          items: transformedItems,
          // ✅ RÈGLE 1 : Associer au compte si connecté OU si compte créé depuis guest
          ...(effectiveCustomerId ? { customer: effectiveCustomerId } : {}),
          guestInformation: {
            // ✅ RÈGLE 2 : Email = identifiant fidélité (automatiquement celui du compte si connecté)
            email: customerInfo.email, // Déjà forcé à userEmail pour les utilisateurs connectés
            firstName: customerInfo.firstName,
            lastName: customerInfo.lastName,
            phone: customerInfo.phone
          },
          // ✅ RÈGLE 3 : Adresses complètes et formatées selon le schéma attendu
          billingAddress: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            line1: customerInfo.address,
            line2: customerInfo.addressLine2 || '',  // Champ obligatoire, vide si null
            city: customerInfo.city,
            postalCode: customerInfo.postalCode,
            country: customerInfo.country || 'FR',   // Valeur par défaut FR
            state: ''  // Champ requis par le schéma
          },
          shippingAddress: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            line1: customerInfo.address,
            line2: customerInfo.addressLine2 || '',  // Champ obligatoire, vide si null
            city: customerInfo.city,
            postalCode: customerInfo.postalCode,
            country: customerInfo.country || 'FR',   // Valeur par défaut FR
            state: ''  // Champ requis par le schéma
          },
          shipping: { cost: priceDetails.shippingCost },
          subtotal: priceDetails.subtotal,
          siteDiscount: priceDetails.siteDiscount,
          sitePromotionLabel: priceDetails.appliedSitePromotion?.label,
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
          discountAmount:
            priceDetails.siteDiscount + priceDetails.loyaltyDiscount + priceDetails.promoDiscount + priceDetails.walletDiscount,
          walletDiscount: priceDetails.walletDiscount || 0,
          applyWallet: walletApplied || false, // Flag pour appliquer la cagnotte
          paymentMethod: paymentMethod // 'card' ou 'bank_transfer'
        }
      };

      // Log pour vérifier la cohérence des règles
      logger.info('✅ Vérification des règles de checkout', {
        isAuthenticated: isCustomer,
        userAccountEmail: userEmail,
        checkoutEmail: customerInfo.email,
        emailsMatch: userEmail === customerInfo.email,
        customerLinked: !!effectiveCustomerId,
        guestAccountCreated: !!guestCustomerId,
        loyaltyEmail: customerInfo.email // Email utilisé pour la fidélité
      });

      // **DIAGNOSTIC** - Log détaillé avant envoi
      logger.info('🔍 DIAGNOSTIC FRONTEND: Données envoyées au backend', {
        orderKeys: Object.keys(checkoutData.order),
        paymentKeys: Object.keys(checkoutData.payment),
        hasBillingAddress: !!checkoutData.order.billingAddress,
        hasShippingAddress: !!checkoutData.order.shippingAddress,
        billingAddressKeys: checkoutData.order.billingAddress ? Object.keys(checkoutData.order.billingAddress) : [],
        shippingAddressKeys: checkoutData.order.shippingAddress ? Object.keys(checkoutData.order.shippingAddress) : [],
        shippingFields: checkoutData.order.shipping,
        guestInfoFields: checkoutData.order.guestInformation ? Object.keys(checkoutData.order.guestInformation) : [],
        totalCents: checkoutData.payment.amountCents,
        itemsCount: checkoutData.order.items.length
      });

      // Toujours utiliser /payment/create - le backend gère la méthode
      const response = await httpClient.post('/payment/create', checkoutData, {
        withCsrf: true,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      // Traiter la réponse selon la méthode de paiement
      const paymentResponse = response.data;
      // NOTE: clearCart() est déplacé APRÈS la validation de la redirection
      // pour éviter de vider le panier si le paiement échoue

      if (paymentMethod === 'card') {
        // Pour carte bancaire, redirection vers VivaWallet
        if (paymentResponse.smartCheckoutUrl) {
          // Vider le panier JUSTE AVANT la redirection VivaWallet
          // Si l'utilisateur annule/échoue, il devra refaire son panier
          // (comportement cohérent avec l'expérience e-commerce standard)
          clearCart();
          window.location.href = paymentResponse.smartCheckoutUrl;
        } else {
          throw new Error('URL de paiement VivaWallet non reçue');
        }
      } else if (paymentMethod === 'bank_transfer') {
        const bankDetails = paymentResponse.bankDetails;
        const orderReference = paymentResponse.orderNumber || paymentResponse.orderId;
        if (!bankDetails || !orderReference) {
          throw new Error('Informations de virement incompletes');
        }

        try {
          if (typeof window !== 'undefined') {
            const bankTransferPayload = {
              orderReference,
              orderId: paymentResponse.orderId ?? null,
              bankAccountName: bankDetails.accountName,
              bankIban: bankDetails.iban,
              bankBic: bankDetails.bic,
              orderAmount:
                typeof paymentResponse.amount === 'number' ? paymentResponse.amount : finalAmount,
              currency: typeof paymentResponse.currency === 'string' ? paymentResponse.currency : 'EUR',
              storedAt: Date.now(),
            };
            sessionStorage.setItem('chanvre_vert.bank_transfer', JSON.stringify(bankTransferPayload));
          }
        } catch (storageError) {
          logger.warn("Impossible de sauvegarder les informations de virement", { error: String(storageError) });
        }

        // Vider le panier avant redirection vers la page de confirmation virement
        clearCart();
        window.location.href = `/confirmation/virement?order=${encodeURIComponent(orderReference)}`;
      } else {
        throw new Error('Méthode de paiement non reconnue');
      }
    } catch (err) {
      // Log silencieux pour monitoring (pas d'exposition en console)
      logger.warn('[useCheckout] Checkout error', { error: String(err) });

      // Analyser l'erreur pour voir si c'est un problème de validation
      try {
        // Avec axios, les erreurs HTTP sont dans err.response.data
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { 
            response?: { 
              data?: { 
                details?: Record<string, string>;
                data?: { code?: string; field?: string };
                message?: string;
                errors?: Array<{ message?: string; data?: { code?: string; field?: string } }>;
              } 
            } 
          };
          const errorData = axiosError.response?.data;

          // 🛡️ Gestion des erreurs de validation d'adresse de livraison
          const shippingError = errorData?.errors?.find(e => e.data?.code === 'POSTAL_CODE_MISMATCH');
          if (shippingError || errorData?.data?.code === 'POSTAL_CODE_MISMATCH') {
            const errorMessage = shippingError?.message || errorData?.message || 
              "Le code postal ne correspond pas au pays sélectionné.";
            const postalCodeError = { postalCode: errorMessage };
            setFormErrors(postalCodeError);
            if (setErrors) setErrors(postalCodeError);

            // Faire défiler jusqu'au champ de code postal
            const postalCodeField = document.querySelector('[name="postalCode"]');
            if (postalCodeField) {
              postalCodeField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } else if (errorData?.details && errorData.details['order.guestInformation.phone']) {
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

  return { isSubmitting, handleSubmit, errors: formErrors, paymentMethod, setPaymentMethod, setGuestCustomerId };
}
