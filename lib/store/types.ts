export type StoreVariant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  material: string;
  price?: number;
  quantity: number;
  reserved: number;
  available: number;
};

export type StoreImage = {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
};

export type StoreReview = {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  customer: string;
  createdAt: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number;
  currency: string;
  description: string;
  shortDescription: string;
  brand: string;
  collection: string;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: StoreImage[];
  primaryImage?: string;
  variants: StoreVariant[];
  available: number;
  averageRating: number;
  reviewCount: number;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
};

export type StoreCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
  productCount: number;
};

export type ProductFilters = {
  search?: string;
  categorySlug?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  inStock?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  sort?: "newest" | "price-asc" | "price-desc" | "name";
  page?: number;
  limit?: number;
};

export type FilterOptions = {
  categories: StoreCategory[];
  collections: string[];
  colors: string[];
  sizes: string[];
  materials: string[];
  priceRange: { min: number; max: number };
};
