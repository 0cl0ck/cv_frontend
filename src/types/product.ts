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

export type ProductVariation = {
  id: string;
  weight?: number;
  price: number;
  pricePerGram?: number;
  sku?: string;
  stock?: number;
  isActive?: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  description?: string | null;
  image?: Media | string | null;
  meta?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductDetails = Record<string, unknown>;

export type MetaInfo = {
  legalWarning?: string;
  certificates?: string[];
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
  galleryImages?: Media[];
  category?: Category | string;
  isFeatured?: boolean;
  isActive?: boolean;
  productType?: 'simple' | 'variable';
  variants?: ProductVariation[];
  productDetails?: ProductDetails;
  tags?: string[];
  metaInfo?: MetaInfo;
  reviewStats?: ReviewStats;
};
