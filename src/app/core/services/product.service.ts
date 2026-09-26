import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, firebaseConfigured, storage } from '../firebase';
import { Product } from '../models/product.model';

const seed: Product[] = [
  { id: 'kayisi-1', name: 'Malatya Gün Kurusu Kayısı', description: 'Güneşte doğal olarak kurutulmuş, yumuşak dokulu birinci kalite Malatya kayısısı.', price: 289, categorySlug: 'kuru-meyve', imageUrl: 'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=900&q=85', weightOptions: ['250g', '500g', '1kg', '5kg'], stockCount: 48, isAvailable: true, createdAt: new Date() },
  { id: 'antep-fistigi', name: 'Antep Fıstığı', description: 'Özenle seçilmiş iri taneli, taze kavrulmuş Antep fıstığı.', price: 520, categorySlug: 'kuruyemis', imageUrl: 'https://images.unsplash.com/photo-1536591375667-f09b8e1f1f2c?auto=format&fit=crop&w=900&q=85', weightOptions: ['250g', '500g', '1kg', '5kg'], stockCount: 32, isAvailable: true, createdAt: new Date() },
  { id: 'ceviz-ici', name: 'Yerli Ceviz İçi', description: 'Taze hasat, açık renkli ve dolgun yerli ceviz içi.', price: 345, categorySlug: 'kuruyemis', imageUrl: 'https://images.unsplash.com/photo-1563412885-1396d6e9f7b1?auto=format&fit=crop&w=900&q=85', weightOptions: ['250g', '500g', '1kg', '5kg'], stockCount: 26, isAvailable: true, createdAt: new Date() },
  { id: 'incir', name: 'Aydın Kuru İncir', description: 'Ege güneşinde olgunlaşmış, doğal ve yumuşacık kuru incir.', price: 310, categorySlug: 'kuru-meyve', imageUrl: 'https://images.unsplash.com/photo-1604495772376-9657f0035eb5?auto=format&fit=crop&w=900&q=85', weightOptions: ['250g', '500g', '1kg', '5kg'], stockCount: 41, isAvailable: true, createdAt: new Date() },
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly products = signal<Product[]>(seed);

  async load(): Promise<void> {
    if (!this.browser || !firebaseConfigured) return;
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      if (!snapshot.empty) this.products.set(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) { console.error('Ürünler yüklenemedi', error); }
  }

  async save(product: Product): Promise<void> {
    if (!firebaseConfigured) throw new Error('Firebase yapılandırması gerekli.');
    await setDoc(doc(db, 'products', product.id), product);
    this.products.update(items => [...items.filter(item => item.id !== product.id), product]);
  }

  async remove(id: string): Promise<void> {
    if (!firebaseConfigured) throw new Error('Firebase yapılandırması gerekli.');
    await deleteDoc(doc(db, 'products', id));
    this.products.update(items => items.filter(item => item.id !== id));
  }

  async uploadImage(file: File): Promise<string> {
    if (!firebaseConfigured) throw new Error('Firebase yapılandırması gerekli.');
    const imageRef = ref(storage, `products/${Date.now()}-${file.name}`);
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  }
}
