// Types correspondant à la structure de l'API PayloadCMS
export type MediaSize = {
  width: number | null;
  height: number | null;
  mimeType: string | null;
  filesize: number | null;
  filename: string | null;
  url: string;
};

export type Media = {
  id?: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  filename?: string;
  mimeType?: string;
  filesize?: number;
  sizes?: {
    thumbnail?: MediaSize;
    card?: MediaSize;
    tablet?: MediaSize;
    desktop?: MediaSize;
  };
  thumbnailURL?: string | null;
};

// Document type pour les PDFs et fichiers non-images
export type Document = {
  id?: string;
  url: string;
  title?: string;
  description?: string;
  filename?: string;
  mimeType?: string;
  filesize?: number;
};

// Cannabinoid result from lab analysis
export type CannabinoidResult = {
  id?: string;
  compound: string;
  value?: number;
  belowLOQ?: boolean;
};

// Certificate avec structure enrichie du backend
export type Certificate = {
  id?: string;
  name: string;
  file?: Document | string;
  rawData?: string;
  labName?: string;
  testDate?: string;
  validatedBy?: string;
  cannabinoidResults?: CannabinoidResult[];
};

// GalleryImage wrapper (structure backend)
export type GalleryImage = {
  id?: string;
  image: Media | string;
};

export type ProductVariation = {
  id: string;
  weight?: number;
  price: number;
  pricePerGram?: number;
  sku?: string;
  stock?: number;
  isActive?: boolean;
};

// FAQ Item for category FAQ sections
export type FAQItem = {
  id?: string;
  question: string;
  answer: RichTextContent;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  description?: RichTextContent | string | null; // Now supports RichText
  image?: Media | string | null;
  createdAt?: string;
  updatedAt?: string;
  // SEO Plugin Fields (@payloadcms/plugin-seo)
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: Media | null;
  } | null;
  // Custom SEO Fields
  seoBottomContent?: RichTextContent | null;
  faq?: FAQItem[] | null;
};

export type ProductDetails = {
  cbdContent?: number;
  thcContent?: number;
  strain?: 'sativa' | 'indica' | 'hybrid' | 'na';
  origin?: string;
  cultivation?: 'indoor' | 'outdoor' | 'greenhouse';
};

export type MetaInfo = {
  legalWarning?: string;
  certificates?: Certificate[];
};

export type ReviewStats = {
  averageRating: number;
  totalReviews: number;
  distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
};

export type RichTextContent = {
  root: {
    children: Array<Record<string, unknown>>;
    direction: string;
    format: string;
    indent: number;
    type: string;
    version: number;
  };
};

export type AvailabilityStatus = 'in_stock' | 'out_of_stock' | 'preorder' | 'discontinued';

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | RichTextContent;
  price?: number;
  stock?: number;
  sku?: string;
  weight?: number; // Poids en grammes pour les produits simples
  pricePerGram?: number; // Prix par gramme pour les produits simples (peut être calculé ou défini directement)
  createdAt?: string;
  updatedAt?: string;
  mainImage?: Media;
  galleryImages?: GalleryImage[];
  category?: Category | string;
  isFeatured?: boolean;
  // SEO-safe availability fields
  availabilityStatus?: AvailabilityStatus;
  isSellable?: boolean;
  redirectTo?: Product | string; // Product to redirect to if discontinued
  // Legacy field - deprecated, use availabilityStatus instead
  isActive?: boolean;
  productType?: 'simple' | 'variable';
  variants?: ProductVariation[];
  productDetails?: ProductDetails;
  tags?: string[];
  metaInfo?: MetaInfo;
  reviewStats?: ReviewStats;
  // Silo Hybride: Internal linking
  relatedProducts?: Product[] | string[];
  relatedUseCases?: UseCaseRef[] | string[]; // Bridge Linking: Product → Solutions pSEO
};

/**
 * Type léger pour référencer un UseCase (Solution pSEO) - Silo Hybride
 */
export type UseCaseRef = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
};

