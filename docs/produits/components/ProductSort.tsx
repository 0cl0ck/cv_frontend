'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSafeSearchParams } from '@/hooks/useSearchParamsProvider';
import { IconArrowsSort } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const sortOptions = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'name-asc', label: 'Nom A-Z' },
  { value: 'name-desc', label: 'Nom Z-A' },
];

const ProductSort: React.FC = () => {
  const router = useRouter();
  const searchParams = useSafeSearchParams();
  const [currentSort, setCurrentSort] = useState('newest');

  // Mettre à jour currentSort lorsque searchParams change
  useEffect(() => {
    if (searchParams) {
      setCurrentSort(searchParams.get('sort') || 'newest');
    }
  }, [searchParams]);

  const handleSortChange = (value: string) => {
    setCurrentSort(value);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('sort', value);
    router.push(`/produits?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <IconArrowsSort className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[140px] border-none bg-transparent text-sm text-neutral-700 focus:ring-0 dark:text-neutral-200">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const ProductSortWrapper = () => {
  return (
    <Suspense>
      <ProductSort />
    </Suspense>
  );
};

export default ProductSortWrapper;
export { ProductSort };

