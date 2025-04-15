import type { Product } from '@/payload-types';
import { useSafeSearchParams } from '@/hooks/useSearchParamsProvider';
import { useMemo } from 'react';

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest' | 'oldest';

export const useProductSort = (products: Product[]) => {
  const searchParams = useSafeSearchParams();
  const sortBy = (searchParams?.get('sort') as SortOption) || 'newest';

  return useMemo(() => {
    const sortedProducts = [...products];

    switch (sortBy) {
      case 'price-asc':
        sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'oldest':
        sortedProducts.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case 'newest':
      default:
        sortedProducts.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    return {
      sortedProducts,
      sortBy,
    };
  }, [products, sortBy]);
};
