'use client';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartContext } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
  weight?: number;
  sku?: string;
  image?: string;
  slug?: string;
};

type CartSummary = {
  items: CartItem[];
  subtotal: number;
  shipping: {
    cost: number;
    method?: {
      id: string;
      name: string;
    };
  };
  total: number;
};

type ShippingMethod = {
  id: string;
  name: string;
  description: string;
  cost: number;
  deliveryTime: string | {
    minDays: number;
    maxDays: number;
    cutoffTime: string;
  };
};

// Type pour la réponse de l'API des méthodes de livraison
interface ShippingMethodResponse {
  id: string;
  name: string;
  description?: string;
  cost?: number;
  deliveryTime?: string | {
    minDays: number;
    maxDays: number;
    cutoffTime: string;
  };
  // Autres propriétés qui pourraient être dans la réponse
  [key: string]: string | number | boolean | object | undefined;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1); // Étape 1 ou 2
  const { cart: cartContext, setShippingMethod, clearCart, isLoading: cartIsLoading } = useCartContext();
  const [cartInitialized, setCartInitialized] = useState(false);
  const [localCart, setLocalCart] = useState<CartSummary>({
    items: [],
    subtotal: 0,
    shipping: {
      cost: 0
    },
    total: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>(''); 
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    postalCode: '',
    country: 'FR',
    sameAsBilling: true,
    billingAddress1: '',
    billingAddress2: '',
    billingCity: '',
    billingPostalCode: '',
    billingCountry: 'FR',
  });
  
  // Chargement du panier et des méthodes de livraison
  useEffect(() => {
    // Ajout des logs de débogage
    console.log('Cart loading state:', cartIsLoading);
    console.log('Cart context:', cartContext);
    console.log('LocalStorage cart:', localStorage.getItem('chanvre_vert_cart'));

    // Vérifier si on a des données dans le localStorage (solution de secours)
    if (cartIsLoading) {
      console.log('Panier en cours de chargement, tentative de récupération depuis localStorage...');
      try {
        const storedCart = localStorage.getItem('chanvre_vert_cart');
        if (storedCart) {
          const cartData = JSON.parse(storedCart);
          if (cartData && cartData.items && cartData.items.length > 0) {
            // Utiliser directement les données du localStorage
            const checkoutItems: CartItem[] = cartData.items.map((item: {
              productId: string;
              name: string;
              price: number;
              quantity: number;
              variantId?: string;
              weight?: number;
              image?: string;
              slug?: string;
            }) => ({
              id: item.productId,
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              variantId: item.variantId,
              weight: item.weight,
              image: item.image,
              slug: item.slug
            }));
            
            const calcShipping = cartData.subtotal >= 49 ? 0 : 4.95;
            
            setLocalCart({
              items: checkoutItems,
              subtotal: cartData.subtotal,
              shipping: { cost: cartData.shipping?.cost || calcShipping },
              total: cartData.total || (cartData.subtotal + calcShipping)
            });
            
            // Marquer comme initialisé pour éviter de bloquer l'interface
            setCartInitialized(true);
          }
        }
      } catch (error) {
        console.error('Erreur lors du parsing du panier depuis localStorage:', error);
      }
    }
  
    // Utiliser le panier du contexte s'il est chargé
    if (!cartIsLoading) {
      console.log('CartContext:', cartContext);
      setCartInitialized(true);
      
      if (cartContext && cartContext.items && cartContext.items.length > 0) {
        // Convertir les items du contexte au format attendu par la page checkout
        const checkoutItems: CartItem[] = cartContext.items.map(item => ({
          id: item.productId,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variantId: item.variantId,
          weight: item.weight,
          image: item.image,
          slug: item.slug
        }));
        
        // Déterminer les frais de port (gratuit au-dessus de 49€)
        const calcShipping = cartContext.subtotal >= 49 ? 0 : 4.95;
        
        // Mettre à jour le cart local avec les bonnes valeurs
        setLocalCart({
          items: checkoutItems,
          subtotal: cartContext.subtotal,
          shipping: { cost: cartContext.shipping?.cost || calcShipping },
          total: cartContext.total || (cartContext.subtotal + calcShipping)
        });
        
        // Si pas de méthode de livraison définie, établir celle par défaut
        if (!cartContext.shipping?.methodId) {
          setShippingMethod('1', calcShipping);
        }
      } else {
        console.log('Panier vide, redirection vers /panier');
        // Rediriger vers le panier si on arrive directement sur checkout sans items
        router.push('/panier');
      }
    }
    
    // Charger les méthodes de livraison disponibles
    const fetchShippingMethods = async () => {
      try {
        console.log('Chargement des méthodes de livraison...');
        
        // Appel à l'API pour récupérer les méthodes de livraison
        try {
          const response = await fetch('/api/shipping-methods');
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.docs && data.docs.length > 0) {
              const methods = data.docs.map((method: ShippingMethodResponse) => ({
                id: method.id,
                name: method.name,
                description: method.description || '',
                cost: method.cost || 0,
                deliveryTime: method.deliveryTime && typeof method.deliveryTime === 'object' ? 
                  `${method.deliveryTime.minDays}-${method.deliveryTime.maxDays} jours` : 
                  method.deliveryTime || ''
              }));
              
              setShippingMethods(methods);
              if (methods.length > 0) {
                setSelectedShippingMethod(methods[0].id);
                console.log('Méthodes de livraison chargées depuis API:', methods[0].id);
                return; // Sortir de la fonction si réussi
              }
            }
          }
        } catch (apiError) {
          console.warn('Erreur lors de la récupération des méthodes de livraison depuis l\'API:', apiError);
        }
        
        // Fallback avec les méthodes codées en dur si l'API échoue
        console.log('Utilisation des méthodes de livraison par défaut');
        setShippingMethods([
          {
            id: '67fffcd911f3717499195edf',
            name: 'Livraison standard',
            description: 'Livraison en 1-2 jours ouvrés',
            cost: 4.95,
            deliveryTime: '1-2 jours'
          },
          {
            id: '6800056585f591e4d60bd924',
            name: 'Livraison sécurisée',
            description: 'Livraison sécurisée en 1-2 jours ouvrés',
            cost: 8.95,
            deliveryTime: '1-2 jours'
          }
        ]);
        
        // Sélectionner la première méthode par défaut
        setSelectedShippingMethod('67fffcd911f3717499195edf');
        console.log('Méthodes de livraison par défaut chargées:', '67fffcd911f3717499195edf');
        
      } catch (error) {
        console.error('Erreur lors du chargement des méthodes de livraison:', error);
      }
    };
    
    // Exécuter le chargement des méthodes de livraison indépendamment de l'état du panier
    fetchShippingMethods();
    
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Gestion des changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si l'adresse de facturation est la même que livraison, mettre à jour les champs
    if (name === 'sameAsBilling') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        sameAsBilling: isChecked
      }));
    } else if (formData.sameAsBilling && (
      name === 'address1' || 
      name === 'address2' || 
      name === 'city' || 
      name === 'postalCode' || 
      name === 'country'
    )) {
      // Copier les champs de livraison vers facturation
      const billingField = 'billing' + name.charAt(0).toUpperCase() + name.slice(1);
      setFormData(prev => ({
        ...prev,
        [billingField]: value
      }));
    }
  };
  
  // Changement de méthode de livraison
  const handleShippingMethodChange = (methodId: string) => {
    setSelectedShippingMethod(methodId);
    
    // Mettre à jour le coût de livraison
    const selectedMethod = shippingMethods.find(method => method.id === methodId);
    if (selectedMethod) {
      const newShippingCost = selectedMethod.cost;
      
      // Mettre à jour le contexte du panier
      setShippingMethod(methodId, newShippingCost);
      
      // Mettre à jour le panier local
      setLocalCart(prev => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          cost: newShippingCost,
          method: {
            id: selectedMethod.id,
            name: selectedMethod.name
          }
        },
        total: prev.subtotal + newShippingCost
      }));
    }
  };
  
  // Passage à l'étape suivante
  const goToNextStep = () => {
    // Validation de base des champs du formulaire
    if (!formData.email || !formData.firstName || !formData.lastName || 
        !formData.address1 || !formData.city || !formData.postalCode) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Passer à l'étape suivante
    setCurrentStep(2);
  };
  
  // Revenir à l'étape précédente
  const goToPreviousStep = () => {
    setCurrentStep(1);
  };
  
  // Soumission du paiement
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (localCart.items.length === 0) {
      alert('Votre panier est vide');
      return;
    }
    
    // Validation du formulaire
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.address1 ||
        !formData.city || !formData.postalCode) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Validation du format d'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }
    
    // Vérifier si une méthode de livraison a été sélectionnée
    if (!selectedShippingMethod) {
      alert('Veuillez sélectionner une méthode de livraison');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Créer l'objet commande selon le format API
      const orderData = {
        items: localCart.items.map(item => ({
          productId: item.productId || item.id,
          variantId: item.variantId,
          title: item.name,
          price: item.price,
          quantity: item.quantity,
          attributes: {} // Attributs additionnels si disponibles
        })),
        // Information client pour commandes anonymes
        guestInformation: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || ''
        },
        // Adresse de facturation
        billingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          line1: formData.sameAsBilling ? formData.address1 : formData.billingAddress1,
          line2: formData.sameAsBilling ? (formData.address2 || '') : (formData.billingAddress2 || ''),
          city: formData.sameAsBilling ? formData.city : formData.billingCity,
          postalCode: formData.sameAsBilling ? formData.postalCode : formData.billingPostalCode,
          country: formData.sameAsBilling ? 
            (formData.country === 'FR' ? 'France' : 
             formData.country === 'BE' ? 'Belgique' : 'France') : 
            (formData.billingCountry === 'FR' ? 'France' : 
             formData.billingCountry === 'BE' ? 'Belgique' : 'France')
        },
        // Adresse de livraison
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          line1: formData.address1,
          line2: formData.address2 || '',
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country === 'FR' ? 'France' : 
                   formData.country === 'BE' ? 'Belgique' : 'France'
        },
        // Informations de livraison
        shipping: {
          method: selectedShippingMethod,
          cost: localCart.shipping.cost
        },
        notes: '' // Champ optionnel pour instructions spéciales
      };
      
      console.log('Création de la commande...', orderData);
      
      // Appel à l'API pour créer la commande
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      const order = await orderResponse.json();
      
      if (!order.success) {
        throw new Error(`Erreur: ${order.message || 'Erreur lors de la création de la commande'}`);
      }
      
      // 3. Initialiser le paiement avec VivaWallet
      console.log('Commande créée:', order.data);
      
      // Construire l'objet de données de paiement selon le format API
      const paymentData = {
        amount: localCart.total,
        customerEmail: formData.email,
        customerTrns: `${formData.firstName} ${formData.lastName}`,
        orderId: order.data.id,
        orderCode: order.data.orderNumber,
        merchantTrns: `Commande ${order.data.orderNumber}`
      };
      
      console.log('Initialisation du paiement VivaWallet...', paymentData);
      
      // Appel à l'API pour initialiser le paiement et obtenir l'URL VivaWallet
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });
      
      const paymentInfo = await paymentResponse.json();
      
      if (!paymentInfo.success) {
        throw new Error(`Erreur: ${paymentInfo.message || "Erreur lors de l'initialisation du paiement"}`);
      }
      
      // Vérifier si l'URL de checkout est disponible
      if (paymentInfo.data && paymentInfo.data.checkoutUrl) {
        // Stocker l'ID de commande et l'orderCode dans sessionStorage pour vérification ultérieure
        sessionStorage.setItem('lastOrderId', order.data.id);
        sessionStorage.setItem('lastOrderNumber', order.data.orderNumber);
        
        // Vider le panier après une redirection réussie
        clearCart();
        
        // Rediriger vers la passerelle de paiement VivaWallet
        window.location.href = paymentInfo.data.checkoutUrl;
      } else {
        throw new Error('Impossible d\'initialiser le paiement: URL de checkout manquante');
      }
    } catch (error) {
      console.error('Erreur lors du processus de paiement:', error);
      setIsLoading(false);
      alert('Une erreur est survenue lors du traitement de votre commande. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Finaliser votre commande</h1>
      
      {/* Étapes du checkout */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <span className="font-medium">Informations</span>
          </div>
          <div className={`w-16 h-1 mx-2 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <span className="font-medium">Paiement</span>
          </div>
        </div>
      </div>
      
      {!cartInitialized ? (
        <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
          <p>Chargement du panier en cours...</p>
        </div>
      ) : localCart.items.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          <p>Votre panier est vide. <Link href="/produits" className="underline">Parcourir les produits</Link></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu différent selon l'étape */}
          {currentStep === 1 ? (
            // Étape 1: Formulaire d'informations
            <div className="lg:col-span-2">
              <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); goToNextStep(); }}>
              {/* Informations personnelles */}
              <div className=" p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block mb-1">Email*</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block mb-1">Téléphone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="firstName" className="block mb-1">Prénom*</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block mb-1">Nom*</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                </div>
              </div>
              
              {/* Adresse de facturation */}
              <div className=" p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Adresse de facturation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="address1" className="block mb-1">Adresse*</label>
                    <input
                      type="text"
                      id="address1"
                      name="address1"
                      required
                      value={formData.address1}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address2" className="block mb-1">Complément d&apos;adresse</label>
                    <input
                      type="text"
                      id="address2"
                      name="address2"
                      value={formData.address2}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block mb-1">Code postal*</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block mb-1">Ville*</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block mb-1">Pays*</label>
                    <select
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
               
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Adresse de livraison */}
              <div className="bg-black p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="sameAsBilling"
                    name="sameAsBilling"
                    checked={formData.sameAsBilling}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="sameAsBilling">Utiliser la même adresse pour la facturation</label>
                </div>
                
                {!formData.sameAsBilling && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="md:col-span-2">
                      <label htmlFor="billingAddress1" className="block mb-1">Adresse de facturation*</label>
                      <input
                        type="text"
                        id="billingAddress1"
                        name="billingAddress1"
                        required={!formData.sameAsBilling}
                        value={formData.billingAddress1}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="billingAddress2" className="block mb-1">Complément d&apos;adresse</label>
                      <input
                        type="text"
                        id="billingAddress2"
                        name="billingAddress2"
                        value={formData.billingAddress2}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                    <div>
                      <label htmlFor="billingPostalCode" className="block mb-1">Code postal*</label>
                      <input
                        type="text"
                        id="billingPostalCode"
                        name="billingPostalCode"
                        required={!formData.sameAsBilling}
                        value={formData.billingPostalCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                    <div>
                      <label htmlFor="billingCity" className="block mb-1">Ville*</label>
                      <input
                        type="text"
                        id="billingCity"
                        name="billingCity"
                        required={!formData.sameAsBilling}
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                    <div>
                      <label htmlFor="billingCountry" className="block mb-1">Pays*</label>
                      <select
                        id="billingCountry"
                        name="billingCountry"
                        required={!formData.sameAsBilling}
                        value={formData.billingCountry}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="FR">France</option>
                        <option value="BE">Belgique</option>
                        <option value="CH">Suisse</option>
                        <option value="LU">Luxembourg</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bouton pour passer à l'étape suivante */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium"
                >
                  {isLoading ? 'Traitement en cours...' : 'Continuer vers le paiement'}
                </button>
              </div>
            </form>
          </div>
          ) : (
            // Étape 2: Récapitulatif de commande avant paiement
            <div className="lg:col-span-2">
              <form onSubmit={handlePaymentSubmit} className="space-y-8">
                <div className="bg-black p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Vérifiez vos informations</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Coordonnées client */}
                    <div>
                      <h3 className="font-medium mb-2 pb-1 border-b">Coordonnées</h3>
                      <p>{formData.firstName} {formData.lastName}</p>
                      <p>{formData.email}</p>
                      {formData.phone && <p>{formData.phone}</p>}
                    </div>
                    
                    {/* Adresse de livraison */}
                    <div>
                      <h3 className="font-medium mb-2 pb-1 border-b">Adresse de livraison</h3>
                      <p>{formData.firstName} {formData.lastName}</p>
                      <p>{formData.address1}</p>
                      {formData.address2 && <p>{formData.address2}</p>}
                      <p>{formData.postalCode} {formData.city}</p>
                      <p>{formData.country === 'FR' ? 'France' : 
                         formData.country === 'BE' ? 'Belgique' : 
                         formData.country === 'CH' ? 'Suisse' : 'Luxembourg'}</p>
                    </div>
                  </div>
                  
                  {/* Méthodes de livraison */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-2 pb-1 border-b">Méthode de livraison</h3>
                    <div className="space-y-3">
                      {shippingMethods.map(method => (
                        <div key={method.id} className="flex items-center">
                          <input
                            type="radio"
                            id={`shipping-${method.id}`}
                            name="shippingMethod"
                            checked={selectedShippingMethod === method.id}
                            onChange={() => handleShippingMethodChange(method.id)}
                            className="mr-2"
                          />
                          <label htmlFor={`shipping-${method.id}`} className="flex-1">
                            <span className="font-medium">{method.name}</span>
                            <span className="text-sm text-gray-500 block">{method.description}</span>
                            <span className="text-sm">
  {typeof method.deliveryTime === 'string' 
    ? method.deliveryTime 
    : method.deliveryTime && typeof method.deliveryTime === 'object'
      ? `${method.deliveryTime.minDays} à ${method.deliveryTime.maxDays} jours (avant ${method.deliveryTime.cutoffTime})`
      : ''}
</span>
                          </label>
                          <span className="font-medium">{typeof method.cost === 'number' ? method.cost.toFixed(2) : '0.00'} €</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button 
                      type="button" 
                      onClick={goToPreviousStep}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium"
                    >
                      {isLoading ? 'Traitement en cours...' : `Procéder au paiement`}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {/* Récapitulatif de commande */}
          <div className="lg:col-span-1">
            <div className="bg-black p-6 rounded-lg shadow-md sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Récapitulatif de commande</h2>
              
              <div className="max-h-80 overflow-y-auto mb-4">
                {localCart.items.map((item, index: number) => (
                  <div key={index} className="flex justify-between py-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm ">
                        {item.variantName || item.weight ? `${item.weight}g` : ''} x {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium">
                      {(item.price * item.quantity).toFixed(2)} €
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <div>Sous-total</div>
                  <div>{localCart.subtotal.toFixed(2)} €</div>
                </div>
                <div className="flex justify-between">
                  <div>Livraison</div>
                  <div>{localCart.shipping.cost.toFixed(2)} €</div>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <div>Total</div>
                  <div>{localCart.total.toFixed(2)} €</div>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  {localCart.shipping.cost === 0 ? (
                    <p>Livraison gratuite</p>
                  ) : (
                    <p>Livraison gratuite à partir de 49€ d&apos;achat</p>
                  )}
                </div>
                
                {currentStep === 1 && (
                  <div className="hidden lg:block mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        // Déclencher la soumission du formulaire à l'étape 1
                        const form = document.getElementById('checkout-form');
                        if (form) {
                          const event = new Event('submit', { cancelable: true, bubbles: true });
                          form.dispatchEvent(event);
                        }
                      }}
                      disabled={isLoading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium"
                    >
                      {isLoading ? 'Traitement en cours...' : 'Continuer vers le paiement'}
                    </button>
                  </div>
                )}
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>En passant commande, vous acceptez nos <Link href="/conditions-generales" className="text-green-600 hover:underline">conditions générales de vente</Link> et reconnaissez notre <Link href="/confidentialite" className="text-green-600 hover:underline">politique de confidentialité</Link>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
