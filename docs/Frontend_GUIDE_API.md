# Documentation API Backend - Chanvre Vert

Ce document décrit l'API backend PayloadCMS pour le projet Chanvre Vert, telle qu'elle est implémentée dans ce repository.

## Sommaire
- [Architecture backend](#architecture-backend)
- [Collections implémentées](#collections-implémentées)
- [Endpoints des collections](#endpoints-des-collections)
- [Structures de données](#structures-de-données)
- [Fonctionnalités automatiques](#fonctionnalités-automatiques)

## Architecture backend

Le backend e-commerce pour Chanvre Vert utilise :

- **PayloadCMS** : Version 3.31.0
- **Base de données** : MongoDB
- **Serveur** : Next.js App Router avec Local API
- **Gestionnaire de paquets** : pnpm
- **Plugin SEO** : @payloadcms/plugin-seo pour les métadonnées SEO

## Collections implémentées

Le backend comprend les collections suivantes, toutes entièrement fonctionnelles et prêtes à être utilisées :

### Base d'utilisateurs
- **Admins** : Gestion des administrateurs du site
- **Customers** : Gestion des clients et de leurs adresses

### Catalogue produits
- **Categories** : Structure hiérarchique de catégories avec relation parent/enfant
- **Products** : Produits CBD avec gestion des variantes par poids
- **Media** : Gestion des fichiers médias (images des produits, etc.)

### Ventes et expédition
- **Orders** : Commandes avec support guest checkout (pas besoin de compte)
- **Payments** : Transactions financières séparées des commandes
- **Shipping** : Options de livraison pour la France et la Belgique

Notre structure suit une séparation claire entre commandes (Orders) et paiements (Payments), permettant une gestion plus flexible des processus de commande.

## Endpoints des collections

PayloadCMS expose automatiquement des API REST pour toutes nos collections. Voici les points d'accès principaux tels qu'implémentés dans notre backend :

### Categories
```
GET /api/categories                                   # Liste toutes les catégories
GET /api/categories/:id                               # Détails d'une catégorie par ID
GET /api/categories?where[slug][equals]=fleurs-cbd    # Recherche par slug
GET /api/categories?where[parent][equals]=123         # Catégories enfant d'une catégorie parent
```

### Products
```
GET /api/products                                     # Liste tous les produits
GET /api/products/:id                                 # Détails d'un produit par ID
GET /api/products?where[slug][equals]=cbd-amnesia     # Recherche par slug
```

Paramètres de filtrage pour Products :
- `?depth=2` - Inclut les relations (categories, images)
- `?where[category][equals]=123` - Filtrer par catégorie principale
- `?where[additionalCategories][in]=456` - Filtrer par catégorie secondaire
- `?where[isActive][equals]=true` - Uniquement les produits actifs
- `?where[isFeatured][equals]=true` - Uniquement les produits mis en avant
- `?where[productType][equals]=variable` - Filtrer par type (simple/variable)
- `?where[productDetails.strain][equals]=sativa` - Filtrer par type de souche
- `?sort=price` - Tri par prix (produits simples)
- `?limit=12&page=1` - Pagination des résultats

### Shipping
```
GET /api/shipping                                     # Liste toutes les méthodes de livraison
GET /api/shipping/:id                                 # Détails d'une méthode par ID
GET /api/shipping?where[isActive][equals]=true        # Méthodes actives uniquement
```

### Orders
```
POST /api/orders                                      # Créer une nouvelle commande
GET /api/orders/:id                                   # Détails d'une commande
PATCH /api/orders/:id                                 # Mettre à jour une commande
```

### Customers (pour l'authentification)
```
POST /api/customers/login                             # Connexion client
GET /api/customers/logout                             # Déconnexion
GET /api/customers/me                                 # Profil du client connecté
POST /api/customers                                   # Création de compte
```

### Routes API personnalisées
```
GET /api/payment/verify/:orderCode                  # Vérification du statut d'un paiement VivaWallet
```

## Structures de données

Voici les structures de données telles qu'implémentées dans notre backend :

### Categories

Structure hiérarchique de catégories avec support SEO :

```typescript
{
  id: string            // ID unique
  name: string           // Nom de la catégorie
  slug: string           // Identifiant URL-friendly 
  description: RichText  // Description complète au format Rich Text
  parent?: Category      // Catégorie parente (relation)
  meta: {               // Métadonnées SEO
    title: string
    description: string
  }
  createdAt: Date
  updatedAt: Date
}
```

### Products

Produits CBD avec gestion des variants par poids :

```typescript
{
  id: string            // ID unique
  name: string           // Nom du produit
  slug: string           // Identifiant URL-friendly
  description: RichText  // Description détaillée
  shortDescription: string // Résumé court
  category: Category     // Catégorie principale (relation)
  additionalCategories?: Category[] // Catégories secondaires (relation)
  productType: 'simple' | 'variable' // Type de produit
  
  // Pour les produits simples
  price?: number         // Prix en euros
  stock?: number         // Stock disponible (optionnel)
  sku?: string           // Code SKU
  
  // Pour les produits avec variations
  variants?: [
    {
      id: string         // ID de la variante
      weight: number     // Poids en grammes
      price: number      // Prix en euros
      pricePerGram: number // Prix au gramme (calculé)
      sku: string        // Code SKU
      stock?: number     // Stock disponible (optionnel)
      isActive: boolean  // Si la variante est disponible
    }
  ]
  
  // Images
  mainImage: Media      // Image principale (relation)
  galleryImages?: Media[] // Galerie d'images (relation)
  
  // Détails spécifiques CBD
  productDetails: {
    cbdContent?: number  // Taux de CBD en %
    thcContent?: number  // Taux de THC en %
    strain?: 'sativa' | 'indica' | 'hybrid' | 'na' // Type de souche
    origin?: string      // Pays/région d'origine
    cultivation?: 'indoor' | 'outdoor' | 'greenhouse' // Mode de culture
  }
  
  relatedProducts?: Product[] // Produits associés (relation)
  isActive: boolean     // Si le produit est visible
  isFeatured: boolean   // Si le produit est mis en avant
  tags?: string[]       // Mots-clés associés
  
  createdAt: Date
  updatedAt: Date
}
```

### Shipping

Options de livraison avec zones géographiques et tarification :

```typescript
{
  id: string             // ID unique
  name: string           // Nom de la méthode de livraison
  description: string    // Description détaillée
  isActive: boolean      // Si la méthode est disponible
  isDefault: boolean     // Si c'est la méthode proposée par défaut
  logoUrl?: string       // URL du logo (optionnel)
  
  // Délai de livraison estimé
  deliveryTime: {
    minDays: number      // Nombre minimum de jours
    maxDays: number      // Nombre maximum de jours
    cutoffTime?: string  // Heure limite pour expédition le jour même (ex: "16:00")
  }
  
  // Tarification
  pricing: {
    baseCost: number     // Coût standard en euros
    freeShippingThreshold: number // Montant pour livraison gratuite
  }
  
  // Zones géographiques
  zones: [
    {
      name: string        // Nom de la zone (ex: "France métropolitaine")
      countries: string[] // Codes pays (ex: ["FR", "BE"])
      isActive: boolean   // Si la zone est desservie
      additionalCost: number // Coût supplémentaire pour cette zone
      extraDeliveryDays: number // Jours supplémentaires pour la livraison
    }
  ]
  
  // Options de suivi
  trackingOptions: {
    hasTracking: boolean // Si le suivi est disponible
    trackingUrlTemplate?: string // Template URL pour le suivi
  }
  
  createdAt: Date
  updatedAt: Date
}
```

### Orders

Commandes avec support guest checkout et intégration de la livraison :

```typescript
{
  id: string             // ID unique
  orderNumber: string    // Numéro de commande unique (format CV-2025-00001)
  
  // Informations client (deux possibilités)
  customer?: Customer    // Relation pour clients enregistrés
  guestInformation?: {   // Pour les clients non enregistrés
    email: string
    firstName: string
    lastName: string
    phone?: string
  }
  
  // Adresses
  billingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    postalCode: string
    country: string
  }
  shippingAddress: {     // Même structure que billingAddress
    // ...
  }
  
  // Produits commandés
  items: [
    {
      productId: string   // ID du produit
      productName: string // Nom du produit
      variantId?: string  // ID de la variante s'il y en a une
      variantName?: string // Nom de la variante (ex: "5g")
      price: number       // Prix unitaire
      quantity: number    // Quantité commandée
      sku: string         // Code SKU
    }
  ]
  
  // Informations de livraison
  shipping: {
    method: Shipping     // Relation vers la méthode de livraison
    cost: number         // Coût de la livraison
    estimatedDeliveryDate?: Date // Date estimée de livraison
  }
  
  // Montants
  subtotal: number       // Montant des produits
  shippingCost: number   // Coût de la livraison
  total: number          // Total avec livraison
  
  // État
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
  paymentId?: string     // Lien avec la transaction de paiement
  payment?: Payment      // Relation avec le paiement
  
  notes?: string         // Notes internes
  shippedAt?: Date       // Date d'expédition
  trackingNumber?: string // Numéro de suivi
  
  createdAt: Date
  updatedAt: Date
}
```

## Fonctionnalités automatiques

Le backend de Chanvre Vert intègre plusieurs automatisations qui simplifieront l'intégration frontend :

### 1. Génération de numéros de commande

Les commandes reçoivent automatiquement un numéro séquentiel au format `CV-ANNÉE-XXXXX` (ex: CV-2025-00001) lors de leur création.

```typescript
// Implémenté dans le hook beforeChange de Orders.ts
const currentYear = new Date().getFullYear()
let sequence = 1
// Trouver la dernière commande pour obtenir le prochain numéro
// ...
data.orderNumber = `CV-${currentYear}-${sequence.toString().padStart(5, '0')}`
```

### 2. Calcul automatique des totaux

Les montants totaux sont calculés automatiquement si non fournis lors de la création d'une commande :

```typescript
// Si le total n'est pas fourni, le calculer à partir des articles
if (!data.total && data.items && Array.isArray(data.items)) {
  data.total = data.items.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity || 0
    return sum + itemTotal
  }, 0)
}
```

### 3. Décrémentation automatique des stocks

Après qu'une commande passe au statut "paid", les stocks sont automatiquement mis à jour :

```typescript
// Implémenté dans le hook afterChange de Orders.ts
if (operation === 'create' && doc.paymentStatus === 'paid' && doc.items) {
  // Pour chaque article, mettre à jour le stock
  for (const item of doc.items) {
    // Récupérer le produit
    const product = await payload.findByID({
      collection: 'products',
      id: item.productId,
    })
    
    // Gérer différemment selon le type de produit
    if (product.productType === 'variable') {
      // Mettre à jour le stock de la variante
      // ...
    } else if (product.productType === 'simple') {
      // Mettre à jour le stock du produit simple
      // ...
    }
  }
}
```

### 4. Création automatique des paiements

Lorsqu'une commande passe au statut "paid", une entrée est automatiquement créée dans la collection Payments :

```typescript
// Implémenté dans le hook afterChange de Orders.ts
if (operation === 'update' && doc.status === 'paid' && !doc.payment) {
  const newPayment = await payload.create({
    collection: 'payments',
    data: {
      amount: doc.total,
      status: 'paid',
      customer: {
        email: doc.customer?.email || doc.guestInformation?.email,
        // ...
      },
      eventHistory: [
        {
          date: new Date().toISOString(),
          eventType: 'payment_success',
          details: { orderId: doc.id },
        },
      ],
    },
  })
  
  // Mettre à jour la commande avec l'ID du paiement
  await payload.update({
    collection: 'orders',
    id: doc.id,
    data: {
      paymentId: newPayment.id,
      paymentStatus: 'paid',
    },
  })
}
```

### 5. Vérification des paiements VivaWallet

L'API expose une route spéciale pour vérifier le statut des paiements VivaWallet :

```typescript
// Route GET /api/payment/verify/[orderCode]
// Retourne le statut du paiement et met à jour la commande si nécessaire
```

### 6. Méthode de livraison par défaut

La collection Shipping permet de définir une méthode de livraison par défaut avec le champ `isDefault`.

### 7. Livraison gratuite automatique

Le système de livraison inclut un seuil configurable (`pricing.freeShippingThreshold`) au-delà duquel la livraison devient gratuite, par défaut 50€ pour la méthode sécurisée.

### 8. Redirections de paiement Viva Wallet

Le backend gère les redirections après paiement via Viva Wallet avec les routes suivantes :

```typescript
// Route GET /success
// Redirection après un paiement réussi vers https://chanvre-vert.fr/paiement-reussi
// Tous les paramètres de Viva Wallet sont transmis au frontend

// Route GET /failure
// Redirection après un échec de paiement vers https://chanvre-vert.fr/paiement-echoue
// Tous les paramètres d'erreur sont transmis au frontend
```

Les URLs configurées dans l'interface Viva Wallet doivent pointer vers :
- Success URL: https://www.api.chanvre-vert.fr/success
- Failure URL: https://www.api.chanvre-vert.fr/failure

## Notes d'implémentation importantes

### Produits 

- **Types de produits** : Implémentés comme "simple" (prix unique) ou "variable" (prix par poids)
- **Prix au gramme** : Calculé automatiquement pour les variantes (`price/weight`)
- **Visibilité** : Champ `isActive` pour contrôler l'affichage des produits
- **Mise en avant** : Champ `isFeatured` pour la page d'accueil
- **Métadonnées** : Gestion des informations légales et des certificats via le groupe `metaInfo`

### Commandes

- **Guest checkout** : Support des commandes sans création de compte via `guestInformation`
- **Statuts** : 
  - **Commande** : 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  - **Paiement** : 'pending', 'paid', 'refunded', 'failed'
- **Intégration VivaWallet** : Les paiements sont traités via VivaWallet et peuvent être vérifiés avec la route `/api/payment/verify/:orderCode`

### Livraison

- **Zones** : Configuration différente pour France et Belgique
- **Délais** : Base de 24-48h + jours additionnels selon la zone
- **Suivi** : Configuration optionnelle d'un template d'URL de suivi

### Sécurité

- **Accès** : 
  - Les utilisateurs publics peuvent lire les produits, catégories et méthodes de livraison
  - Seuls les administrateurs peuvent créer/modifier les produits, catégories et méthodes de livraison
  - Les commandes peuvent être créées par les utilisateurs publics (guest checkout)

## Guide d'intégration Frontend Complet

Ce guide fournit des instructions détaillées pour implémenter l'intégration complète du panier d'achat, du processus de commande et des paiements dans le frontend.

### Gestion du panier

Le panier d'achat est géré côté client avec une persistance locale via `localStorage`. Voici un exemple complet d'implémentation :

#### 1. Structure du panier

```typescript
// types/cart.ts
import { Product } from './product';

export interface CartItem {
  productId: string;      // ID du produit
  variantId?: string;     // ID de la variante (pour les produits variables)
  name: string;           // Nom du produit
  price: number;          // Prix unitaire
  weight?: number;        // Poids (pour les produits variables)
  quantity: number;       // Quantité
  image: string;          // URL de l'image
  slug: string;           // Slug du produit (pour les liens)
}

export interface Cart {
  items: CartItem[];
  subtotal: number;       // Sous-total (somme des articles)
  shipping?: {
    methodId: string;     // ID de la méthode de livraison
    cost: number;         // Coût de la livraison
  };
  total: number;          // Total avec livraison
}
```

#### 2. Hooks de gestion du panier

```typescript
// hooks/useCart.ts
import { useState, useEffect } from 'react';
import { Cart, CartItem } from '../types/cart';
import { Product } from '../types/product';

// Clé utilisée pour stocker le panier dans localStorage
const CART_STORAGE_KEY = 'chanvre_vert_cart';

// État initial du panier
const initialCart: Cart = {
  items: [],
  subtotal: 0,
  total: 0
};

export function useCart() {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer le panier depuis localStorage au chargement
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  // Recalculer les totaux
  const recalculateCart = (items: CartItem[]): Cart => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = cart.shipping?.cost || 0;
    
    return {
      items,
      subtotal,
      shipping: cart.shipping,
      total: subtotal + shippingCost
    };
  };

  // Ajouter un produit au panier
  const addItem = (product: Product, quantity: number = 1, variantId?: string) => {
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId === product.id && 
      (variantId ? item.variantId === variantId : !item.variantId)
    );

    let newItems = [...cart.items];
    
    // Si le produit est variable, récupérer les infos de la variante
    let price = product.price;
    let weight = undefined;
    let variantName = '';
    
    if (variantId && product.variants && product.productType === 'variable') {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        price = variant.price;
        weight = variant.weight;
        variantName = ` - ${weight}g`;
      }
    }

    // Si l'article existe déjà, incrémenter la quantité
    if (existingItemIndex !== -1) {
      newItems[existingItemIndex].quantity += quantity;
    } else {
      // Sinon, ajouter un nouvel article
      newItems.push({
        productId: product.id,
        variantId,
        name: product.name + (variantName || ''),
        price,
        weight,
        quantity,
        image: product.mainImage?.url || product.images?.[0] || '',
        slug: product.slug
      });
    }

    setCart(recalculateCart(newItems));
  };

  // Mettre à jour la quantité d'un article
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const newItems = [...cart.items];
    newItems[index].quantity = quantity;
    setCart(recalculateCart(newItems));
  };

  // Supprimer un article
  const removeItem = (index: number) => {
    const newItems = cart.items.filter((_, i) => i !== index);
    setCart(recalculateCart(newItems));
  };

  // Vider le panier
  const clearCart = () => {
    setCart(initialCart);
  };

  // Définir la méthode de livraison
  const setShippingMethod = (methodId: string, cost: number) => {
    setCart({
      ...cart,
      shipping: {
        methodId,
        cost
      },
      total: cart.subtotal + cost
    });
  };

  return {
    cart,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setShippingMethod
  };
}
```

### Intégration des paiements VivaWallet

Le processus de paiement via VivaWallet se déroule en plusieurs étapes :

1. Création d'une commande dans la collection `orders`
2. Initialisation d'un paiement VivaWallet via l'API `/api/payment/create`
3. Redirection du client vers la page de paiement sécurisée de VivaWallet
4. Gestion du retour client et vérification du statut de paiement

#### 1. Service de paiement

```typescript
// services/paymentService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.chanvre-vert.fr/api';

interface PaymentRequest {
  orderId: string;
  orderNumber: string;
  amount: number;
  customerEmail: string;
  customerFullName: string;
}

interface PaymentResponse {
  success: boolean;
  data?: {
    orderCode: string;
    checkoutUrl: string;
  };
  message?: string;
}

/**
 * Initialiser un paiement via VivaWallet
 */
export async function initializePayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${API_URL}/payment/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber: paymentData.orderNumber,
        amount: paymentData.amount,
        customerEmail: paymentData.customerEmail,
        customerTrns: paymentData.customerFullName,
        customerData: {
          email: paymentData.customerEmail,
          fullName: paymentData.customerFullName,
          orderId: paymentData.orderId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de l'initialisation du paiement: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du paiement:', error);
    throw error;
  }
}

/**
 * Vérifier le statut d'un paiement
 */
export async function verifyPayment(orderCode: string): Promise<PaymentVerifyResponse> {
  try {
    const response = await fetch(`${API_URL}/payment/verify/${orderCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la vérification du paiement: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    throw error;
  }
}
```

#### 2. Exemple d'intégration du processus de paiement

```typescript
// pages/checkout.tsx - Fonction de traitement du paiement
async function handlePayment(order) {
  try {
    // 1. Initialiser le paiement
    const payment = await initializePayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      customerEmail: order.guestInformation?.email || order.customer?.email,
      customerFullName: order.guestInformation?.fullName || order.customer?.fullName,
    });
    
    if (payment.success && payment.data?.checkoutUrl) {
      // Stocker l'orderCode pour vérification ultérieure
      localStorage.setItem('pendingOrderCode', payment.data.orderCode);
      localStorage.setItem('pendingOrderNumber', order.orderNumber);
      
      // 2. Rediriger vers la page de paiement VivaWallet
      window.location.href = payment.data.checkoutUrl;
    } else {
      throw new Error(payment.message || 'Erreur lors de l\'initialisation du paiement');
    }
  } catch (error) {
    console.error('Erreur de paiement:', error);
    throw error;
  }
}
```

#### 3. Gestion du retour après paiement

```typescript
// pages/payment-success.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { verifyPayment } from '../services/paymentService';
import { getOrderByNumber } from '../services/orderService';
import { useCartContext } from '../context/CartContext';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCartContext();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success'|'pending'|'failed'>('pending');
  const [orderInfo, setOrderInfo] = useState(null);
  
  useEffect(() => {
    async function verifyTransaction() {
      try {
        // Récupérer l'orderCode stocké lors de l'initialisation du paiement
        const orderCode = localStorage.getItem('pendingOrderCode');
        const orderNumber = localStorage.getItem('pendingOrderNumber');
        
        if (!orderCode || !orderNumber) {
          setPaymentStatus('failed');
          return;
        }
        
        // Vérifier le statut du paiement
        const verificationResult = await verifyPayment(orderCode);
        
        if (verificationResult.success && verificationResult.data?.paymentStatus === 'paid') {
          // Paiement réussi
          setPaymentStatus('success');
          
          // Récupérer les détails de la commande
          const order = await getOrderByNumber(orderNumber);
          setOrderInfo(order);
          
          // Vider le panier
          clearCart();
          
          // Nettoyer localStorage
          localStorage.removeItem('pendingOrderCode');
          localStorage.removeItem('pendingOrderNumber');
        } else {
          // Paiement en attente ou échoué
          setPaymentStatus(verificationResult.data?.paymentStatus === 'pending' ? 'pending' : 'failed');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du paiement:', error);
        setPaymentStatus('failed');
      } finally {
        setIsVerifying(false);
      }
    }
    
    verifyTransaction();
  }, [clearCart]);
  
  // Rendu conditionnel selon le statut
  // ...
}
```

### Webhooks VivaWallet

Le backend est configuré pour recevoir des notifications asynchrones de VivaWallet via webhooks. Cette fonctionnalité est entièrement gérée côté serveur et ne nécessite pas d'implémentation côté frontend. Les étapes sont les suivantes :

1. VivaWallet envoie une notification au endpoint `/api/webhook/vivaWallet`
2. Le backend vérifie la signature du webhook
3. Le statut de la commande et du paiement est mis à jour automatiquement
4. Si le paiement est confirmé, les stocks sont mis à jour

Cette approche garantit que même si le client ferme la fenêtre ou perd sa connexion après le paiement, la commande sera correctement mise à jour dans votre système.

### Processus d'achat complet

Résumé du flux complet d'achat :

1. **Panier** : L'utilisateur ajoute des produits au panier
2. **Checkout** : Remplissage des informations client et livraison
3. **Création commande** : Création d'une commande via l'API `/api/orders`
4. **Initialisation paiement** : Appel à `/api/payment/create` pour obtenir un lien de paiement
5. **Paiement** : Redirection vers VivaWallet pour le paiement sécurisé
6. **Retour client** : Redirection vers votre site (succès ou échec)
7. **Vérification** : Vérification du statut via `/api/payment/verify/[orderCode]`
8. **Confirmation** : Affichage de la confirmation de commande et des détails
9. **Mise à jour asynchrone** : Les webhooks mettent à jour les statuts si nécessaire

Ce workflow complet garantit une expérience utilisateur optimale tout en assurant la fiabilité des transactions.
