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
