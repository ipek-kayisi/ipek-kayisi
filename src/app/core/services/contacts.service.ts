import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, firebaseConfigured } from '../firebase';
import { Contacts } from '../models/contacts.model';
import { ContactsStateService } from './contacts-state.service';

const contactsDocument = doc(db, 'contacts', 'main');

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly state = inject(ContactsStateService);
  readonly contacts = this.state.contacts;

  async load(): Promise<boolean> {
    if (!this.browser || !firebaseConfigured) return false;
    try {
      const snapshot = await getDoc(contactsDocument);
      this.contacts.set(snapshot.exists() ? { ...this.contacts(), ...snapshot.data() } as Contacts : this.contacts());
      return true;
    } catch (error) { console.error('İletişim bilgileri yüklenemedi', error); }
    return false;
  }

  async save(value: Contacts): Promise<void> {
    if (!firebaseConfigured) throw new Error('Firebase yapılandırması gerekli.');
    await setDoc(contactsDocument, value);
    this.contacts.set(value);
  }
}
