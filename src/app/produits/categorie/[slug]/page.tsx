import { Metadata } from 'next';
import { getProducts, getCategories, getCategoryBySlug } from '@/services/api';
import { notFound } from 'next/navigation';
import ProductsLayout from '@/app/produits/layout-products';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// SEO - Utilise une approche qui ne générera pas d'erreur bloquante
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

// @ts-expect-error - Ignorer l'erreur de typage sur params car Next.js 15.3 a modifié la structure des paramètres
export default async function CategoryPage(props) {
  // Attendre les params dans Next.js 15
  const params = await props.params;
  const { slug } = params;
  
  // Récupérer les paramètres de recherche directement depuis la requête
  const headersList = await headers();
  
  // On essaie d'abord avec x-url
  let url = headersList.get('x-url') || '';
  
  // Si x-url est vide, on essaie avec x-invoke-path et x-invoke-query
  if (!url) {
    const path = headersList.get('x-invoke-path') || '';
    const query = headersList.get('x-invoke-query') || '';
    
    if (path) {
      url = path + (query ? `?${query}` : '');
    }
  }

  // Si toujours vide, essayons avec referer
  if (!url) {
    url = headersList.get('referer') || '';
  }
  
  // Fallback pour éviter l'erreur de construction URL
  const baseUrl = 'http://localhost:3000';
  let searchParams = new URLSearchParams();
  
  try {
    if (url) {
      // Vérifier si l'URL est bien formée
      if (url.startsWith('http')) {
        const parsedUrl = new URL(url);
        searchParams = parsedUrl.searchParams;
      } else {
        // Si c'est un chemin relatif, ajoutons le domaine
        const parsedUrl = new URL(url, baseUrl);
        searchParams = parsedUrl.searchParams;
      }
    }
  } catch (error) {
    console.error(`Erreur lors du parsing de l'URL ${url}:`, error);
  }
  
  console.log(`[DEBUG] Catégorie ${slug} - URL détectée:`, url);
  console.log(`[DEBUG] Catégorie ${slug} - Paramètres:`, Object.fromEntries(searchParams.entries()));
  
  const page = searchParams.get('page') || '1';
  const limitStr = searchParams.get('limit') || '12';
  const priceRange = searchParams.get('price') || 'all';
  const pricePerGramSort = searchParams.get('pricePerGramSort') || 'none';

  const currentPage = parseInt(page, 10);
  const limit = parseInt(limitStr, 10);
  
  console.log(`[DEBUG] Catégorie ${slug} - Page demandée: ${currentPage}, Limite: ${limit}`);
  
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
  
  // Pour la pagination côté client, on va toujours demander tous les produits
  // plutôt que de paginer côté serveur

  try {
    // Essayons d'abord de récupérer la catégorie
    const category = await getCategoryBySlug(slug);
    
    // Vérifier si nous devons trier par prix par gramme
    const shouldSortByPricePerGram = pricePerGramSort && pricePerGramSort !== 'none';
    
    // Vérifier si la catégorie actuelle est une catégorie basée sur le poids
    const weightBasedCategorySlugs = ['fleurs-cbd', 'resines-cbd', 'packs-cbd', 'fleurs%20CBD', 'résines%20CBD', 'packs%20CBD'];
    const isWeightBasedCategory = weightBasedCategorySlugs.some(weightSlug => slug.includes(weightSlug));
    
    console.log(`[DEBUG] Catégorie ${slug} - Infos pagination: isWeightBasedCategory=${isWeightBasedCategory}, shouldSortByPricePerGram=${shouldSortByPricePerGram}`);
    
    // Pour la pagination côté client, on récupère TOUS les produits en une seule requête
    // Limite élevée pour avoir tous les produits de la catégorie
    const productsData = await getProducts({
      page: 1, // Toujours demander la première page
      limit: 1000, // Limite élevée pour récupérer tous les produits de la catégorie
      category: category.id,
      sort: '-createdAt',
      minPrice,
      maxPrice,
    });
    
    console.log(`[DEBUG] Catégorie ${slug} - Récupération de tous les produits en une fois: ${productsData.docs.length} produits au total`);

    const categories = await getCategories();

    // 7️⃣ Traitement des produits pour le tri par prix par gramme
    if (shouldSortByPricePerGram) {
      // On a déjà vérifié si c'est une catégorie basée sur le poids plus haut
      // Si ce n'est pas une catégorie qui utilise le poids, on ne fait pas le tri par prix au gramme
      if (!isWeightBasedCategory) {
        console.log(`[DEBUG] Catégorie ${slug} - Catégorie non basée sur le poids, tri par prix par gramme ignoré`);
        return;
      }
      
      // Étape 1: Calculer le prix par gramme pour chaque produit
      const productsWithPricePerGram = productsData.docs.map(product => {
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

    // Pour la pagination côté client, nous n'avons pas besoin d'extraire les produits ici
    // car cette logique sera gérée dans le composant client
    
    // Tous les produits sont déjà récupérés dans productsData.docs
    // Calcul du nombre total de pages pour l'information
    const totalPages = Math.ceil(productsData.docs.length / limit);
    
    console.log(`[DEBUG] Catégorie ${slug} - Pagination client: ${productsData.docs.length} produits, ${totalPages} pages théoriques`);

    // Fonction helper pour ajouter CBD uniquement si pas déjà présent
    const formatWithCBD = (text: string) => {
      return text.includes('CBD') ? text : `${text} CBD`;
    };
    
    // Formater le titre et la description
    const title = formatWithCBD(category.name);
    const description = `Découvrez notre sélection de ${category.name.toLowerCase().replace(' cbd', '')} CBD de haute qualité`;
    
    console.log(`[DEBUG] Catégorie ${slug} - Rendu final - Page demandée: ${currentPage}, Tous les produits récupérés: ${productsData.docs.length}`);
    
    return (
      <ProductsLayout
        // Propriétés pour le mode pagination côté serveur (requises par le type)
        products={productsData.docs.slice((currentPage - 1) * limit, currentPage * limit)}
        currentPage={currentPage}
        totalPages={Math.ceil(productsData.docs.length / limit)}
        
        // Propriétés pour le mode pagination côté client 
        allProducts={productsData.docs} // Tous les produits sont passés au client
        requestedPage={currentPage} // Page demandée initialement
        productsPerPage={limit} // Nombre de produits par page
        
        // Propriétés communes
        categories={categories}
        totalProducts={productsData.docs.length}
        title={title}
        description={description}
        activeCategory={slug}
      />
    );
  } catch (error) {
    console.error(`Erreur lors de la récupération de la catégorie ${slug}:`, error);
    // Retourner une page 404 si la catégorie n'est pas trouvée
    return notFound();
  }
}
