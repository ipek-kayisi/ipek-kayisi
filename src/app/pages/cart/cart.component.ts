import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ContactsService } from '../../core/services/contacts.service';
import { Order, PaymentMethod } from '../../core/models/order.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  readonly cart = inject(CartService);
  private readonly fb = inject(FormBuilder);
  private readonly orders = inject(OrderService);
  readonly contacts = inject(ContactsService);
  readonly delivery = signal<'pickup' | 'courier'>('courier');
  readonly selectedPaymentMethod = signal<PaymentMethod>('cash');
  readonly submitting = signal(false);
  readonly message = signal('');
  readonly whatsappFallbackUrl = signal('');
  readonly ibanCopied = signal(false);
  private readonly contactsLoaded: Promise<boolean>;
  readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    address: ['', [Validators.minLength(8)]],
  });
  readonly courierFee = computed(() =>
    this.delivery() === 'courier' && this.cart.total() < 1500 ? 99 : 0,
  );
  readonly grandTotal = computed(() => this.cart.total() + this.courierFee());

  constructor() {
    this.contactsLoaded = this.contacts.load();
    this.updateAddressValidators();
  }

  setDelivery(delivery: 'pickup' | 'courier'): void {
    this.delivery.set(delivery);
    this.updateAddressValidators();
  }

  async copyIban(iban: string): Promise<void> {
    const value = iban.trim();
    if (!value) return;

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else if (!this.copyTextFallback(value)) {
        throw new Error('Clipboard is unavailable');
      }
      this.ibanCopied.set(true);
      this.message.set('IBAN kopyalandı!');
      window.setTimeout(() => this.ibanCopied.set(false), 2000);
    } catch {
      if (this.copyTextFallback(value)) {
        this.ibanCopied.set(true);
        this.message.set('IBAN kopyalandı!');
        window.setTimeout(() => this.ibanCopied.set(false), 2000);
      } else {
        this.ibanCopied.set(false);
        this.message.set('IBAN kopyalanamadı. IBAN satırına basılı tutup kopyalayın.');
      }
    }
  }

  private copyTextFallback(value: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.contentEditable = 'true';
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    textarea.style.fontSize = '16px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, value.length);

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    } finally {
      textarea.remove();
    }
    return copied;
  }

  private updateAddressValidators(): void {
    const address = this.form.controls.address;
    address.setValidators(
      this.delivery() === 'courier'
        ? [Validators.required, Validators.minLength(8)]
        : [],
    );
    address.updateValueAndValidity();
  }

  async submit(): Promise<void> {
    this.message.set('');
    this.whatsappFallbackUrl.set('');
    if (this.form.invalid || !this.cart.items().length) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const value = this.form.getRawValue();
    const order: Order = {
      ...value,
      address:
        this.delivery() === 'pickup' && !value.address.trim()
          ? 'Mağazadan Teslim Alma'
          : value.address.trim(),
      deliveryType: this.delivery(),
      paymentMethod: this.selectedPaymentMethod(),
      items: this.cart
        .items()
        .map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          selectedWeight: item.selectedWeight,
        })),
      totalAmount: this.grandTotal(),
      status: 'new',
      createdAt: new Date(),
    };
    // Open synchronously from the click handler to avoid browser popup blocking;
    // navigate this tab only after the Firestore write succeeds.
    const whatsappWindow = window.open('about:blank', '_blank');
    try {
      await this.contactsLoaded;
      const whatsappPhone = (this.contacts.contacts().phoneWp || '').replace(/\D/g, '');
      if (!whatsappPhone) {
        whatsappWindow?.close();
        this.message.set('Mağazanın WhatsApp numarası ayarlanmamış. Lütfen bizimle telefonla iletişime geçin.');
        return;
      }

      const id = await this.orders.create(order);
      const orderLines = order.items
        .map(
          (item) =>
            `• ${item.productName} (${item.selectedWeight}) x ${item.quantity} — ${this.formatPrice(item.price * item.quantity)}`,
        )
        .join('\n');
      const address =
        this.delivery() === 'pickup' && !value.address.trim()
          ? 'Mağazadan Teslim Alma'
          : value.address.trim();
      const messageText = [
        ` *YENİ SİPARİŞ (#${id.slice(-6).toUpperCase()})*`,
        '--------------------------------',
        ` *Müşteri:* ${value.customerName.trim()}`,
        ` *Telefon:* ${value.phone.trim()}`,
        ` *Adres:* ${address}`,
        ` *Teslimat:* ${this.delivery() === 'pickup' ? 'Mağazadan Teslim Alma' : 'Ücretli Kurye'}`,
        this.selectedPaymentMethod() === 'cash'
          ? ' *Ödeme:* Kapıda Nakit'
          : ' *Ödeme:* Havale / EFT (Banka Transferi)',
        '',
        ' *Sipariş Detayı:*',
        orderLines,
        '',
        ` *Toplam Tutar:* ${this.formatPrice(order.totalAmount)}`,
        '--------------------------------',
        'Siparişimi onaylamak istiyorum.',
      ].join('\n');
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(messageText)}`;

      if (whatsappWindow) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        this.whatsappFallbackUrl.set(whatsappUrl);
      }
      this.cart.clear();
      this.form.reset();
      this.message.set(
        whatsappWindow
          ? `Siparişiniz kaydedildi (#${id.slice(-6).toUpperCase()}). WhatsApp'ta mesajı göndererek siparişi onaylayın.`
          : `Siparişiniz kaydedildi (#${id.slice(-6).toUpperCase()}), ancak yeni pencere açılamadı. Aşağıdaki bağlantıyı kullanın.`,
      );
    } catch (error) {
      whatsappWindow?.close();
      this.message.set(
        error instanceof Error
          ? error.message
          : 'Sipariş kaydedilemedi. Lütfen tekrar deneyin.',
      );
    } finally {
      this.submitting.set(false);
    }
  }

  private formatPrice(amount: number): string {
    return `₺${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
  }
}
