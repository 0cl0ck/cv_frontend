'use client';

import { useRouter } from 'next/navigation';

export const ResetFiltersButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/produits')}
      className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      Réinitialiser les filtres
    </button>
  );
};
