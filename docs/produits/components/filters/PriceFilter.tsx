'use client';

import { Button } from '@/components/ui/button';
import { useSafeSearchParams } from '@/hooks/useSearchParamsProvider';
import { IconCurrencyEuro } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

type Props = {
  _minPrice: number;
  _maxPrice: number;
};

// Définir des plages de prix prédéfinies
const PRICE_RANGES = [
  { label: 'Moins de 20€', min: 0, max: 20 },
  { label: '20€ - 25€', min: 20, max: 25 },
  { label: '25€ - 30€', min: 25, max: 30 },
  { label: '30€ et plus', min: 30, max: null },
];

const PriceFilter: React.FC<Props> = ({ _minPrice, _maxPrice }) => {
  const router = useRouter();
  const searchParams = useSafeSearchParams();
  const [selectedRange, setSelectedRange] = useState<number | null>(null);

  // Initialiser la sélection en fonction des paramètres d'URL
  useEffect(() => {
    const urlMinPrice = searchParams?.get('minPrice');
    const urlMaxPrice = searchParams?.get('maxPrice');

    if (urlMinPrice || urlMaxPrice) {
      const min = urlMinPrice ? Number(urlMinPrice) : 0;
      const max = urlMaxPrice ? Number(urlMaxPrice) : Infinity;

      const rangeIndex = PRICE_RANGES.findIndex(
        (range) =>
          range.min === min && (range.max === max || (range.max === null && max === Infinity)),
      );

      setSelectedRange(rangeIndex !== -1 ? rangeIndex : null);
    } else {
      setSelectedRange(null);
    }
  }, [searchParams]);

  // Appliquer le filtre de prix
  const applyPriceRange = useCallback(
    (index: number | null) => {
      const params = new URLSearchParams(searchParams?.toString() || '');

      if (index === null) {
        params.delete('minPrice');
        params.delete('maxPrice');
      } else {
        const range = PRICE_RANGES[index];
        params.set('minPrice', range.min.toString());
        if (range.max !== null) {
          params.set('maxPrice', range.max.toString());
        } else {
          params.delete('maxPrice');
        }
      }

      router.push(`/produits?${params.toString()}`);
      setSelectedRange(index);
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <IconCurrencyEuro className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200 dark:bg-[#171717]" />
        <h2 className="text-lg font-semibold">Prix</h2>
      </div>

      <div className="space-y-2">
        {/* Option "Tous les prix" */}
        <Button
          variant={selectedRange === null ? 'default' : 'price'}
          className="w-full justify-start"
          onClick={() => applyPriceRange(null)}
        >
          Tous les prix
        </Button>

        {/* Plages de prix prédéfinies */}
        {PRICE_RANGES.map((range, index) => (
          <Button
            key={index}
            variant={selectedRange === index ? 'default' : 'price'}
            className="w-full justify-start"
            onClick={() => applyPriceRange(index)}
          >
            {range.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default function PriceFilterWrapper(props: Props) {
  return (
    <Suspense fallback={<div>Chargement des filtres de prix...</div>}>
      <PriceFilter {...props} />
    </Suspense>
  );
}
