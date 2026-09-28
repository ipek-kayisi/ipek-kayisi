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

export function priceForWeight(pricePerKg: number, weight: string): number {
  const normalized = weight.trim().toLowerCase().replace(',', '.');
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(kg|кг|g|гр)?$/);
  if (!match) return pricePerKg;

  const amount = Number(match[1]);
  const unit = match[2];
  const weightInKg = unit === 'g' || unit === 'гр' ? amount / 1000 : amount;
  return Math.round(pricePerKg * weightInKg * 100) / 100;
}
