import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, firebaseConfigured, storage } from '../firebase';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly products = signal<Product[]>([]);

  async load(): Promise<void> {
    if (!this.browser || !firebaseConfigured) return;
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      this.products.set(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
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
