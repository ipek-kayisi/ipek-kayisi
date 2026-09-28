import { computed, Injectable, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { priceForWeight, Product } from '../models/product.model';

const STORAGE_KEY = 'ipek-cart-v2';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly browser = isPlatformBrowser(this.platformId);
  readonly items = signal<CartItem[]>(this.readCart());
  readonly total = computed(() => this.items().reduce((sum, item) => sum + item.price * item.quantity, 0));
  readonly count = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));

  add(product: Product, selectedWeight = product.weightOptions[0] ?? '1kg'): void {
    this.items.update(items => {
      const match = items.find(item => item.productId === product.id && item.selectedWeight === selectedWeight);
      return match
        ? items.map(item => item === match ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { productId: product.id, productName: product.name, imageUrl: product.imageUrl, price: priceForWeight(product.price, selectedWeight), quantity: 1, selectedWeight }];
    });
    this.persist();
  }

  setQuantity(productId: string, selectedWeight: string, quantity: number): void {
    this.items.update(items => quantity <= 0
      ? items.filter(item => item.productId !== productId || item.selectedWeight !== selectedWeight)
      : items.map(item => item.productId === productId && item.selectedWeight === selectedWeight ? { ...item, quantity } : item));
    this.persist();
  }

  remove(productId: string, selectedWeight: string): void { this.setQuantity(productId, selectedWeight, 0); }
  clear(): void { this.items.set([]); this.persist(); }

  private readCart(): CartItem[] {
    if (!this.browser) return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as CartItem[]; }
    catch { return []; }
  }

  private persist(): void {
    if (this.browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
  }
}
