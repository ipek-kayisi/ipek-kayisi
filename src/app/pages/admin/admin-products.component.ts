import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `<div class="page-heading">
      <div>
        <h1>Ürün yönetimi</h1>
        <p>{{ message() }}</p>
      </div>
      <button class="primary" type="button" (click)="openNew()">
        + Yeni ürün ekle
      </button>
    </div>
    <section class="product-list" aria-label="Ürünler">
      @for (product of products.products(); track product.id) {
        <article class="product-row">
          <div class="product-info">
            <img [src]="product.imageUrl" [alt]="product.name" />
            <b>{{ product.name }}</b>
          </div>
          <div class="product-meta">
            <span>₺{{ product.price }} / kg</span
            ><span>{{ product.stockCount }} adet</span>
          </div>
          <div class="actions">
            <button type="button" (click)="edit(product)">Düzenle</button
            ><button type="button" (click)="remove(product.id)">Sil</button>
          </div>
        </article>
      }
    </section>
    @if (dialogOpen()) {
      <div
        class="backdrop"
        role="presentation"
        (click)="closeDialog()"
        (keydown.escape)="closeDialog()"
      >
        <section
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-dialog-title"
          (click)="$event.stopPropagation()"
        >
          <h2 id="product-dialog-title">
            {{ editingId() ? 'Ürünü düzenle' : 'Yeni ürün ekle' }}
          </h2>
          <form [formGroup]="form" (ngSubmit)="save()">
            <label>Ad<input formControlName="name" /></label>
            <label
              >Açıklama<textarea formControlName="description"></textarea>
            </label>
            <div class="field-row">
              <label
                >Fiyat (1 kg)<input
                  type="number"
                  formControlName="price" /></label
              ><label
                >Stok<input type="number" formControlName="stockCount"
              /></label>
            </div>
            <label
              >Kategori<select formControlName="categorySlug">
                @for (category of categories.categories(); track category.id) {
                  <option [value]="category.slug">{{ category.name }}</option>
                }
              </select></label
            >
            <label
              >Paket seçenekleri<input
                formControlName="weightOptions"
                placeholder="250g, 500g, 1kg"
            /></label>
            <div class="form-group full-width">
              <label class="form-label">Fotoğraf</label>

              <input
                type="file"
                class="file-input"
                #serviceFileInput
                (change)="onFileSelected($event)"
                accept="image/*"
                hidden
              />

              <div
                class="upload-zone"
                (click)="serviceFileInput.click()"
                (keydown.enter)="serviceFileInput.click()"
                (keydown.space)="$event.preventDefault(); serviceFileInput.click()"
                role="button"
                tabindex="0"
                aria-label="Ürün fotoğrafı seç veya değiştir"
                [attr.aria-busy]="isUploading()"
                [class.loading]="isUploading()"
              >
                @if (!form.value.imageUrl) {
                  <span class="icon">
                    <img src="camera.svg" alt="" />
                  </span>
                  <p>{{ isUploading() ? 'Yükleniyor...' : 'Fotoğraf seç' }}</p>
                } @else {
                  <img
                    [src]="form.value.imageUrl"
                    class="preview-img"
                    alt="Ürünü"
                  />
                  <div class="change-overlay">Fotoğrafı değiştir</div>
                }
              </div>
            </div>
            <div class="dialog-actions">
              <button type="button" (click)="closeDialog()" [disabled]="saving()">İptal</button
              ><button class="primary" [disabled]="form.invalid || saving() || isUploading()">
                {{ saving() ? 'Kaydediliyor…' : 'Kaydet' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    }`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .page-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
      }
      h1 {
        margin: 0;
      }
      .page-heading p {
        color: #718078;
        margin: 6px 0 0;
      }
      .product-list {
        background: #fff;
        padding: 18px;
        width: 100%;
        box-sizing: border-box;
      }
      .product-row {
        display: flex;
        align-items: center;
        gap: 18px;
        border-bottom: 1px solid #eee;
        padding: 12px 0;
        font-size: 13px;
      }
      .product-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        min-width: 0;
      }
      .product-info b {
        overflow-wrap: anywhere;
      }
      .product-info img {
        width: 44px;
        height: 44px;
        object-fit: cover;
        flex: none;
      }
      .product-meta {
        display: flex;
        gap: 22px;
        color: #66736c;
        white-space: nowrap;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      label {
        display: block;
        margin: 10px 0;
        font-size: 12px;
      }
      input,
      textarea,
      select {
        box-sizing: border-box;
        display: block;
        width: 100%;
        padding: 8px;
        margin-top: 4px;
        border: 1px solid #ddd;
      }
      button {
        padding: 9px 12px;
        border: 1px solid #ddd;
        background: #fff;
        cursor: pointer;
      }
      button.primary {
        color: white;
        background: #d3832f;
        border-color: #d3832f;
        font-weight: 700;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: grid;
        place-items: center;
        padding: 20px;
        background: rgba(0, 0, 0, 0.52);
        backdrop-filter: blur(3px);
      }
      .dialog {
        width: min(560px, 90vw);
        max-height: 90vh;
        overflow-y: auto;
        box-sizing: border-box;
        padding: 24px;
        background: #fff;
        box-shadow: 0 18px 60px #0003;
      }
      .dialog h2 {
        margin: 0 0 18px;
      }
      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;

        &.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          display: block;
          margin: 0 0 8px;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #39483f;
        }

        textarea {
          resize: vertical;
        }
      }

      .file-input {
        display: none !important;
      }

      .upload-zone {
        position: relative;
        width: 100%;
        box-sizing: border-box;
        border: 2px dashed #cbd8cd;
        padding: 1rem;
        text-align: center;
        border-radius: 12px;
        cursor: pointer;
        color: #52675a;
        background: #f8faf7;
        transition: all 0.2s ease;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 140px;

        &:hover {
          border-color: #d3832f;
          background: #fffaf3;

          .change-overlay {
            opacity: 1;
          }
        }

        &:focus-visible {
          outline: 3px solid #d3832f;
          outline-offset: 2px;
        }

        &.loading {
          cursor: progress;
          opacity: 0.75;
        }

        .icon img {
          width: 28px;
          height: 28px;
        }

        p {
          margin: 0.5rem 0 0;
          font-size: 0.875rem;
          color: #52675a;
        }

        .preview-img {
          width: 100%;
          height: 190px;
          object-fit: contain;
          border-radius: 8px;
          background: #f1f3ee;
        }

        .change-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 500;
          opacity: 0;
          transition: opacity 0.2s ease;
          backdrop-filter: blur(2px);
        }
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
      }
      @media (max-width: 1024px) {
        .product-row {
          gap: 12px;
        }
        .product-meta {
          gap: 12px;
        }
      }
      @media (min-width: 620px) and (max-width: 850px) {
        .product-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
        }
        .product-meta {
          justify-content: flex-end;
          gap: 10px;
        }
        .actions {
          grid-column: 1 / -1;
          justify-content: flex-end;
        }
      }
      @media (max-width: 619px) {
        .page-heading {
          align-items: flex-start;
          flex-direction: column;
        }
        .page-heading .primary {
          width: 100%;
        }
        .product-list {
          padding: 12px;
        }
        .product-row {
          align-items: stretch;
          flex-direction: column;
          gap: 12px;
          padding: 14px 0;
        }
        .product-meta {
          justify-content: space-between;
        }
        .actions {
          width: 100%;
        }
        .actions button {
          flex: 1;
        }
        .dialog {
          width: 95vw;
          max-height: 90vh;
          padding: 18px;
        }
        .field-row {
          grid-template-columns: 1fr;
          gap: 0;
        }
      }
    `,
  ],
})
export class AdminProductsComponent {
  readonly products = inject(ProductService);
  readonly categories = inject(CategoryService);
  private readonly fb = inject(FormBuilder);
  readonly editingId = signal('');
  readonly message = signal('');
  readonly saving = signal(false);
  readonly dialogOpen = signal(false);
  readonly isUploading = signal<boolean>(false);
  private pendingImage?: File;
  private previewObjectUrl = '';
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stockCount: [0, [Validators.required, Validators.min(0)]],
    imageUrl: ['', [Validators.required]],
    categorySlug: ['kuruyemis', [Validators.required]],
    weightOptions: ['250g, 500g, 1kg', [Validators.required]],
  });
  constructor() {
    void this.products.load();
    void this.categories.load();
  }
  edit(product: Product): void {
    this.editingId.set(product.id);
    this.form.setValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stockCount: product.stockCount,
      categorySlug: product.categorySlug,
      imageUrl: product.imageUrl,
      weightOptions: product.weightOptions.join(', '),
    });
    this.dialogOpen.set(true);
  }
  openNew(): void {
    this.resetForm();
    this.dialogOpen.set(true);
  }
  closeDialog(): void {
    if (this.saving()) return;
    this.dialogOpen.set(false);
    this.resetForm();
  }
  private resetForm(): void {
    this.editingId.set('');
    this.pendingImage = undefined;
    this.revokePreviewUrl();
    this.form.reset();
  }
  private revokePreviewUrl(): void {
    if (!this.previewObjectUrl) return;
    URL.revokeObjectURL(this.previewObjectUrl);
    this.previewObjectUrl = '';
  }
  async save(): Promise<void> {
    if (this.form.invalid || this.isUploading()) return;
    this.saving.set(true);
    try {
      const value = this.form.getRawValue();
      let imageUrl = value.imageUrl;
      if (this.pendingImage) {
        this.isUploading.set(true);
        imageUrl = await this.products.uploadImage(this.pendingImage);
        this.isUploading.set(false);
      }
      const existingProduct = this.products
        .products()
        .find((item) => item.id === this.editingId());
      const product: Product = {
        id: this.editingId() || crypto.randomUUID(),
        name: value.name,
        description: value.description,
        price: Number(value.price),
        categorySlug: value.categorySlug,
        imageUrl,
        weightOptions: value.weightOptions
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        stockCount: Number(value.stockCount),
        isAvailable: Number(value.stockCount) > 0,
        createdAt: existingProduct?.createdAt ?? new Date(),
      };
      await this.products.save(product);
      this.message.set('Ürün başarıyla kaydedildi.');
      this.saving.set(false);
      this.closeDialog();
    } catch (error) {
      this.isUploading.set(false);
      this.message.set(
        error instanceof Error ? error.message : 'Ürün kaydedilemedi.',
      );
    } finally {
      this.saving.set(false);
    }
  }
  async remove(id: string): Promise<void> {
    try {
      await this.products.remove(id);
      this.message.set('Ürün silindi.');
    } catch {
      this.message.set('Ürün silinemedi. Firebase ayarlarını kontrol edin.');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.message.set('Lütfen bir görsel dosyası seçin.');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.message.set('Fotoğraf boyutu 5 MB sınırını aşamaz.');
      input.value = '';
      return;
    }

    this.revokePreviewUrl();
    this.pendingImage = file;
    this.previewObjectUrl = URL.createObjectURL(file);
    this.form.patchValue({ imageUrl: this.previewObjectUrl });
    this.message.set('Fotoğraf seçildi. «Kaydet» düğmesine basınca Storage’a yüklenecek.');
    input.value = '';
  }
}
