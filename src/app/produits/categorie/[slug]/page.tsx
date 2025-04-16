import { Metadata } from 'next';
import { getProducts, getCategories, getCategoryBySlug } from '@/services/api';
import { notFound } from 'next/navigation';
import ProductsLayout from '@/app/produits/layout-products';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// SEO - Utilise une approche qui ne génèrera pas d'erreur bloquante
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // Attendre les params dans Next.js 15
  const params = await props.params;
  const { slug } = params;

  // D'abord vérifier si nous avons cette catégorie dans nos données de secours
  // pour éviter un appel API qui peut échouer pendant la génération de métadonnées
  try {
    // Récupérer la catégorie, mais gérer silencieusement l'erreur
    const category = await getCategoryBySlug(slug).catch(() => null);
    
    if (category) {
      return {
        title: `${category.name} | Produits CBD | Chanvre Vert`,
        description: `Découvrez notre sélection de ${category.name} CBD de haute qualité - Chanvre Vert`,
        openGraph: {
          title: `${category.name} | Produits CBD | Chanvre Vert`,
          description: `Découvrez notre sélection de ${category.name} CBD de haute qualité - Chanvre Vert`,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  // Métadonnées par défaut si on ne trouve pas la catégorie
  return {
    title: 'Produits CBD par Catégorie | Chanvre Vert',
    description: 'Découvrez notre sélection de produits CBD de haute qualité par catégorie.',
  };
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  // Attendre les params dans Next.js 15
  const params = await props.params;
  const { slug } = params;
  
  // Récupérer les paramètres de recherche via les headers
  const headersList = await headers();
  const url = headersList.get('x-url') || '';
  const parsedUrl = new URL(url, 'http://localhost:3000'); // ou ton domaine prod
  const searchParams = parsedUrl.searchParams;
  
  const page = searchParams.get('page') || '1';
  const limitStr = searchParams.get('limit') || '12';
  const priceRange = searchParams.get('price') || 'all';

  const currentPage = parseInt(page, 10);
  const limit = parseInt(limitStr, 10);
  
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

  try {
    // Essayons d'abord de récupérer la catégorie
    const category = await getCategoryBySlug(slug);
    
    // Si nous arrivons ici, la catégorie existe
    const productsData = await getProducts({
      page: currentPage,
      limit,
      category: category.id,
      sort: '-createdAt',
      minPrice,
      maxPrice,
    });

    const categories = await getCategories();

    // Fonction helper pour ajouter CBD uniquement si pas déjà présent
    const formatWithCBD = (text: string) => {
      return text.includes('CBD') ? text : `${text} CBD`;
    };
    
    // Formater le titre et la description
    const title = formatWithCBD(category.name);
    const description = `Découvrez notre sélection de ${category.name.toLowerCase().replace(' cbd', '')} CBD de haute qualité`;
    
    return (
      <ProductsLayout
        products={productsData.docs}
        categories={categories}
        currentPage={currentPage}
        totalPages={productsData.totalPages}
        totalProducts={productsData.totalDocs}
        title={title}
        description={description}
        activeCategory={slug}
        priceRange={priceRange}
      />
    );
  } catch (error) {
    console.error(`Erreur lors de la récupération de la catégorie ${slug}:`, error);
    // Retourner une page 404 si la catégorie n'est pas trouvée
    return notFound();
  }
}
