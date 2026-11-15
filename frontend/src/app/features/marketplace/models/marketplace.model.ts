export interface Note {
  id: string;
  title: string;
  course: string;
  semester: string;
  university: string;
  seller: string;
  category: string;
  pages: number;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  downloads: number;
  color: string;
  badge?: string;
  summary: string;
}

export interface MarketplaceCategory {
  id: string;
  label: string;
  count: string;
}
