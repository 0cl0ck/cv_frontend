import { MetadataRoute } from 'next';

// Use environment variables with fallbacks for build-time and runtime
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chanvre-vert.fr';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanvre-vert.fr';

interface ProductDoc {
  slug: string;
  updatedAt?: string;
}

interface CategoryDoc {
  slug: string;
  updatedAt?: string;
}

interface PostDoc {
  slug: string;
  updatedAt?: string;
}

interface UseCaseDoc {
  slug: string;
  updatedAt?: string;
}

async function fetchProducts(): Promise<ProductDoc[]> {
  try {
    // CRITICAL SEO FIX: Include ALL products in sitemap, not just isActive=true
    // Out-of-stock products maintain their SEO equity
    // Truly discontinued products should use 301 redirects, not sitemap exclusion
    const res = await fetch(`${API_URL}/api/products?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs || [];
  } catch {
    return [];
  }
}


async function fetchPosts(): Promise<PostDoc[]> {
  try {
    const res = await fetch(`${API_URL}/api/posts?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs || [];
  } catch {
    return [];
  }
}

async function fetchCategories(): Promise<CategoryDoc[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs || [];
  } catch {
    return [];
  }
}

async function fetchUseCases(): Promise<UseCaseDoc[]> {
  try {
    const res = await fetch(`${API_URL}/api/use-cases?limit=100&where[status][equals]=published`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, categories, useCases] = await Promise.all([
    fetchProducts(),
    fetchPosts(),
    fetchCategories(),
    fetchUseCases(),
  ]);

  const now = new Date();

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/produits`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/solutions`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/a-propos`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Pages produits
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/produits/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Pages catégories
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/produits/categorie/${cat.slug}`,
    lastModified: cat.updatedAt ? new Date(cat.updatedAt) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Pages solutions (pSEO)
  const solutionPages: MetadataRoute.Sitemap = useCases.map((uc) => ({
    url: `${BASE_URL}/solutions/${uc.slug}`,
    lastModified: uc.updatedAt ? new Date(uc.updatedAt) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Pages blog
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...solutionPages, ...blogPages];
}
