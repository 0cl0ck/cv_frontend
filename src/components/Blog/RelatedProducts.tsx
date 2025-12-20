import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';
import { formatPrice } from '@/utils/formatPrice';

type RelatedProductsProps = {
  products: Product[];
  title?: string;
};

/**
 * Récupère l'URL de l'image principale du produit
 */
function getProductImageUrl(product: Product): string {
  const image = product.mainImage;
  if (!image) return '/images/placeholder-product.webp';
  
  if (image.sizes?.card?.url) return image.sizes.card.url;
  if (image.sizes?.thumbnail?.url) return image.sizes.thumbnail.url;
  if (image.url) return image.url;
  
  return '/images/placeholder-product.webp';
}

/**
 * Récupère le prix minimum du produit (pour les produits variables)
 */
function getMinPrice(product: Product): number {
  if (product.productType === 'variable' && product.variants && product.variants.length > 0) {
    const prices = product.variants
      .filter(v => v.isActive !== false)
      .map(v => v.price);
    return Math.min(...prices);
  }
  return product.price ?? 0;
}

/**
 * Composant pour afficher les produits liés à un article de blog
 */
export default function RelatedProducts({ products, title = 'Produits recommandés' }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Filtrer les produits qui ne sont que des strings (IDs non résolus)
  const resolvedProducts = products.filter(
    (p): p is Product => typeof p === 'object' && p !== null && 'name' in p
  );

  if (resolvedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 rounded-lg border border-white/10 bg-[#003830] p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        {title}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resolvedProducts.slice(0, 6).map((product) => (
          <Link
            key={product.id}
            href={`/produits/${product.slug}`}
            className="group flex items-center gap-4 rounded-lg bg-[#004942] p-4 transition-all hover:bg-[#005a57]"
          >
            {/* Image */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={getProductImageUrl(product)}
                alt={product.name}
                fill
                sizes="64px"
                className="object-cover transition-transform group-hover:scale-110"
              />
            </div>

            {/* Infos */}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium text-white transition-colors group-hover:text-emerald-400">
                {product.name}
              </h3>
              <div className="mt-1 text-sm" style={{ color: '#EFC368' }}>
                {product.productType === 'variable' ? (
                  <span>À partir de {formatPrice(getMinPrice(product))}</span>
                ) : (
                  <span>{formatPrice(getMinPrice(product))}</span>
                )}
              </div>
            </div>

            {/* Flèche */}
            <svg
              className="h-5 w-5 flex-shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-[#EFC368]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Lien vers tous les produits si plus de 6 */}
      {resolvedProducts.length > 6 && (
        <div className="mt-4 text-center">
          <Link
            href="/produits"
            className="inline-flex items-center font-medium transition-colors hover:underline"
            style={{ color: '#EFC368' }}
          >
            Voir tous nos produits
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
}

