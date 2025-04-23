'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import CategoryFilter from '@/components/CategoryFilter/CategoryFilter';
import Pagination from '@/components/Pagination/Pagination';
import { Product, Category } from '@/types/product';

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
      console.log('Rechargement de page pour tri avec données serveur');
      
      // Supprimer tout paramètre de pagination existant pour revenir à la page 1
      params.delete('page');
      
      // Redirection avec rechargement complet
      window.location.href = `${pathname}?${params.toString()}`;
    } else {
      // Sur les pages de catégorie, les produits sont déjà tous chargés
      // => Navigation client sans rechargement (SPA)
      // => Réinitialiser également la pagination pour cohérence
      console.log('Navigation client pour tri avec données déjà présentes');
      
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
      
      console.log(`Produits séparés: ${productsWithPricePerGram.length} avec prix/g, ${productsWithoutPricePerGram.length} sans prix/g`);
      
      // Afficher les produits avec prix au gramme (avant tri)
      if (productsWithPricePerGram.length > 0) {
        console.log('PRODUITS AVEC PRIX AU GRAMME (avant tri):', 
          productsWithPricePerGram.map(p => ({
            name: p.name,
            pricePerGram: p.pricePerGram,
            minPricePerGram: p.productType === 'variable' && p.variants?.length ?
              Math.min(...p.variants.filter(v => v.pricePerGram).map(v => v.pricePerGram || Infinity)) :
              p.pricePerGram
          }))
        );
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
      
      console.log(`Après tri: ${filtered.length} produits au total`);
      
      // Afficher les 5 premiers produits après tri pour vérification
      if (filtered.length > 0) {
        console.log('PRODUITS APRÈS TRI (5 premiers):', 
          filtered.slice(0, 5).map(p => ({
            name: p.name,
            price: p.price,
            pricePerGram: p.pricePerGram,
            effectivePrice: p.pricePerGram || 
              (p.productType === 'variable' && p.variants?.length ? 
                Math.min(...p.variants.filter(v => v.pricePerGram).map(v => v.pricePerGram || Infinity)) : 
                p.price)
          }))
        );

        // Afficher aussi les produits correspondant aux extrêmes (moins cher et plus cher)
        const cheapestProduct = filtered.find(p => p.name === 'Produit Test'); // Produit à 0,10€/g
        const secondCheapestProduct = filtered.find(p => p.name === 'produit test fleurs'); // Produit à 0,83€/g
        
        console.log('Position du produit "Produit Test" (0,10€/g):', 
          cheapestProduct ? filtered.indexOf(cheapestProduct) : 'Non trouvé');
        console.log('Position du produit "produit test fleurs" (0,83€/g):', 
          secondCheapestProduct ? filtered.indexOf(secondCheapestProduct) : 'Non trouvé');
      }
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
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Bannière/Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-8 mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">{title}</h1>
          {description && (
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">{description}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar avec filtres simplifiés */}
          <aside className="md:w-1/4">
            {/* Catégories */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6 mb-6">
              <h2 className="font-bold text-xl mb-4 text-neutral-900 dark:text-white">Catégories</h2>
              <CategoryFilter categories={categories} activeCategory={activeCategory} />
            </div>
            
            {/* Tri par prix */}
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-6">
              <h2 className="font-bold text-xl mb-4 text-neutral-900 dark:text-white">Tri par prix</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="price-sort-none"
                    type="radio"
                    name="price-sort"
                    checked={selectedPriceSort === 'none'}
                    onChange={() => handlePriceSortChange('none')}
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor="price-sort-none" className="ml-2 text-sm">Non trié</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-sort-asc"
                    type="radio"
                    name="price-sort"
                    checked={selectedPriceSort === 'price-asc'}
                    onChange={() => handlePriceSortChange('price-asc')}
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor="price-sort-asc" className="ml-2 text-sm">Du moins cher au plus cher</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-sort-desc"
                    type="radio"
                    name="price-sort"
                    checked={selectedPriceSort === 'price-desc'}
                    onChange={() => handlePriceSortChange('price-desc')}
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor="price-sort-desc" className="ml-2 text-sm">Du plus cher au moins cher</label>
                </div>
              </div>
            </div>
          </aside>

          {/* Produits et pagination */}
          <main className="md:w-3/4">
            {/* Affichage des produits */}
            {displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedProducts.map((product: Product, index: number) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
                
                {/* Affichage de la pagination */}
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
                
                {/* Affichage du nombre total de produits */}
                <div className="mt-4 text-sm text-center text-neutral-600 dark:text-neutral-400">
                  {isClientSidePagination ? filteredTotal : totalProducts} produit{(isClientSidePagination ? filteredTotal : totalProducts) !== 1 ? 's' : ''} trouvé{(isClientSidePagination ? filteredTotal : totalProducts) !== 1 ? 's' : ''}
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-8 text-center">
                <p className="text-neutral-600 dark:text-neutral-400">
                  Aucun produit ne correspond à vos critères. Essayez de modifier vos filtres.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
