"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useProductSearch } from "@/hooks/useProductSearch";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard/ProductCard";
import CategoryFilter from "@/components/CategoryFilter/CategoryFilter";
import Pagination from "@/components/Pagination/Pagination";
import { Product, Category } from "@/types/product";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  IconFilter,
  IconSortDescending,
  IconArrowDown,
  IconArrowUp,
  IconSearch,
  IconLoader2,
} from "@tabler/icons-react";
import { GiftProgressBanner } from "@/components/GiftProgressBanner";

// Types pour les props du composant
interface ProductsLayoutProps {
  // Mode pagination cote serveur
  products: Product[];
  currentPage: number;
  totalPages: number;

  // Mode pagination cote client
  allProducts?: Product[];
  requestedPage?: number;
  productsPerPage?: number; // Nombre de produits par page pour la pagination cote client

  // Props communs
  categories: Category[];
  totalProducts: number;
  title: string;
  description?: string;
  activeCategory?: string;

  // Parametres de tri et filtrage
  priceRange?: string;
  pricePerGramSort?: string;
  sortParam?: string;
  initialSearchTerm?: string;
}

// Types pour les options de tri simplifiees
type PriceSortType = "none" | "price-asc" | "price-desc";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

export default function ProductsLayout(props: ProductsLayoutProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ProductsLayoutContent {...props} />
    </QueryClientProvider>
  );
}

