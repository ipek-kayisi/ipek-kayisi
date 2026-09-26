import { Injectable } from '@angular/core';
import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { db, firebaseConfigured } from '../firebase';
import { Order, OrderStatus } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  async create(order: Order): Promise<string> {
    if (!firebaseConfigured) throw new Error('Sipariş vermek için Firebase yapılandırılmalıdır.');
    const result = await addDoc(collection(db, 'orders'), { ...order, createdAt: new Date() });
    return result.id;
  }

  async list(): Promise<Order[]> {
    if (!firebaseConfigured) return [];
    const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(item => ({ id: item.id, ...item.data() } as Order));
  }

  async setStatus(id: string, status: OrderStatus): Promise<void> {
    if (!firebaseConfigured) throw new Error('Firebase yapılandırması gerekli.');
    await updateDoc(doc(db, 'orders', id), { status });
  }
}
