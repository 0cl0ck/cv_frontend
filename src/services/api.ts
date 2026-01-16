import { Category, Product } from '@/types/product';
import { Post, PostsResponse } from '@/types/blog';
import { httpClient } from '@/lib/httpClient';

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
// Ordre: Fleurs, Résines, Packs, Infusions, Huiles, Gélules
export const fallbackCategories: Category[] = [
  {
    id: '1',
    name: 'Fleurs CBD',
    slug: 'fleurs-cbd',
    description: 'Sélection premium cultivée en intérieur et en serre.',
    image: '/images/categories/categorie_fleurs_cbd.webp',
  },
  {
    id: '4',
    name: 'Résines CBD',
    slug: 'resines-cbd',
    description: 'Textures onctueuses et taux de CBD maîtrisés.',
    image: '/images/categories/categorie_resine_cbd.webp',
  },
  {
    id: '6',
    name: 'Packs CBD',
    slug: 'packs-cbd',
    description: 'Composez votre routine bien-être à prix doux.',
    image: '/images/categories/categorie_packs_cbd.webp',
  },
  {
    id: '3',
    name: 'Infusions CBD',
    slug: 'infusions-cbd',
    description: 'Des mélanges bien-être pour des pauses relaxantes.',
    image: '/images/categories/categorie_infusion_cbd.webp',
  },
  {
    id: '2',
    name: 'Huiles CBD',
    slug: 'huiles-cbd',
    description: 'Découvrez nos huiles full spectrum et broad spectrum.',
    image: '/images/categories/categorie_huile_cbd.webp',
  },
  {
    id: '5',
    name: 'Gélules CBD',
    slug: 'gelules-cbd',
    description: 'Dosage précis et facile à emporter au quotidien.',
    image: '/images/categories/categorie_gelules_cbd.webp',
  },
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
    // Assurons-nous que seuls les produits actifs sont affichés
    queryParams.append('where[isActive][equals]', 'true');
    if (params?.sort) queryParams.append('sort', params.sort);
    
    // Filtres de prix
    if (params?.minPrice) queryParams.append('where[price][greater_than_equal]', params.minPrice.toString());
    if (params?.maxPrice) queryParams.append('where[price][less_than_equal]', params.maxPrice.toString());

    // Tentative de récupération depuis l'API
    const { data } = await httpClient.get(`/products?${queryParams.toString()}`);
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
    
    // Toujours filtrer les produits inactifs (supprimés)
    filteredProducts = filteredProducts.filter(product => product.isActive !== false);
    
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
    const { data } = await httpClient.get(`/products?where[slug][equals]=${slug}&depth=2`);
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
    const { data } = await httpClient.get('/categories?sort=displayOrder');
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
    const { data } = await httpClient.get(`/categories?where[slug][equals]=${slug}`);
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
    
    const { data } = await httpClient.get(`/products?${queryParams.toString()}`);
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


export async function searchProducts(query: string, options: { limit?: number } = {}): Promise<{ query: string; docs: Product[]; totalDocs: number }> {
  const trimmedQuery = query.trim();
  const limit = Math.max(1, Math.min(options.limit ?? 8, 20));

  if (trimmedQuery.length < 3) {
    return {
      query: trimmedQuery,
      docs: [],
      totalDocs: 0,
    };
  }

  try {
    const params = new URLSearchParams();
    params.set('q', trimmedQuery);
    params.set('limit', limit.toString());

    const { data } = await httpClient.get(`/search/products?${params.toString()}`);

    const docs = Array.isArray(data?.docs) ? (data.docs as Product[]) : [];
    const totalDocs = Number.isFinite(data?.totalDocs) ? Number(data.totalDocs) : docs.length;
    const responseQuery = typeof data?.query === 'string' ? data.query : trimmedQuery;

    return {
      query: responseQuery,
      docs,
      totalDocs,
    };
  } catch (error) {
    console.error('Error searching products:', error);

    const fallbackMatches = fallbackProducts.filter((product) =>
      product.name.toLowerCase().includes(trimmedQuery.toLowerCase()),
    );

    return {
      query: trimmedQuery,
      docs: fallbackMatches.slice(0, limit),
      totalDocs: fallbackMatches.length,
    };
  }
}

// ============================================================================
// BLOG API
// ============================================================================

/**
 * Service pour récupérer les articles de blog publiés
 * Le filtrage sur status === published et publishedAt <= now est fait côté API
 */
export async function getPosts(params?: {
  page?: number;
  limit?: number;
  isPillar?: boolean;
}): Promise<PostsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isPillar !== undefined) {
      queryParams.append('where[isPillar][equals]', params.isPillar.toString());
    }
    
    // Tri par date de publication décroissante
    queryParams.append('sort', '-publishedAt');
    // Depth pour récupérer les relations (catégories, produits, image)
    queryParams.append('depth', '2');

    const { data } = await httpClient.get(`/posts?${queryParams.toString()}`);
    return data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    // Retourner une réponse vide en cas d'erreur
    return {
      docs: [],
      totalDocs: 0,
      limit: params?.limit || 10,
      totalPages: 0,
      page: params?.page || 1,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
    };
  }
}

/**
 * Service pour récupérer un article par son slug
 */
export async function getPostBySlug(slug: string): Promise<Post> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('where[slug][equals]', slug);
    // Depth pour récupérer les relations complètes
    queryParams.append('depth', '2');

    const { data } = await httpClient.get(`/posts?${queryParams.toString()}`);
    
    if (!data.docs || data.docs.length === 0) {
      throw new Error('Post not found');
    }

    return data.docs[0];
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    throw error;
  }
}

/**
 * Service pour récupérer tous les slugs des articles publiés (pour generateStaticParams)
 */
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '1000');
    queryParams.append('depth', '0');
    // On ne récupère que les slugs
    
    const { data } = await httpClient.get(`/posts?${queryParams.toString()}`);
    
    return data.docs.map((post: { slug: string }) => post.slug);
  } catch (error) {
    console.error('Error fetching post slugs:', error);
    return [];
  }
}
