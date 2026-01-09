import { Metadata } from 'next';

const SITE_NAME = 'Chanvre Vert';
// Use environment variable with fallback for production
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chanvre-vert.fr';
const DEFAULT_DESCRIPTION = 'Découvrez notre sélection de produits CBD de haute qualité : fleurs, huiles, infusions et résines. Livraison rapide en France.';

interface PageMetadataOptions {
  /** Page title (without site name suffix) */
  title: string;
  /** Meta description */
  description?: string;
  /** Path for canonical URL (e.g., '/produits' or '/produits/fleur-cbd') */
  path: string;
  /** Set to true to add noindex (for paginated pages, filters, etc.) */
  noIndex?: boolean;
  /** OpenGraph image URL */
  ogImage?: string;
  /** OpenGraph type (default: 'website') */
  ogType?: 'website' | 'article';
  /** For article type: publish date */
  publishedTime?: string;
  /** For article type: modified date */
  modifiedTime?: string;
}

/**
 * Generate consistent metadata for any page.
 * Use this helper across all pages for SEO consistency.
 * 
 * @example
 * // Static page
 * export const metadata = generatePageMetadata({
 *   title: 'Tous nos produits CBD',
 *   path: '/produits',
 * });
 * 
 * @example
 * // Dynamic page with generateMetadata
 * export async function generateMetadata({ params }): Promise<Metadata> {
 *   const product = await getProduct(params.slug);
 *   return generatePageMetadata({
 *     title: product.name,
 *     description: product.description,
 *     path: `/produits/${product.slug}`,
 *     ogImage: product.image,
 *     ogType: 'product',
 *   });
 * }
 */
export function generatePageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noIndex = false,
  ogImage,
  ogType = 'website',
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${BASE_URL}${path}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'fr_FR',
      type: ogType,
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
      ...(ogType === 'article' && publishedTime && {
        publishedTime,
        modifiedTime,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };

  // Add robots directive for noindex pages
  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }

  return metadata;
}

/**
 * Generate metadata for a paginated page.
 * Automatically handles noindex for page 2+.
 */
export function generatePaginatedMetadata({
  title,
  description,
  path,
  page,
}: {
  title: string;
  description?: string;
  path: string;
  page: number;
}): Metadata {
  const isFirstPage = page === 1;
  const pageTitle = isFirstPage ? title : `${title} - Page ${page}`;
  
  return generatePageMetadata({
    title: pageTitle,
    description,
    path: isFirstPage ? path : `${path}?page=${page}`,
    noIndex: !isFirstPage, // Only index page 1
  });
}

/**
 * Site-wide metadata constants for reuse.
 */
export const siteMetadata = {
  siteName: SITE_NAME,
  baseUrl: BASE_URL,
  defaultDescription: DEFAULT_DESCRIPTION,
  defaultKeywords: ['CBD', 'chanvre', 'bio', 'fleurs CBD', 'huiles CBD', 'bien-être', 'France'],
  social: {
    twitter: '@chanvrevert',
  },
} as const;
