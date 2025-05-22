import { Category, Product } from '@/types/product';

// URL de base de l'API PayloadCMS
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Generic fetcher used with SWR
export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init });
  if (!res.ok) {
    throw new Error(`API responded with status: ${res.status}`);
  }
  return res.json();
}

// Données de secours pour les produits en cas d'erreur API
const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'Banana Berry',
    slug: 'banana-berry',
    price: 15.90,
    mainImage: {
      url: '/images/products/banana-berry.webp',
      alt: 'Banana Berry',
      width: 1080,
      height: 1080
    },
    description: 'Fleurs CBD saveur Banana Berry avec une qualité exceptionnelle. Parfaitement séchée et trimée pour une expérience optimale.',
    productType: 'simple',
    isFeatured: true,
    category: { id: '1', name: 'Fleurs CBD', slug: 'fleurs-cbd' },
    stock: 42,
    sku: 'CBD-FL-001',
    isActive: true
  },
  {
    id: '2',
    name: 'Blue Berry',
    slug: 'blue-berry',
    price: 16.90,
    mainImage: {
      url: '/images/products/blue-berry.webp',
      alt: 'Blue Berry',
      width: 1080,
      height: 1080
    },
    description: 'Fleurs CBD saveur Blue Berry avec un arôme fruité délicieux. Excellente pour la relaxation en soirée.',
    productType: 'simple',
    category: { id: '1', name: 'Fleurs CBD', slug: 'fleurs-cbd' },
    stock: 27,
    sku: 'CBD-FL-002',
    isActive: true
  },
  {
    id: '3',
    name: 'Corelato',
    slug: 'corelato',
    price: 18.50,
    mainImage: {
      url: '/images/products/corelato.webp',
      alt: 'Corelato',
      width: 1080,
      height: 1080
    },
    description: 'Fleurs CBD premium Corelato avec une teneur en CBD élevée. Cultivee en indoor pour une qualité supérieure.',
    productType: 'simple',
    category: { id: '1', name: 'Fleurs CBD', slug: 'fleurs-cbd' },
    stock: 15,
    sku: 'CBD-FL-003',
    isActive: true
  },
  {
    id: '4',
    name: 'Huile CBD 10%',
    slug: 'huile-cbd-10',
    price: 39.90,
    mainImage: {
      url: '/images/categories/categorie_huile_cbd.webp',
      alt: 'Huile CBD 10%',
      width: 1080,
      height: 1080
    },
    description: 'Huile CBD 10% de qualité premium avec extrait full spectrum pour un effet optimal.',
    productType: 'simple',
    category: { id: '2', name: 'Huiles CBD', slug: 'huiles-cbd' },
    sku: 'CBD-OIL-001',
    isActive: true
  },
  {
    id: '5',
    name: 'Infusion CBD Relaxante',
    slug: 'infusion-cbd-relaxante',
    price: 12.90,
    mainImage: {
      url: '/images/categories/categorie_infusion_cbd.webp',
      alt: 'Infusion CBD Relaxante',
      width: 1080,
      height: 1080
    },
    description: 'Infusion CBD aux plantes relaxantes. Parfait pour la fin de journée.',
    productType: 'simple',
    category: { id: '3', name: 'Infusions CBD', slug: 'infusions-cbd' },
    sku: 'CBD-INF-001',
    isActive: true
  },
  {
    id: '6',
    name: 'Résine CBD Premium',
    slug: 'resine-cbd-premium',
    price: 22.90,
    mainImage: {
      url: '/images/categories/categorie_resine_cbd.webp',
      alt: 'Résine CBD Premium',
      width: 1080,
      height: 1080
    },
    description: 'Résine CBD concentrée de haute qualité, extraite par méthode douce.',
    productType: 'simple',
    category: { id: '4', name: 'Résines CBD', slug: 'resine-cbd' },
    sku: 'CBD-RES-001',
    isActive: true
  },
];

// Données de secours pour les catégories en cas d'erreur API
const fallbackCategories: Category[] = [
  { id: '1', name: 'Fleurs CBD', slug: 'fleurs-cbd' },
  { id: '2', name: 'Huiles CBD', slug: 'huiles-cbd' },
  { id: '3', name: 'Infusions CBD', slug: 'infusions-cbd' },
  { id: '4', name: 'Résines CBD', slug: 'resine-cbd' },
  { id: '5', name: 'Gélules CBD', slug: 'gelules-cbd' },
  { id: '6', name: 'Packs CBD', slug: 'packs-cbd' },
];

/**
 * Service pour récupérer les produits depuis l'API PayloadCMS
 */
