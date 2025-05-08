'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import CategoryFilter from '@/components/CategoryFilter/CategoryFilter';
import Pagination from '@/components/Pagination/Pagination';
import { Product, Category } from '@/types/product';
import { IconFilter, IconSortDescending, IconArrowDown, IconArrowUp } from '@tabler/icons-react';

// Types pour les props du composant
interface ProductsLayoutProps {
  // Mode pagination côté serveur
  products: Product[];
  currentPage: number;
  totalPages: number;
  
  // Mode pagination côté client
  allProducts?: Product[];
  requestedPage?: number;
  productsPerPage?: number; // Nombre de produits par page pour la pagination côté client
  
  // Props communs
  categories: Category[];
  totalProducts: number;
  title: string;
  description?: string;
  activeCategory?: string;
  
  // Paramètres de tri et filtrage
  priceRange?: string;
  pricePerGramSort?: string;
  sortParam?: string;
}

// Types pour les options de tri simplifiées
type PriceSortType = 'none' | 'price-asc' | 'price-desc';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

export default function ProductsLayout({
  // Support pour les deux modes (côté serveur et côté client)
  products,
  allProducts,
  categories,
  currentPage,
  totalPages,
  requestedPage,
  productsPerPage = 12,
  totalProducts,
  title,
  description,
  activeCategory,
}: ProductsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Seul état conservé pour le tri par prix
  const [selectedPriceSort, setSelectedPriceSort] = useState<PriceSortType>('none');
  
  // État pour la pagination côté client
  const [currentClientPage, setCurrentClientPage] = useState<number>(requestedPage || currentPage || 1);
  
  // Déterminer si nous sommes en mode pagination côté client
  const isClientSidePagination = !!allProducts;
  
  
  // Initialiser le tri depuis les paramètres d'URL
  useEffect(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam === 'price-asc' || sortParam === 'price-desc') {
      setSelectedPriceSort(sortParam);
    } else {
      setSelectedPriceSort('none');
    }
  }, [searchParams]);
  
  // Mettre à jour l'URL avec les paramètres de tri (gardé pour usage futur potentiel)
  // Fonction actuellement non utilisée mais conservée pour implémentation future
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedPriceSort !== 'none') {
      params.set('sort', selectedPriceSort);
    } else {
      params.delete('sort');
    }
    
    // Mettre à jour l'URL sans recharger la page
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  // Gestionnaire pour le changement de tri par prix
  const handlePriceSortChange = (sort: PriceSortType) => {
    // 1. Mettre à jour l'état local
    setSelectedPriceSort(sort);
    
    // 2. Préparer les paramètres d'URL
    const params = new URLSearchParams(searchParams.toString());
      
    if (sort !== 'none') {
      params.set('sort', sort);
    } else {
      params.delete('sort');
    }
    
    // 3. Mise à jour de l'URL adaptée selon le mode de pagination
    if (!isClientSidePagination) {
      // Sur la page principale, les produits sont chargés côté serveur
      // => Force un rechargement de page pour obtenir les produits triés depuis le serveur
      // => Réinitialiser la pagination à la page 1 pour le tri global
      
      // Supprimer tout paramètre de pagination existant pour revenir à la page 1
      params.delete('page');
      
      // Redirection avec rechargement complet
      window.location.href = `${pathname}?${params.toString()}`;
    } else {
      // Sur les pages de catégorie, les produits sont déjà tous chargés
      // => Navigation client sans rechargement (SPA)
      // => Réinitialiser également la pagination pour cohérence
      
      // Réinitialiser la page en mémoire
      setCurrentClientPage(1);
      
      // Supprimer le paramètre de page pour revenir à la page 1
      params.delete('page');
      
      // Navigation sans rechargement
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };
  
  // Calculer les produits à afficher et les informations de pagination
  const {
    displayedProducts,
    clientTotalPages,
    filteredTotal
  } = useMemo(() => {

    
    // Si nous sommes en mode pagination côté serveur, ou si allProducts est vide, utiliser directement les produits passés
    // CORRECTION: Vérifier si le tableau allProducts est vide en vérifiant sa longueur
    if (!isClientSidePagination || !allProducts?.length) {
      return {
        displayedProducts: products || [],
        clientTotalPages: totalPages || 1,
        filteredTotal: totalProducts
      };
    }
    
    // Copie de tous les produits pour le filtrage
    let filtered = [...allProducts];
    


    
    // Appliquer le tri par prix selon la demande
    if (selectedPriceSort !== 'none') {
      // Séparer les produits en deux groupes : ceux avec prix au gramme et ceux sans
      const productsWithPricePerGram = filtered.filter(p => 
        p.pricePerGram || 
        (p.productType === 'variable' && p.variants?.some(v => v.pricePerGram))
      );
      
      const productsWithoutPricePerGram = filtered.filter(p => 
        !p.pricePerGram && 
        !(p.productType === 'variable' && p.variants?.some(v => v.pricePerGram))
      );
      
      
      // Afficher les produits avec prix au gramme (avant tri)
      if (productsWithPricePerGram.length > 0) {
          productsWithPricePerGram.map(p => ({
            name: p.name,
            pricePerGram: p.pricePerGram,
            minPricePerGram: p.productType === 'variable' && p.variants?.length ?
              Math.min(...p.variants.filter(v => v.pricePerGram).map(v => v.pricePerGram || Infinity)) :
              p.pricePerGram
          }))
      }
      
      // Tri des produits avec prix au gramme
      productsWithPricePerGram.sort((a, b) => {
        // Pour les produits simples, utiliser directement pricePerGram
        const priceA = a.pricePerGram || 
          (a.productType === 'variable' && a.variants?.length ? 
            Math.min(...a.variants.filter(v => v.pricePerGram).map(v => v.pricePerGram || Infinity)) : 
            Infinity);
        
        const priceB = b.pricePerGram || 
          (b.productType === 'variable' && b.variants?.length ? 
            Math.min(...b.variants.filter(v => v.pricePerGram).map(v => v.pricePerGram || Infinity)) : 
            Infinity);
        
        // Tri ascendant ou descendant selon le choix
        return selectedPriceSort === 'price-asc' ? priceA - priceB : priceB - priceA;
      });
      
      // Tri des produits sans prix au gramme
      productsWithoutPricePerGram.sort((a, b) => {
        const priceA = a.price || 
          (a.productType === 'variable' && a.variants?.length ? 
            Math.min(...a.variants.map(v => v.price)) : 
            0);
        
        const priceB = b.price || 
          (b.productType === 'variable' && b.variants?.length ? 
            Math.min(...b.variants.map(v => v.price)) : 
            0);
        
        // Tri ascendant ou descendant selon le choix
        return selectedPriceSort === 'price-asc' ? priceA - priceB : priceB - priceA;
      });
      
      // Combiner les produits dans l'ordre souhaité: 
      // D'abord les produits avec prix au gramme, puis les produits sans prix au gramme
      filtered = [...productsWithPricePerGram, ...productsWithoutPricePerGram];
      
      // Version sans logging pour la production
    }
    
    // Calculer la pagination
    const start = (currentClientPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = filtered.slice(start, end);
    
    return {
      displayedProducts: paginatedProducts,
      clientTotalPages: Math.ceil(filtered.length / productsPerPage),
      filteredTotal: filtered.length
    };
  }, [
    allProducts, products, totalPages, totalProducts, isClientSidePagination,
    selectedPriceSort, currentClientPage, productsPerPage
  ]);
  
  // Gestionnaire pour le changement de page côté client
  const handleClientPageChange = (page: number) => {
    // Mettre à jour l'état local
    setCurrentClientPage(page);
    
    // Mettre à jour l'URL sans rechargement
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-[#001e27] dark:bg-[#001e27] min-h-screen">
      {/* Header section avec fond dégradé */}
      <motion.div 
        className="bg-[#001e27] dark:bg-[#001e27] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-white/20"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full border border-white/20"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{title}</h1>
            {description && <p className="text-white/80 max-w-2xl mx-auto">{description}</p>}
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          className="flex flex-col md:flex-row gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Sidebar avec filtres simplifiés */}
          <motion.aside 
            className="md:w-1/4 space-y-6"
            variants={itemVariants}
          >
            {/* Filtre par catégorie */}
            <div className="bg-[#00454f] rounded-lg shadow-lg p-6 border border-[#005965]">
              <div className="flex items-center mb-4">
                <IconFilter className="mr-2 text-[#00878a] dark:text-green-300" size={20} />
                <h2 className="font-bold text-xl text-white">Catégories</h2>
              </div>
              <CategoryFilter categories={categories} activeCategory={activeCategory} />
            </div>

            {/* Tri par prix */}
            <div className="bg-[#00454f] rounded-lg shadow-lg p-6 border border-[#005965]">
              <div className="flex items-center mb-4">
                <IconSortDescending className="mr-2 text-[#00878a] dark:text-green-300" size={20} />
                <h2 className="font-bold text-xl text-white">Tri par prix</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="price-sort-none"
                    type="radio"
                    name="price-sort"
                    checked={selectedPriceSort === 'none'}
                    onChange={() => handlePriceSortChange('none')}
                    className="h-4 w-4 text-[#00878a] focus:ring-[#00878a] dark:focus:ring-green-300"
                  />
                  <label htmlFor="price-sort-none" className="ml-2 text-sm text-white/90">Non trié</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-sort-asc"
                    type="radio"
                    name="price-sort"
                    checked={selectedPriceSort === 'price-asc'}
                    onChange={() => handlePriceSortChange('price-asc')}
                    className="h-4 w-4 text-[#00878a] focus:ring-[#00878a] dark:focus:ring-green-300"
                  />
                  <label htmlFor="price-sort-asc" className="ml-2 text-sm text-white/90 flex items-center">Du moins cher au plus cher <IconArrowUp size={14} className="ml-1 text-green-500" /></label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-sort-desc"
                    type="radio"
                    name="price-sort"
                    checked={selectedPriceSort === 'price-desc'}
                    onChange={() => handlePriceSortChange('price-desc')}
                    className="h-4 w-4 text-[#00878a] focus:ring-[#00878a] dark:focus:ring-green-300"
                  />
                  <label htmlFor="price-sort-desc" className="ml-2 text-sm text-white/90 flex items-center">Du plus cher au moins cher <IconArrowDown size={14} className="ml-1 text-red-400" /></label>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Produits et pagination */}
          <motion.section 
            className="md:w-3/4"
            variants={itemVariants}
          >
            {/* Affichage des produits */}
            {displayedProducts.length > 0 ? (
              <>
                <motion.div 
                  className="grid grid-cols-1 min-[321px]:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {displayedProducts.map((product: Product, index: number) => (
                    <motion.div 
                      key={product.id}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard product={product} index={index} />
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Affichage de la pagination */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="mt-8"
                >
                  {isClientSidePagination ? (
                    <Pagination 
                      currentPage={currentClientPage} 
                      totalPages={clientTotalPages}
                      onPageChange={handleClientPageChange} 
                    />
                  ) : (
                    <Pagination 
                      currentPage={currentPage || 1} 
                      totalPages={totalPages || 1} 
                    />
                  )}
                </motion.div>
                
                {/* Affichage du nombre total de produits */}
                <motion.div 
                  className="mt-4 text-sm text-center text-white dark:text-neutral-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  {isClientSidePagination ? filteredTotal : totalProducts} produit{(isClientSidePagination ? filteredTotal : totalProducts) !== 1 ? 's' : ''} trouvé{(isClientSidePagination ? filteredTotal : totalProducts) !== 1 ? 's' : ''}
                </motion.div>
              </>
            ) : (
              <motion.div 
                className="bg-[#00454f] rounded-lg shadow-lg p-8 text-center border border-gray-100 dark:border-[#005965]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-white dark:text-neutral-400">
                  Aucun produit ne correspond à vos critères. Essayez de modifier vos filtres.
                </p>
              </motion.div>
            )}
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}
