import { Injectable } from '@angular/core';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth, firebaseConfigured } from '../firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  async currentUser(): Promise<User | null> {
    if (!firebaseConfigured) return null;
    return new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(auth, user => { unsubscribe(); resolve(user); }, () => resolve(null));
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    if (!firebaseConfigured) throw new Error('Firebase yapılandırması gerekli.');
    await signInWithEmailAndPassword(auth, email, password);
  }

  async signOut(): Promise<void> { await signOut(auth); }
}
