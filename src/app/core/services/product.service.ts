import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { Storage, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';
import { db, firebaseConfigured } from '../firebase';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly storage = inject(Storage);
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
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const imageRef = ref(this.storage, `products/${crypto.randomUUID()}.${extension}`);
    await uploadBytes(imageRef, file, { contentType: file.type });
    return getDownloadURL(imageRef);
  }
}
