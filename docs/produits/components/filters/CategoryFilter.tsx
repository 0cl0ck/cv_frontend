'use client';

import { useSafeSearchParams } from '@/hooks/useSearchParamsProvider';
import { ProductCategory } from '@/payload-types';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback } from 'react';

type Props = {
  categories: ProductCategory[];
  selectedCategories: string[];
};

const CategoryFilter: React.FC<Props> = ({ categories, selectedCategories }) => {
  const router = useRouter();
  const searchParams = useSafeSearchParams();

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      const currentCategories = params.getAll('category');

      if (currentCategories.includes(categoryId)) {
        // Remove category
        const newCategories = currentCategories.filter((cat) => cat !== categoryId);
        params.delete('category');
        newCategories.forEach((cat) => params.append('category', cat));
      } else {
        // Add category
        params.append('category', categoryId);
      }

      router.push(`/produits?${params.toString()}`);
    },
    [router, searchParams],
  );

  console.log(selectedCategories);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Catégories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <label key={category.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.id)}
              onChange={() => handleCategoryChange(category.id)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm">{category.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const CategoryFilterWrapper = ({ categories, selectedCategories }: Props) => {
  return (
    <Suspense fallback={<div>Chargement des catégories...</div>}>
      <CategoryFilter categories={categories} selectedCategories={selectedCategories} />
    </Suspense>
  );
};

export default CategoryFilterWrapper;

