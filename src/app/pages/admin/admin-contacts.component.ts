import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsService } from '../../core/services/contacts.service';
import { firebaseConfigured } from '../../core/firebase';

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `<div class="page-heading">
      <div>
        <h1>İletişim bilgileri</h1>
        <p>{{ message() }}</p>
      </div>
    </div>
    <form class="contacts-form" [formGroup]="form" (ngSubmit)="save()">
      <section>
        <h2>Telefon ve e-posta</h2>
        <div class="field-grid">
          <label
            >Telefon<input
              formControlName="phone"
              placeholder="+90 212 345 67 89" /></label
          ><label>İkinci telefon<input formControlName="phone2" /></label
          ><label
            >WhatsApp<input
              formControlName="phoneWp"
              placeholder="+90 555 555 55 55" /></label
          ><label
            >E-posta<input type="email" formControlName="mail" required
          /></label>
        </div>
      </section>
      <section>
        <h2>Sosyal medya</h2>
        <div class="field-grid">
          <label
            >Instagram<input
              formControlName="intagram"
              placeholder="@username" /></label
          ><label
            >Facebook<input
              formControlName="facebook"
              placeholder="https://facebook.com/..."
          /></label>
        </div>
      </section>
      <section>
        <h2>Harita</h2>
        <label
          >Harita bağlantısı<input
            formControlName="mapUrl"
            placeholder="https://www.google.com/maps?q=..."
        /></label>
      </section>
      <section>
        <h2>Havale / EFT bilgileri</h2>
        <div class="field-grid">
          <label
            >Hesap sahibi<input
              formControlName="bankAccountName"
              placeholder="İpek Toptan Kuru Gıda"
          /></label>
          <label
            >IBAN<input
              formControlName="iban"
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              autocomplete="off"
          /></label>
        </div>
      </section>
      <div class="form-actions">
        <button class="primary" [disabled]="form.invalid || saving()">
          {{ saving() ? 'Kaydediliyor...' : 'İletişim bilgilerini kaydet' }}
        </button>
      </div>
    </form>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .page-heading {
        margin-bottom: 20px;
      }
      .page-heading h1 {
        margin: 0;
      }
      .page-heading p {
        color: #718078;
        margin: 6px 0 0;
      }
      .contacts-form {
        display: grid;
        gap: 16px;
        max-width: 900px;
      }
      .contacts-form section {
        background: #fff;
        padding: 22px;
      }
      .contacts-form h2 {
        font: 20px Georgia;
        color: #245447;
        margin: 0 0 18px;
      }
      .field-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0 18px;
      }
      label {
        display: block;
        margin: 0 0 14px;
        font-size: 12px;
        color: #536259;
      }
      input {
        box-sizing: border-box;
        display: block;
        width: 100%;
        padding: 11px;
        margin-top: 6px;
        border: 1px solid #dce2dc;
        font: inherit;
        color: #263d33;
      }
      button {
        padding: 10px 14px;
        border: 1px solid #dce2dc;
        background: #fff;
        cursor: pointer;
      }
      button.primary {
        color: #fff;
        background: #d3832f;
        border-color: #d3832f;
        font-weight: 700;
      }
      button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
      .form-actions {
        display: flex;
        justify-content: flex-end;
      }
      @media (max-width: 619px) {
        .field-grid {
          grid-template-columns: 1fr;
        }
        .contacts-form section {
          padding: 16px;
        }
      }
    `,
  ],
})
export class AdminContactsComponent implements OnInit {
  readonly contacts = inject(ContactsService);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    phone: ['', Validators.required],
    phone2: [''],
    phoneWp: [''],
    intagram: [''],
    facebook: [''],
    mapUrl: ['', Validators.required],
    mail: ['', [Validators.required, Validators.email]],
    iban: [''],
    bankAccountName: [''],
  });

  ngOnInit(): void {
    void this.contacts
      .load()
      .then(() => this.form.patchValue(this.contacts.contacts()));
  }

  async save(): Promise<void> {
    if (!firebaseConfigured) {
      this.message.set(
        'İletişim bilgilerini kaydetmek için Firebase gereklidir.',
      );
      return;
    }
    if (this.form.invalid) return;
    this.saving.set(true);
    this.message.set('');
    try {
      await this.contacts.save(this.form.getRawValue());
      this.message.set('İletişim bilgileri kaydedildi.');
    } catch {
      this.message.set('İletişim bilgileri kaydedilemedi.');
    } finally {
      this.saving.set(false);
    }
  }
}
