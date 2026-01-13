'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { IconSearch, IconLoader2, IconX, IconArrowRight } from '@tabler/icons-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProductSearch } from '@/hooks/useProductSearch';
import type { Product } from '@/types/product';

interface GlobalSearchProps {
  /** Variante d'affichage */
  variant?: 'header' | 'mobile' | 'hero';
  /** Placeholder personnalisé */
  placeholder?: string;
  /** Callback quand un résultat est cliqué */
  onResultClick?: () => void;
  /** Classe CSS additionnelle */
  className?: string;
}

// QueryClient instance pour ce composant isolé
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

/**
 * Wrapper avec QueryClientProvider pour isolation
 */
export function GlobalSearch(props: GlobalSearchProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalSearchInner {...props} />
    </QueryClientProvider>
  );
}

/**
 * Composant de recherche globale avec dropdown de résultats
 * Utilisable dans le header, menu mobile, ou hero section
 */
function GlobalSearchInner({
  variant = 'header',
  placeholder = 'Rechercher un produit...',
  onResultClick,
  className = '',
}: GlobalSearchProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    query,
    setQuery,
    debouncedQuery,
    results,
    total,
    isFetching,
    hasSufficientLength,
  } = useProductSearch({ limit: 5, minLength: 2 });

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ouvrir le dropdown quand il y a des résultats
  useEffect(() => {
    if (hasSufficientLength && results.length > 0) {
      setIsOpen(true);
    }
  }, [hasSufficientLength, results]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/produits?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      onResultClick?.();
    }
  };

  const handleResultClick = () => {
    setQuery('');
    setIsOpen(false);
    onResultClick?.();
  };

  const getImageUrl = (product: Product): string | null => {
    const img = product.mainImage;
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.sizes?.thumbnail?.url || img.url || null;
  };

  // Styles selon la variante
  const containerStyles = {
    header: 'w-full max-w-md',
    mobile: 'w-full',
    hero: 'w-full max-w-2xl mx-auto',
  };

  const inputStyles = {
    header: 'py-2.5 pl-10 pr-10 text-sm rounded-xl',
    mobile: 'py-3 pl-12 pr-12 text-base rounded-xl',
    hero: 'py-4 pl-14 pr-14 text-base rounded-2xl',
  };

  return (
    <div ref={containerRef} className={`relative ${containerStyles[variant]} ${className}`}>
      <form onSubmit={handleSubmit} className="relative group">
        {/* Glow effect */}
        {variant === 'hero' && (
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#EFC368] to-[#d4a84b] rounded-2xl opacity-0 group-focus-within:opacity-40 blur transition-opacity duration-300" />
        )}
        
        <div className={`relative flex items-center bg-[#003845] ${variant === 'header' ? 'border border-white/10' : 'border border-[#EFC368]/30'} ${variant === 'hero' ? 'rounded-2xl shadow-xl' : 'rounded-xl'} overflow-hidden`}>
          <IconSearch 
            className={`absolute ${variant === 'hero' ? 'left-5' : 'left-3'} text-[#EFC368]`}
            size={variant === 'hero' ? 22 : 18}
          />
          
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => hasSufficientLength && results.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className={`w-full bg-transparent text-white placeholder:text-white/50 focus:outline-none ${inputStyles[variant]}`}
            autoComplete="off"
          />
          
          {isFetching ? (
            <IconLoader2 
              className={`absolute ${variant === 'hero' ? 'right-5' : 'right-3'} text-[#EFC368] animate-spin`}
              size={variant === 'hero' ? 22 : 18}
            />
          ) : query.length > 0 ? (
            <button
              type="button"
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className={`absolute ${variant === 'hero' ? 'right-5' : 'right-3'} text-white/50 hover:text-white transition-colors`}
              aria-label="Effacer"
            >
              <IconX size={variant === 'hero' ? 20 : 16} />
            </button>
          ) : null}
        </div>
      </form>

      {/* Dropdown des résultats */}
      <AnimatePresence>
        {isOpen && hasSufficientLength && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-[#002d38] border border-[#EFC368]/20 rounded-xl shadow-2xl overflow-hidden"
          >
            {results.length > 0 ? (
              <>
                <ul className="divide-y divide-white/5">
                  {results.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/produits/${product.slug}`}
                        onClick={handleResultClick}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                      >
                        {getImageUrl(product) ? (
                          <Image
                            src={getImageUrl(product)!}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                            <IconSearch size={20} className="text-white/30" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {product.name}
                          </p>
                          {product.price && (
                            <p className="text-xs text-[#EFC368]">
                              {product.price.toFixed(2)} €
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                
                {/* Voir tous les résultats */}
                <Link
                  href={`/produits?search=${encodeURIComponent(debouncedQuery)}`}
                  onClick={handleResultClick}
                  className="flex items-center justify-center gap-2 p-3 bg-[#EFC368]/10 text-[#EFC368] text-sm font-medium hover:bg-[#EFC368]/20 transition-colors"
                >
                  Voir les {total} résultat{total > 1 ? 's' : ''}
                  <IconArrowRight size={16} />
                </Link>
              </>
            ) : (
              <div className="p-4 text-center text-white/50 text-sm">
                Aucun produit trouvé pour &quot;{debouncedQuery}&quot;
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GlobalSearch;
