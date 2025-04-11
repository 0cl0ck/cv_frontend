// Types simplifiés remplaçant ceux de PayloadCMS pour l'usage local
export type Media = {
  id?: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type ProductVariation = {
  id: string;
  name: string;
  price: number;
  stock?: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  stock?: number;
  images?: (Media | string)[];
  category?: (Category | string)[];
  featured?: boolean;
  productType?: 'simple' | 'variable';
  variations?: ProductVariation[];
};
