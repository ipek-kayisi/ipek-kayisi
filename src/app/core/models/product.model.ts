export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categorySlug: string;
  imageUrl: string;
  weightOptions: string[];
  stockCount: number;
  isAvailable: boolean;
  createdAt: Date | string;
}
