import { headers } from 'next/headers';
import { getProducts, getCategories } from '@/services/api';
import ProductsLayout from '@/app/produits/layout-products';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tous nos produits CBD | Chanvre Vert',
  description: 'Découvrez notre gamme complète de produits CBD de haute qualité - fleurs, huiles, infusions et plus encore.',
};

export default async function ProductsPage(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  props: { searchParams?: Promise<URLSearchParams> }
) {
  // Récupérer les query params dynamiquement, en vérifiant si Next.js les fournit directement
  const headersList = await headers();
  const url = headersList.get('x-url') || '';
  const parsedUrl = new URL(url, 'http://localhost:3000'); // ou ton vrai domaine
  const searchParams = parsedUrl.searchParams;

  const page = searchParams.get('page') || '1';
  const limitStr = searchParams.get('limit') || '12';
  const priceRange = searchParams.get('price') || 'all';

  const currentPage = parseInt(page);
  const limit = parseInt(limitStr);
  
  // Configurer les filtres de prix en fonction de la plage sélectionnée
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  
  switch (priceRange) {
    case 'under-20':
      maxPrice = 20;
      break;
    case '20-to-50':
      minPrice = 20;
      maxPrice = 50;
      break;
    case 'above-50':
      minPrice = 50;
      break;
    // Pour 'all', on ne met pas de filtre de prix
  }

  const productsData = await getProducts({
    page: currentPage,
    limit: limit,
    sort: '-createdAt',
    minPrice,
    maxPrice,
  });

  const categories = await getCategories();

  return (
    <ProductsLayout
      products={productsData.docs}
      categories={categories}
      currentPage={currentPage}
      totalPages={productsData.totalPages}
      totalProducts={productsData.totalDocs}
      title="Tous nos produits CBD"
      description="Découvrez notre gamme complète de produits CBD de haute qualité"
      priceRange={priceRange}
    />
  );
}
