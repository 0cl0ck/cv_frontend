// Import supprimé car non utilisé

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
