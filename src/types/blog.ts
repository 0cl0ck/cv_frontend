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
  author: string;
  relatedCategories?: Category[] | string[];
  relatedProducts?: Product[] | string[];
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






