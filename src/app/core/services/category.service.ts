import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { collection, getDocs } from 'firebase/firestore';
import { db, firebaseConfigured } from '../firebase';
import { Category } from '../models/category.model';

const seed: Category[] = [
  { id: 'kuruyemis', name: 'Kuruyemiş', slug: 'kuruyemis', iconUrl: 'nut' },
  { id: 'kuru-meyve', name: 'Kuru Meyve', slug: 'kuru-meyve', iconUrl: 'apple' },
  { id: 'baharat', name: 'Baharat & Bakliyat', slug: 'baharat', iconUrl: 'sprout' },
  { id: 'lokum', name: 'Lokum & Atıştırmalık', slug: 'lokum', iconUrl: 'candy' },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly categories = signal<Category[]>(seed);

  async load(): Promise<void> {
    if (!this.browser || !firebaseConfigured) return;
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      if (!snapshot.empty) this.categories.set(snapshot.docs.map(doc => {
        const category = { id: doc.id, ...doc.data() } as Category;
        return { ...category, iconUrl: this.iconName(category.iconUrl, category.slug) };
      }));
    } catch (error) { console.error('Kategoriler yüklenemedi', error); }
  }

  iconName(value: string, slug = ''): string {
    const legacyIcons: Record<string, string> = { '🥜': 'nut', '🍑': 'apple', '🌿': 'sprout', '🍬': 'candy' };
    if (legacyIcons[value]) return legacyIcons[value];
    const icon = value.replace(/\.svg$/i, '');
    const availableIcons = new Set(['apple', 'arrow-left', 'arrow-right', 'arrow-up-right', 'banknote', 'candy', 'circle-check', 'circle-dot', 'circle-x', 'clipboard-list', 'clock-3', 'landmark', 'layout-dashboard', 'leaf', 'lock-keyhole', 'log-out', 'mail', 'map-pinned', 'minus', 'nut', 'package-check', 'package', 'phone', 'plus', 'refresh-cw', 'shopping-basket', 'sparkles', 'sprout', 'star', 'store', 'tags', 'trash', 'truck', 'users-round']);
    if (availableIcons.has(icon)) return icon;
    const slugIcons: Record<string, string> = { kuruyemis: 'nut', 'kuru-meyve': 'apple', baharat: 'sprout', lokum: 'candy' };
    return slugIcons[slug] ?? 'sparkles';
  }
}
