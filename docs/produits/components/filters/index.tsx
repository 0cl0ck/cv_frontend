'use client';

import { ProductCategory } from '@/payload-types';
import CategoryFilter from './CategoryFilter';
import PriceFilter from './PriceFilter';
import SearchFilter from './SearchFilter';

type Props = {
  categories: ProductCategory[];
  selectedCategories: string[];
  minPrice: number;
  maxPrice: number;
};

export const ProductFilters: React.FC<Props> = ({
  categories,
  selectedCategories,
  minPrice,
  maxPrice,
}) => {
  return (
    <div className="w-full rounded-xl border shadow dark:border-0  dark:bg-[#171717] bg-background p-6 ">
      <div className="space-y-6">
        <div>
          <SearchFilter />
        </div>

        <div>
          <CategoryFilter categories={categories} selectedCategories={selectedCategories} />
        </div>

        <div>
          <PriceFilter _minPrice={minPrice} _maxPrice={maxPrice} />
        </div>
      </div>
    </div>
  );
};
