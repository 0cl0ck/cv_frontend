import { NextResponse } from 'next/server';

// Strict environment variable validation - no fallbacks to prevent split-brain
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_SITE_URL environment variable is required');
}
if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}

// ISR: Cache pendant 1 heure, régénère en background
export const revalidate = 3600;

interface ProductDoc {
  name: string;
  slug: string;
  shortDescription?: string;
  category?: { name: string; slug: string };
  productDetails?: { cbdContent?: number };
}

interface CategoryDoc {
  name: string;
  slug: string;
}

interface PostDoc {
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
}

export async function GET() {
  // 1. En-tête avec "System Prompt" pour l'IA
  let content = `# Chanvre Vert\n\n`;
  content += `> Chanvre Vert est une boutique française en ligne spécialisée dans les produits CBD premium. `;
  content += `Nous proposons des fleurs, huiles, résines et infusions CBD 100% légales, `;
  content += `testées en laboratoire et conformes à la réglementation française (THC < 0.3%).\n\n`;

  try {
    // 2. Récupération des données depuis PayloadCMS
    const [productsRes, categoriesRes, postsRes] = await Promise.all([
      fetch(`${API_URL}/api/products?limit=100&where[isActive][equals]=true&depth=1`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${API_URL}/api/categories?limit=50`, {
        next: { revalidate: 3600 },
      }),
      fetch(`${API_URL}/api/posts?limit=50&where[status][equals]=published&sort=-publishedAt`, {
        next: { revalidate: 3600 },
      }),
    ]);

    const products: { docs: ProductDoc[] } = productsRes.ok ? await productsRes.json() : { docs: [] };
    const categories: { docs: CategoryDoc[] } = categoriesRes.ok ? await categoriesRes.json() : { docs: [] };
    const posts: { docs: PostDoc[] } = postsRes.ok ? await postsRes.json() : { docs: [] };

    // 3. Section Catégories (navigation principale)
    content += `## Catégories de Produits\n\n`;
    for (const cat of categories.docs) {
      content += `- [${cat.name}](${BASE_URL}/produits/categorie/${cat.slug}): `;
      content += `Découvrez notre sélection de ${cat.name.toLowerCase()}\n`;
    }

    // 4. Section Produits (top 20 par pertinence)
    content += `\n## Produits CBD\n\n`;
    const topProducts = products.docs.slice(0, 20);
    for (const prod of topProducts) {
      const desc = prod.shortDescription || 
        `${prod.category?.name || 'CBD'} - ${prod.productDetails?.cbdContent ? `${prod.productDetails.cbdContent}% CBD` : 'haute qualité'}`;
      content += `- [${prod.name}](${BASE_URL}/produits/${prod.slug}): ${desc}\n`;
    }

    // 5. Section Blog/Guides
    if (posts.docs.length > 0) {
      content += `\n## Guides & Conseils CBD\n\n`;
      for (const post of posts.docs.slice(0, 10)) {
        const desc = post.excerpt || 'Article sur le CBD et le bien-être';
        content += `- [${post.title}](${BASE_URL}/blog/${post.slug}): ${desc}\n`;
      }
    }

    // 6. Pages fixes importantes
    content += `\n## Informations\n\n`;
    content += `- [À propos](${BASE_URL}/a-propos): Notre histoire, nos valeurs et notre engagement qualité\n`;
    content += `- [Contact](${BASE_URL}/contact): Service client basé en France\n`;

    // 7. Section Optional (secondaire)
    content += `\n## Optional\n\n`;
    content += `- [Mentions légales](${BASE_URL}/legal): Informations légales et réglementaires\n`;
    content += `- [CGV](${BASE_URL}/cgv): Conditions générales de vente\n`;
    content += `- [Politique de confidentialité](${BASE_URL}/confidentialite): Protection des données personnelles\n`;

  } catch (error) {
    console.error('Erreur génération llms.txt:', error);
    // Fallback minimal
    return new NextResponse(
      `# Chanvre Vert\n\n> Boutique CBD française. Service temporairement indisponible.\n\n- [Accueil](${BASE_URL})`,
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  // 8. Réponse avec headers de cache optimisés
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
