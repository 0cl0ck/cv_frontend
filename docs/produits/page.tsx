import configPromise from '@payload-config';
import type { Metadata } from 'next';
import type { Where } from 'payload';
import { getPayload } from 'payload';
import { ProductsContent } from './components/ProductsContent';
import ProductsPageClient from './page.client';

export const metadata: Metadata = {
  title: 'Produits | Chanvre Vert',
  description: 'Découvrez notre gamme de produits au chanvre.',
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// 🔹 Fonction pour récupérer les catégories
async function getCategories() {
  const payload = await getPayload({ config: configPromise });

  try {
    const categories = await payload.find({
      collection: 'product-categories',
      depth: 0, // Pas besoin de profondeur ici
    });

    return categories.docs;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// 🔹 Fonction pour récupérer les produits en fonction des catégories sélectionnées
async function getProducts(
  selectedCategories: string[],
  minPrice?: number,
  maxPrice?: number,
  searchTerm?: string,
) {
  const payload = await getPayload({ config: configPromise });

  try {
    const where: Where = {
      _status: {
        equals: 'published',
      },
    };

    if (selectedCategories.length > 0) {
      where.category = {
        in: selectedCategories,
      };
    }

    // Ajouter le filtre de recherche
    if (searchTerm) {
      where.name = {
        like: searchTerm,
      };
    }

    // Construire la requête pour prendre en compte les prix des variations
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.or = [
        // Vérifier le prix direct du produit (pour les produits simples)
        minPrice !== undefined && maxPrice !== undefined
          ? {
              and: [
                { price: { greater_than_equal: minPrice } },
                { price: { less_than_equal: maxPrice } },
              ],
            }
          : minPrice !== undefined
            ? { price: { greater_than_equal: minPrice } }
            : { price: { less_than_equal: maxPrice } },

        // Vérifier les prix des variations
        {
          and: [
            { productType: { equals: 'variable' } },
            {
              'variations.price':
                minPrice !== undefined ? { greater_than_equal: minPrice } : { exists: true },
            },
            {
              'variations.price':
                maxPrice !== undefined ? { less_than_equal: maxPrice } : { exists: true },
            },
          ],
        },
      ];
    }

    console.log('Query where clause:', JSON.stringify(where, null, 2));

    const products = await payload.find({
      collection: 'products',
      where,
      depth: 1,
    });

    return products.docs;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoryParam = params?.category;
  const minPriceParam = params?.minPrice ? Number(params.minPrice) : undefined;
  const maxPriceParam = params?.maxPrice ? Number(params.maxPrice) : undefined;
  const searchTerm = params?.search as string | undefined;

  const selectedCategories: string[] = Array.isArray(categoryParam)
    ? categoryParam
    : categoryParam
      ? [categoryParam]
      : [];

  // 🔹 Récupération des catégories et produits en parallèle
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(selectedCategories, minPriceParam, maxPriceParam, searchTerm),
  ]);

  // 🔹 Calcul de la fourchette de prix pour les filtres
  console.log('Products received:', products);

  // Log des variations pour debug
  products.forEach((product) => {
    if (product.productType === 'variable') {
      console.log(`Variations for ${product.name}:`, product.variations);
    }
  });

  const validPrices = products
    .flatMap((product) => {
      const prices: number[] = [];

      // Prix direct du produit (pour les produits simples)
      if (product.price && typeof product.price === 'number') {
        prices.push(product.price);
      }

      // Prix des variations (pour les produits variables)
      if (product.productType === 'variable' && Array.isArray(product.variations)) {
        product.variations.forEach((variation) => {
          if (variation.price && typeof variation.price === 'number') {
            prices.push(variation.price);
          }
        });
      }

      return prices;
    })
    .filter((price) => !isNaN(price));

  console.log('Valid prices found:', validPrices);

  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 100;

  console.log('Calculated price range:', { minPrice, maxPrice });

  return (
    <>
      <ProductsPageClient />
      <ProductsContent
        categories={categories}
        products={products}
        selectedCategories={selectedCategories}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />
    </>
  );
}