export async function getProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<{ docs: Product[]; totalDocs: number; totalPages: number; page: number }> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('where[category][contains]', params.category);
    if (params?.featured) queryParams.append('where[isFeatured][equals]', 'true');
    if (params?.sort) queryParams.append('sort', params.sort);
    
    // Filtres de prix
    if (params?.minPrice) queryParams.append('where[price][greater_than_equal]', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('where[price][less_than_equal]', params.maxPrice.toString());

    // Tentative de récupération depuis l'API
    const response = await fetch(`${API_URL}/api/products?${queryParams.toString()}`, {
      cache: 'no-store', // Utiliser uniquement no-store sans revalidate pour éviter les conflits
    });

    if (!response.ok) {
      // Si l'API ne répond pas correctement, utiliser les données de secours
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    
    // Retourner des données de secours formatées comme l'API
    let filteredProducts = [...fallbackProducts];
    
    // Appliquer les filtres aux données de secours
    if (params?.category) {
      filteredProducts = filteredProducts.filter(product => {
        if (!product.category) return false;
        if (typeof product.category === 'string') {
          return product.category === params.category;
        } else {
          return product.category.id === params.category || product.category.slug === params.category;
        }
      });
    }
    
    if (params?.featured) {
      filteredProducts = filteredProducts.filter(product => product.isFeatured === true);
    }
    
    // Filtres de prix pour les données de secours
    if (params?.minPrice) {
      filteredProducts = filteredProducts.filter(product => 
        (product.price ?? 0) >= params.minPrice!
      );
    }
    
    if (params?.maxPrice) {
      filteredProducts = filteredProducts.filter(product => 
        (product.price ?? 0) <= params.maxPrice!
      );
    }
    
    // Pagination simple
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      docs: paginatedProducts,
      totalDocs: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / limit),
      page: page
    };
  }
}

/**
 * Service pour récupérer un produit par son slug depuis l'API PayloadCMS
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  try {
    // Ajouter l'option depth pour récupérer toutes les relations, y compris les statistiques d'avis
    const response = await fetch(`${API_URL}/api/products?where[slug][equals]=${slug}&depth=2`, {
      cache: 'no-store', // Utiliser uniquement no-store sans revalidate pour éviter les conflits
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.docs || data.docs.length === 0) {
      throw new Error('Product not found');
    }
    
    // Initialiser des statistiques d'avis par défaut si elles ne sont pas disponibles
    if (!data.docs[0].reviewStats) {
      data.docs[0].reviewStats = {
        averageRating: 0,
        totalReviews: 0,
        distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
      };
    }

    return data.docs[0];
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    
    // Chercher dans les données de secours
    const product = fallbackProducts.find(p => p.slug === slug);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Ajouter des statistiques d'avis par défaut pour les produits de secours
    if (!product.reviewStats) {
      product.reviewStats = {
        averageRating: 0,
        totalReviews: 0,
        distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
      };
    }
    
    return product;
  }
}

/**
 * Service pour récupérer toutes les catégories depuis l'API PayloadCMS
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_URL}/api/categories`, {
      cache: 'no-store', // Utiliser uniquement no-store sans revalidate pour éviter les conflits
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.docs;
  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Retourner les catégories de secours
    return fallbackCategories;
  }
}

/**
 * Service pour récupérer une catégorie par son slug depuis l'API PayloadCMS
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  try {
    const response = await fetch(`${API_URL}/api/categories?where[slug][equals]=${slug}`, {
      cache: 'no-store', // Utiliser uniquement no-store sans revalidate pour éviter les conflits
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.docs || data.docs.length === 0) {
      throw new Error('Category not found');
    }

    return data.docs[0];
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    
    // Chercher dans les données de secours
    const category = fallbackCategories.find(c => c.slug === slug);
    if (!category) {
      throw new Error('Category not found');
    }
    
    return category;
  }
}

/**
 * Service pour récupérer les produits associés à un produit
 */
export async function getRelatedProducts(productId: string, categoryIds: string[], limit = 4): Promise<Product[]> {
  try {
    const queryParams = new URLSearchParams();
    
    queryParams.append('limit', limit.toString());
    
    // Exclure le produit actuel
    queryParams.append('where[id][not_equals]', productId);
    
    // Inclure les produits de la même catégorie
    if (categoryIds.length > 0) {
      categoryIds.forEach(categoryId => {
        queryParams.append('where[category][contains]', categoryId);
      });
    }
    
    const response = await fetch(`${API_URL}/api/products?${queryParams.toString()}`, {
      cache: 'no-store', // Utiliser uniquement no-store sans revalidate pour éviter les conflits
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.docs;
  } catch (error) {
    console.error('Error fetching related products:', error);
    
    // Filtrer les produits de secours par catégorie similaire et exclure le produit actuel
    return fallbackProducts
      .filter(product => product.id !== productId)
      .filter(product => {
        if (categoryIds.length === 0) return true;
        if (!product.category) return false;
        
        const catId = typeof product.category === 'string' 
          ? product.category 
          : product.category.id;
        
        return categoryIds.includes(catId);
      })
      .slice(0, limit);
  }
}
