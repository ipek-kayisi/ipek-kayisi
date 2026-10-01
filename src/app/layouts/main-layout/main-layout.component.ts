import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ContactsStateService } from '../../core/services/contacts-state.service';
import { AuthService } from '../../core/services/auth.service';
import { ContactsService } from '../../core/services/contacts.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  readonly cart = inject(CartService);
  readonly contacts = inject(ContactsStateService);
  private readonly auth = inject(AuthService);
  private readonly contactsService = inject(ContactsService);
  readonly isAdmin = signal(false);

  ngOnInit(): void {
    void this.auth.currentUser().then((user) => this.isAdmin.set(!!user));
    void this.contactsService.load();
  }

  whatsappUrl(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  }

  instagramUrl(value: string): string {
    const handle = value.trim();
    if (!handle) return '';
    return /^https?:\/\//i.test(handle)
      ? handle
      : `https://www.instagram.com/${handle.replace(/^@/, '')}/`;
  }
}
