import type { Media, Category, Product, RichTextContent } from './product';

/**
 * Type pour les métadonnées SEO générées par le plugin @payloadcms/plugin-seo
 */
export type SEOMeta = {
  title?: string | null;
  description?: string | null;
  image?: Media | string | null;
};

/**
 * Type pour un auteur expert (E-E-A-T)
 */
export type ExpertAuthor = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  linkedInUrl?: string | null;
  websiteUrl?: string | null;
  credentials?: Array<{
    title: string;
    year?: number | null;
  }> | null;
  expertise?: Array<'cbd' | 'wellness' | 'nutrition' | 'regulation' | 'quality'> | null;
};

/**
 * Type léger pour référencer un UseCase (Solution pSEO)
 */
export type UseCaseRef = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
};

/**
 * Type léger pour référencer un Post (pour relatedPosts)
 */
export type PostRef = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: Media;
};

/**
 * Type pour un article de blog
 */
export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: RichTextContent;
  featuredImage: Media;
  status: 'draft' | 'published';
  publishedAt?: string | null;
  isPillar: boolean;
  expert?: ExpertAuthor | string | null; // E-E-A-T: Expert author (preferred)
  author?: string; // Fallback: simple author name
  relatedCategories?: Category[] | string[];
  relatedProducts?: Product[] | string[];
  relatedPosts?: PostRef[] | string[]; // Cluster SEO: Blog → Blog
  relatedUseCases?: UseCaseRef[] | string[]; // Bridge Linking: Blog → Solutions
  meta?: SEOMeta;
  createdAt: string;
  updatedAt: string;
};

/**
 * Réponse paginée de l'API pour les posts
 */
export type PostsResponse = {
  docs: Post[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};

/**
 * Type pour un heading extrait du contenu Lexical
 */
export type Heading = {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
};

/**
 * Type pour le nœud racine Lexical
 */
export type LexicalRoot = {
  root: {
    children: LexicalNode[];
    direction: string | null;
    format: string;
    indent: number;
    type: string;
    version: number;
  };
};

/**
 * Type générique pour un nœud Lexical
 */
export type LexicalNode = {
  type: string;
  tag?: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  [key: string]: unknown;
};







