import { getProducts, getCategories } from '@/services/api';
import ProductsLayout from '@/app/produits/layout-products';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tous nos produits CBD | Chanvre Vert',
  description: 'Découvrez notre gamme complète de produits CBD de haute qualité - fleurs, huiles, infusions et plus encore.',
};

// type RawParams = {
//   page?: string | string[];
//   limit?: string | string[];
//   price?: string | string[];
//   pricePerGramSort?: string | string[];
//   sort?: string | string[]; // Paramètre de tri général (price-asc, price-desc)
// };

// @ts-expect-error - Ignorer l'erreur de typage sur props car Next.js 15.3 a modifié la structure des searchParams
export default async function ProductsPage(props) {
  // 1️⃣ On attend la Promise
  const params = await props.searchParams;

  // 2️⃣ On extrait « brut » (peut être string | string[] | undefined)
  const pageRaw  = params.page;
  const limitRaw = params.limit;
  const priceRaw = params.price;
  const pricePerGramSortRaw = params.pricePerGramSort;

  // 3️⃣ On normalise en string, avec fallback si besoin
  const pageStr  = Array.isArray(pageRaw)  ? pageRaw[0]  : pageRaw  ?? '1';
  const limitStr = Array.isArray(limitRaw) ? limitRaw[0] : limitRaw ?? '12';
  const price    = Array.isArray(priceRaw) ? priceRaw[0] : priceRaw ?? 'all';
  const pricePerGramSort = Array.isArray(pricePerGramSortRaw) ? pricePerGramSortRaw[0] : pricePerGramSortRaw ?? 'none';
  const sortParam = Array.isArray(params.sort) ? params.sort[0] : params.sort ?? 'newest';

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

  // 6⭐ On récupère les données
  const apiSortParam = '-createdAt'; // Par défaut, tri par nouveautés (le plus récent d'abord)
  let needsGlobalSorting = false;
  
  // Vérifier si nous avons besoin d'un tri qui nécessite de récupérer tous les produits
  const shouldSortByPricePerGram = pricePerGramSort && pricePerGramSort !== 'none';
  const shouldSortByPrice = sortParam === 'price-asc' || sortParam === 'price-desc';
  
  // Dans ces cas, nous devons récupérer TOUS les produits pour faire un tri global
  needsGlobalSorting = shouldSortByPricePerGram || shouldSortByPrice;
  
  // CORRECTION: Ne pas utiliser le tri par l'API pour les paramètres price-asc/price-desc
  // car nous voulons appliquer notre logique de tri personnalisée (qui met les produits
  // avec prix au gramme en premier)
  
  // Récupérer tous les produits sans pagination si tri global requis
  console.log(`Récupération des produits avec tri ${needsGlobalSorting ? 'global' : 'paginé'} et paramètre de tri: ${apiSortParam}`);
  
  // Vérification critique : s'assurer que shouldSortByPrice est bien détecté quand price-asc/price-desc est demandé
  console.log('DEBUG - shouldSortByPrice:', shouldSortByPrice, 'sortParam:', sortParam);
  
  // Récupérer TOUS les produits (en commençant par page 1) quand on a besoin d'un tri par prix
  // Sinon utiliser la pagination normale avec currentPage
  const productsData = await getProducts({
    page: needsGlobalSorting ? 1 : currentPage, // Utiliser currentPage pour la pagination standard, page 1 pour le tri global
    limit: needsGlobalSorting ? 1000 : limitNum, // Grande limite pour avoir TOUS les produits si tri global
    sort: '-createdAt', // On ignore le tri serveur pour prix, on le fera en client
    minPrice,
    maxPrice,
  });
  
  console.log(`Récupération terminée: ${productsData.docs.length} produits sur ${productsData.totalDocs} disponibles`);
  console.log('Tri demandé:', sortParam);

  // 7️⃣ Traitement des produits pour le tri par prix par gramme
  if (shouldSortByPricePerGram) {
    // Vérifier quelles catégories sont concernees par le prix au gramme
    const weightBasedCategorySlugs = ['fleurs-cbd', 'resines-cbd', 'packs-cbd', 'fleurs%20CBD', 'résines%20CBD', 'packs%20CBD'];
    
    // Filtrer d'abord pour ne garder que les produits des catégories concernées
    const eligibleProducts = productsData.docs.filter(product => {
      if (!product.category) return false;
      
      const categorySlug = typeof product.category === 'string'
        ? product.category
        : product.category.slug;
      
      return weightBasedCategorySlugs.some(slug => categorySlug.includes(slug));
    });
    
    // Étape 1: Calculer le prix par gramme pour chaque produit
    const productsWithPricePerGram = eligibleProducts.map(product => {
      let pricePerGram = 0;
      
      // Pour les produits variables
      if (product.productType === 'variable' && product.variants && product.variants.length > 0) {
        const variantsWithPricePerGram = product.variants.filter(v => v.pricePerGram !== undefined && v.pricePerGram > 0);
        if (variantsWithPricePerGram.length > 0) {
          pricePerGram = Math.min(...variantsWithPricePerGram.map(v => v.pricePerGram!));
        } else {
          const variantsWithWeight = product.variants.filter(v => v.weight && v.weight > 0);
          if (variantsWithWeight.length > 0) {
            pricePerGram = Math.min(...variantsWithWeight.map(v => v.price / v.weight!));
          }
        }
      } 
      // Pour les produits simples avec weight et price
      else if (product.productType === 'simple' && product.weight && product.weight > 0 && product.price) {
        pricePerGram = product.price / product.weight;
      }
      // Pour les produits avec pricePerGram déjà calculé
      else if (product.pricePerGram && product.pricePerGram > 0) {
        pricePerGram = product.pricePerGram;
      }
      
      return { product, pricePerGram };
    });
    
    // Étape 2: Filtrer les produits sans prix par gramme
    const filteredProducts = productsWithPricePerGram.filter(item => item.pricePerGram > 0);
    
    // Étape 3: Trier par prix au gramme
    filteredProducts.sort((a, b) => {
      return pricePerGramSort === 'asc'
        ? a.pricePerGram - b.pricePerGram 
        : b.pricePerGram - a.pricePerGram;
    });
    
    // Étape 4: Convertir les résultats en tableau de produits
    productsData.docs = filteredProducts.map(item => item.product);
    // Mettre à jour le compte total de produits
    productsData.totalDocs = productsData.docs.length;
  }
  const categories = await getCategories();

  // Si on a trié par prix par gramme ou par prix global, on applique la pagination manuellement
  let displayedProducts = productsData.docs;
  let totalPages = productsData.totalPages;
  
  if (needsGlobalSorting) {
    console.log(`Tri global appliqué: ${productsData.docs.length} produits récupérés au total`);
    // Calcul de l'index de début et de fin pour la pagination manuelle
    const startIndex = (currentPage - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    // Extraction des produits pour la page courante
    displayedProducts = productsData.docs.slice(startIndex, endIndex);
    
    // Recalcul du nombre total de pages
    totalPages = Math.ceil(productsData.docs.length / limitNum);
    console.log(`Pagination manuelle: page ${currentPage}/${totalPages}, affichage de ${displayedProducts.length} produits`);
  }

  // CORRECTION: Passer TOUS les produits récupérés quand shouldSortByPrice est true
  return (
    <ProductsLayout
      products={displayedProducts}
      // Passer tous les produits récupérés comme prop allProducts si tri par prix demandé
      allProducts={shouldSortByPrice ? productsData.docs : []}
      categories={categories}
      currentPage={currentPage}
      totalPages={totalPages}
      totalProducts={productsData.totalDocs}
      title="Tous nos produits CBD"
      description="Découvrez notre gamme complète de produits CBD de haute qualité"
      priceRange={price}
      pricePerGramSort={pricePerGramSort}
      sortParam={sortParam}
    />
  );
}
