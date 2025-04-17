import { getProducts, getCategories } from '@/services/api';
import ProductsLayout from '@/app/produits/layout-products';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tous nos produits CBD | Chanvre Vert',
  description: 'Découvrez notre gamme complète de produits CBD de haute qualité - fleurs, huiles, infusions et plus encore.',
};

type RawParams = {
  page?: string | string[];
  limit?: string | string[];
  price?: string | string[];
};

export default async function ProductsPage(
  props: { searchParams: Promise<RawParams> }
) {
  // 1️⃣ On attend la Promise
  const params = await props.searchParams;

  // 2️⃣ On extrait « brut » (peut être string | string[] | undefined)
  const pageRaw  = params.page;
  const limitRaw = params.limit;
  const priceRaw = params.price;

  // 3️⃣ On normalise en string, avec fallback si besoin
  const pageStr  = Array.isArray(pageRaw)  ? pageRaw[0]  : pageRaw  ?? '1';
  const limitStr = Array.isArray(limitRaw) ? limitRaw[0] : limitRaw ?? '12';
  const price    = Array.isArray(priceRaw) ? priceRaw[0] : priceRaw ?? 'all';

  // 4️⃣ On parse en nombre
  const currentPage = parseInt(pageStr, 10);
  const limitNum    = parseInt(limitStr, 10);

  // 5️⃣ On configure les filtres de prix
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  switch (price) {
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
    // 'all' => pas de filtre
  }

  // 6️⃣ On récupère les données
  const productsData = await getProducts({
    page:    currentPage,
    limit:   limitNum,
    sort:    '-createdAt',
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
      priceRange={price}
    />
  );
}
