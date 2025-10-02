'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/types/product';
import { searchProducts } from '@/services/api';

type UseProductSearchOptions = {
  initialQuery?: string;
  limit?: number;
  minLength?: number;
  debounceMs?: number;
};

type SearchResult = {
  query: string;
  docs: Product[];
  totalDocs: number;
};

export function useProductSearch(options: UseProductSearchOptions = {}) {
  const {
    initialQuery = '',
    limit = 8,
    minLength = 3,
    debounceMs = 250,
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim());

  useEffect(() => {
    setQuery(initialQuery);
    setDebouncedQuery(initialQuery.trim());
  }, [initialQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query, debounceMs]);

  const normalizedQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);
  const hasEnoughChars = normalizedQuery.length >= minLength;

  const queryResult = useQuery<SearchResult>({
    queryKey: ['product-search', normalizedQuery, limit],
    queryFn: async () => searchProducts(normalizedQuery, { limit }),
    enabled: hasEnoughChars,
    staleTime: 30_000,
    gcTime: 300_000,
  });

  const results = useMemo(() => {
    if (!hasEnoughChars) {
      return [] as Product[];
    }
    return queryResult.data?.docs ?? [];
  }, [hasEnoughChars, queryResult.data?.docs]);

  const totalDocs = hasEnoughChars
    ? queryResult.data?.totalDocs ?? results.length
    : 0;

  return {
    query,
    setQuery,
    debouncedQuery: normalizedQuery,
    results,
    total: totalDocs,
    isFetching: hasEnoughChars ? queryResult.isFetching : false,
    isLoading: hasEnoughChars ? queryResult.isLoading : false,
    isError: queryResult.isError,
    error: queryResult.error as Error | null,
    hasSufficientLength: hasEnoughChars,
    refetch: queryResult.refetch,
    reset: () => setQuery(''),
  };
}