function ProductsLayoutContent({
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
  initialSearchTerm,
}: ProductsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawSearchParam = searchParams.get("search");
  const initialQueryFromUrl = rawSearchParam ?? (initialSearchTerm ?? "");

  // Seul etat conserve pour le tri par prix
  const [selectedPriceSort, setSelectedPriceSort] =
    useState<PriceSortType>("none");

  // a‰tat pour la pagination cote client
  const [currentClientPage, setCurrentClientPage] = useState<number>(
    requestedPage || currentPage || 1
  );

  // Determiner si nous sommes en mode pagination cote client
  const isClientSidePagination = !!allProducts;

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery,
    results: searchResults,
    total: searchTotal,
    isFetching: searchIsFetching,
    isLoading: searchIsLoading,
    isError: searchIsError,
    error: searchError,
    hasSufficientLength: searchReady,
  } = useProductSearch({ initialQuery: initialQueryFromUrl, limit: productsPerPage });

  useEffect(() => {
    const currentValue = rawSearchParam ?? "";
    const nextValue = searchReady ? debouncedQuery : "";

    if (nextValue === currentValue) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (nextValue) {
      params.set("search", nextValue);
    } else {
      params.delete("search");
    }

    const nextUrl = params.toString();
    router.replace(nextUrl ? `${pathname}?${nextUrl}` : pathname, { scroll: false });
  }, [debouncedQuery, pathname, rawSearchParam, router, searchParams, searchReady]);

  // Initialiser le tri depuis les parametres d'URL
  useEffect(() => {
    const sortParam = searchParams.get("sort");
    if (sortParam === "price-asc" || sortParam === "price-desc") {
      setSelectedPriceSort(sortParam);
    } else {
      setSelectedPriceSort("none");
    }
  }, [searchParams]);

  // Mettre a  jour l'URL avec les parametres de tri (garde pour usage futur potentiel)
  // Fonction actuellement non utilisee mais conservee pour implementation future
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedPriceSort !== "none") {
      params.set("sort", selectedPriceSort);
    } else {
      params.delete("sort");
    }

    // Mettre a  jour l'URL sans recharger la page
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Gestionnaire pour le changement de tri par prix
  const handlePriceSortChange = (sort: PriceSortType) => {
    // 1. Mettre a  jour l'etat local
    setSelectedPriceSort(sort);

    // 2. Preparer les parametres d'URL
    const params = new URLSearchParams(searchParams.toString());

    if (sort !== "none") {
      params.set("sort", sort);
    } else {
      params.delete("sort");
    }

    // 3. Mise a  jour de l'URL adaptee selon le mode de pagination
    if (!isClientSidePagination) {
      // Sur la page principale, les produits sont charges cote serveur
      // => Force un rechargement de page pour obtenir les produits tries depuis le serveur
      // => Reinitialiser la pagination a  la page 1 pour le tri global

      // Supprimer tout parametre de pagination existant pour revenir a  la page 1
      params.delete("page");

      // Redirection avec rechargement complet
      window.location.href = `${pathname}?${params.toString()}`;
    } else {
      // Sur les pages de categorie, les produits sont deja  tous charges
      // => Navigation client sans rechargement (SPA)
      // => Reinitialiser egalement la pagination pour coherence

      // Reinitialiser la page en memoire
      setCurrentClientPage(1);

      // Supprimer le parametre de page pour revenir a  la page 1
      params.delete("page");

      // Navigation sans rechargement
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  // Calculer les produits a afficher et les informations de pagination

  const baseListing = useMemo(() => {

    if (!isClientSidePagination || !allProducts?.length) {

      return {

        displayedProducts: products || [],

        clientTotalPages: totalPages || 1,

        filteredTotal: totalProducts,

      };

    }



    let filtered = [...allProducts];



    if (selectedPriceSort !== "none") {

      const productsWithPricePerGram = filtered.filter(

        (p) =>

          p.pricePerGram ||

          (p.productType === "variable" &&

            p.variants?.some((v) => v.pricePerGram))

      );



      const productsWithoutPricePerGram = filtered.filter(

        (p) =>

          !p.pricePerGram &&

          !(

            p.productType === "variable" &&

            p.variants?.some((v) => v.pricePerGram)

          )

      );



      if (productsWithPricePerGram.length > 0) {

        productsWithPricePerGram.map((p) => ({

          name: p.name,

          pricePerGram: p.pricePerGram,

          minPricePerGram:

            p.productType === "variable" && p.variants?.length

              ? Math.min(

                  ...p.variants

                    .filter((v) => v.pricePerGram)

                    .map((v) => v.pricePerGram || Infinity)

                )

              : p.pricePerGram,

        }));

      }



      productsWithPricePerGram.sort((a, b) => {

        const priceA =

          a.pricePerGram ||

          (a.productType === "variable" && a.variants?.length

            ? Math.min(

                ...a.variants

                  .filter((v) => v.pricePerGram)

                  .map((v) => v.pricePerGram || Infinity)

              )

            : Infinity);



        const priceB =

          b.pricePerGram ||

          (b.productType === "variable" && b.variants?.length

            ? Math.min(

                ...b.variants

                  .filter((v) => v.pricePerGram)

                  .map((v) => v.pricePerGram || Infinity)

              )

            : Infinity);



        return selectedPriceSort === "price-asc"

          ? priceA - priceB

          : priceB - priceA;

      });



      productsWithoutPricePerGram.sort((a, b) => {

        const priceA =

          a.price ||

          (a.productType === "variable" && a.variants?.length

            ? Math.min(...a.variants.map((v) => v.price))

            : 0);



        const priceB =

          b.price ||

          (b.productType === "variable" && b.variants?.length

            ? Math.min(...b.variants.map((v) => v.price))

            : 0);



        return selectedPriceSort === "price-asc"

          ? priceA - priceB

          : priceB - priceA;

      });



      filtered = [...productsWithPricePerGram, ...productsWithoutPricePerGram];

    }



    const start = (currentClientPage - 1) * productsPerPage;

    const end = start + productsPerPage;

    const paginatedProducts = filtered.slice(start, end);



    return {

      displayedProducts: paginatedProducts,

      clientTotalPages: Math.ceil(filtered.length / productsPerPage),

      filteredTotal: filtered.length,

    };

  }, [

    allProducts,

    products,

    totalPages,

    totalProducts,

    isClientSidePagination,

    selectedPriceSort,

    currentClientPage,

    productsPerPage,

  ]);



  const baseDisplayedProducts = baseListing.displayedProducts;

  const baseClientTotalPages = baseListing.clientTotalPages;

  const baseFilteredTotal = baseListing.filteredTotal;



  const searchActive = searchReady;

  const searchBusy = searchActive && (searchIsFetching || searchIsLoading);

  const activeProducts = searchActive ? searchResults : baseDisplayedProducts;

  const activeClientTotalPages = searchActive ? 1 : baseClientTotalPages;

  const activeFilteredTotal = searchActive ? searchTotal : baseFilteredTotal;

  const totalForDisplay = searchActive

    ? activeFilteredTotal

    : isClientSidePagination

    ? baseFilteredTotal

    : totalProducts;

  const pluralSuffix = totalForDisplay !== 1 ? "s" : "";

  const showSearchEmptyState = searchActive && !searchBusy && activeProducts.length === 0;



  // Gestionnaire pour le changement de page cote client
  const handleClientPageChange = (page: number) => {
    // Mettre a  jour l'etat local
    setCurrentClientPage(page);

    // Mettre a  jour l'URL sans rechargement
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-[#001e27] dark:bg-[#001e27] min-h-screen">
      {/* Header section avec fond degrade */}
      <motion.div
        className="bg-[#001e27] dark:bg-[#001e27] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* a‰lements decoratifs */}
        <div className="absolute inset-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-white/20"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full border border-white/20"></div>
        </div>
        {/* Bannière progression cadeaux */}
        <GiftProgressBanner compact />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {title}
            </h1>
            {description && (
              <p className="text-white/80 max-w-2xl mx-auto">{description}</p>
            )}
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
          {/* Sidebar avec filtres simplifies */}
          <motion.aside className="md:w-1/4 space-y-6" variants={itemVariants}>
            {/* Filtre par categorie */}
            <div className="bg-[#00454f] rounded-lg shadow-lg p-6 border border-[#005965]">
              <div className="flex items-center mb-4">
                <IconFilter
                  className="mr-2 text-[#00878a] dark:text-green-300"
                  size={20}
                />
                <h2 className="font-bold text-xl text-white">Categories</h2>
              </div>
              <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
              />
            </div>

            {/* Tri par prix */}
            <div className="bg-[#00454f] rounded-lg shadow-lg p-6 border border-[#005965]">
              <div className="flex items-center mb-4">
                <IconSortDescending
                  className="mr-2 text-[#00878a] dark:text-green-300"
                  size={20}
                />
                <h2 className="font-bold text-xl text-white">Tri par prix</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="price-sort-none"
                    type="radio"
                    name="price-sort"
                    checked={selectedPriceSort === "none"}
                    onChange={() => handlePriceSortChange("none")}
                    className="h-4 w-4 text-[#00878a] focus:ring-[#00878a] dark:focus:ring-green-300"
                  />
                  <label
                    htmlFor="price-sort-none"
                    className="ml-2 text-sm text-white/90"
                  >
                    Non trie
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-sort-asc"
                    type="radio"
                    name="price-sort"
                    checked={selectedPriceSort === "price-asc"}
                    onChange={() => handlePriceSortChange("price-asc")}
                    className="h-4 w-4 text-[#00878a] focus:ring-[#00878a] dark:focus:ring-green-300"
                  />
                  <label
                    htmlFor="price-sort-asc"
                    className="ml-2 text-sm text-white/90 flex items-center"
                  >
                    Du moins cher au plus cher{" "}
                    <IconArrowUp size={14} className="ml-1 text-green-500" />
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-sort-desc"
                    type="radio"
                    name="price-sort"
                    checked={selectedPriceSort === "price-desc"}
                    onChange={() => handlePriceSortChange("price-desc")}
                    className="h-4 w-4 text-[#00878a] focus:ring-[#00878a] dark:focus:ring-green-300"
                  />
                  <label
                    htmlFor="price-sort-desc"
                    className="ml-2 text-sm text-white/90 flex items-center"
                  >
                    Du plus cher au moins cher{" "}
                    <IconArrowDown size={14} className="ml-1 text-red-400" />
                  </label>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Produits et pagination */}
          <motion.section className="md:w-3/4" variants={itemVariants}>

                        <div className="mb-6">
              <label htmlFor="product-search-input" className="sr-only">
                Search products
              </label>

              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                <input
                  id="product-search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder='Rechercher &quot;fleurs cbd&quot; ou &quot;amnesia&quot;'
                  className="w-full rounded-full bg-[#002732] py-3 pl-11 pr-12 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#EFC368]"
                  autoComplete="off"
                  inputMode="search"
                />
                {searchBusy ? (
                  <IconLoader2
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#EFC368] animate-spin"
                    size={18}
                  />
                ) : null}
              </div>

              <div className="mt-2 min-h-[1.25rem] text-sm text-white/70">
                {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 ? (
                  <span>Tapez au moins 3 caracteres pour lancer la recherche.</span>
                ) : searchActive ? (
                  searchBusy ? (
                    <span>Recherche en cours...</span>
                  ) : activeFilteredTotal > 0 ? (
                    <span>
                      {activeFilteredTotal} resultat{pluralSuffix} pour &quot;
                      <span className="font-semibold">{debouncedQuery}</span>
                      &quot;
                    </span>
                  ) : (
                    <span>
                      Aucun resultat pour &quot;
                      <span className="font-semibold">{debouncedQuery}</span>
                      &quot;.
                    </span>
                  )
                ) : (
                  <span className="text-white/40">
                    Astuce : essayez des mots-cles comme &quot;fleurs cbd&quot; ou &quot;amnesia&quot;.
                  </span>
                )}
              </div>

              {searchIsError ? (
                <p className="mt-1 text-sm text-red-400">
                  {searchError instanceof Error
                    ? searchError.message
                    : 'Impossible de charger les resultats. Veuillez reessayer.'}
                </p>
              ) : null}
            </div>

            {/* Affichage des produits */}

            {activeProducts.length > 0 ? (

              <>

                <motion.div

                  className="grid grid-cols-1 min-[321px]:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"

                  variants={containerVariants}

                  initial="hidden"

                  animate="visible"

                >

                  {activeProducts.map((product: Product, index: number) => (

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

                {searchActive ? null : (

                  <motion.div

                    initial={{ opacity: 0 }}

                    animate={{ opacity: 1 }}

                    transition={{ delay: 0.5, duration: 0.6 }}

                    className="mt-8"

                  >

                    {isClientSidePagination ? (

                      <Pagination

                        currentPage={currentClientPage}

                        totalPages={activeClientTotalPages}

                        onPageChange={handleClientPageChange}

                      />

                    ) : (

                      <Pagination

                        currentPage={currentPage || 1}

                        totalPages={totalPages || 1}

                      />

                    )}

                  </motion.div>

                )}



                {/* Affichage du nombre total de produits */}

                <motion.div

                  className="mt-4 text-sm text-center text-white dark:text-neutral-400"

                  initial={{ opacity: 0 }}

                  animate={{ opacity: 1 }}

                  transition={{ delay: 0.7, duration: 0.6 }}

                >

                  {totalForDisplay} resultat{pluralSuffix} trouve{pluralSuffix}

                </motion.div>

              </>

            ) : showSearchEmptyState ? (

              <motion.div

                className="bg-[#00454f] rounded-lg shadow-lg p-8 text-center border border-gray-100 dark:border-[#005965]"

                initial={{ opacity: 0, scale: 0.95 }}

                animate={{ opacity: 1, scale: 1 }}

                transition={{ duration: 0.5 }}

              >

                <p className="text-white dark:text-neutral-400">

                  Aucun produit ne correspond a &quot;

                  <span className="font-semibold">{debouncedQuery}</span>

                  &quot;.

                </p>

              </motion.div>

            ) : (

              <motion.div

                className="bg-[#00454f] rounded-lg shadow-lg p-8 text-center border border-gray-100 dark:border-[#005965]"

                initial={{ opacity: 0, scale: 0.95 }}

                animate={{ opacity: 1, scale: 1 }}

                transition={{ duration: 0.5 }}

              >

                <p className="text-white dark:text-neutral-400">

                  Aucun produit ne correspond a vos filtres. Ajustez-les puis reessayez.

                </p>

              </motion.div>

            )}

          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}

