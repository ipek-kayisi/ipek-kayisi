import { Injectable, signal } from '@angular/core';
import { Contacts } from '../models/contacts.model';

const emptyContacts: Contacts = {
  phone: '',
  phone2: '',
  phoneWp: '',
  intagram: '',
  facebook: '',
  mapUrl: '',
  mail: '',
  iban: '',
  bankAccountName: '',
};

@Injectable({ providedIn: 'root' })
export class ContactsStateService {
  readonly contacts = signal<Contacts>(emptyContacts);
}
