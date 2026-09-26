import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { collection, getDocs } from 'firebase/firestore';
import { db, firebaseConfigured } from '../firebase';
import { Category } from '../models/category.model';

const seed: Category[] = [
  { id: 'kuruyemis', name: 'Kuruyemiş', slug: 'kuruyemis', iconUrl: '🥜' },
  { id: 'kuru-meyve', name: 'Kuru Meyve', slug: 'kuru-meyve', iconUrl: '🍑' },
  { id: 'baharat', name: 'Baharat & Bakliyat', slug: 'baharat', iconUrl: '🌿' },
  { id: 'lokum', name: 'Lokum & Atıştırmalık', slug: 'lokum', iconUrl: '🍬' },
];

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly categories = signal<Category[]>(seed);

  async load(): Promise<void> {
    if (!this.browser || !firebaseConfigured) return;
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      if (!snapshot.empty) this.categories.set(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    } catch (error) { console.error('Kategoriler yüklenemedi', error); }
  }
}
