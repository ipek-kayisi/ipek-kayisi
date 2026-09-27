import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `<h1>Ürün yönetimi</h1>
    <p>{{ message() }}</p>
    <div class="layout">
      <section>
        @for (product of products.products(); track product.id) {
          <article>
            <img [src]="product.imageUrl" [alt]="product.name" /><b>{{
              product.name
            }}</b
            ><span>₺{{ product.price }} · {{ product.stockCount }} adet</span
            ><button (click)="edit(product)">Düzenle</button
            ><button (click)="remove(product.id)">Sil</button>
          </article>
        }
      </section>
      <form [formGroup]="form" (ngSubmit)="save()">
        <h2>{{ editingId() ? 'Ürünü düzenle' : 'Yeni ürün' }}</h2>
        <label>Ad<input formControlName="name" /></label
        ><label
          >Açıklama<textarea formControlName="description"></textarea></label
        ><label>Fiyat<input type="number" formControlName="price" /></label
        ><label>Stok<input type="number" formControlName="stockCount" /></label
        ><label
          >Kategori<select formControlName="categorySlug">
            @for (category of categories.categories(); track category.id) {
              <option [value]="category.slug">{{ category.name }}</option>
            }
          </select></label
        ><label
          >Paket seçenekleri<input
            formControlName="weightOptions"
            placeholder="250g, 500g, 1kg" /></label
        ><label
          >Fotoğraf<input
            type="file"
            accept="image/*"
            (change)="choose($event)" /></label
        ><button [disabled]="form.invalid || saving()">
          {{ saving() ? 'Kaydediliyor…' : 'Kaydet' }}
        </button>
      </form>
    </div>`,
  styles: [
    `
      .layout {
        display: grid;
        grid-template-columns: 1fr 330px;
        gap: 18px;
      }
      section,
      form {
        background: #fff;
        padding: 18px;
      }
      article {
        display: flex;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid #eee;
        padding: 10px 0;
        font-size: 12px;
      }
      article img {
        width: 44px;
        height: 44px;
        object-fit: cover;
      }
      article b {
        flex: 1;
      }
      article span {
        color: #777;
      }
      label {
        display: block;
        margin: 10px 0;
        font-size: 11px;
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
        padding: 8px;
        border: 1px solid #ddd;
        background: #fff;
        cursor: pointer;
      }
      @media (max-width: 760px) {
        .layout {
          grid-template-columns: 1fr;
        }
        form {
          grid-row: 1;
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
  private image?: File;
  private currentImage = '';
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stockCount: [0, [Validators.required, Validators.min(0)]],
    categorySlug: ['kuruyemis', [Validators.required]],
    weightOptions: ['250g, 500g, 1kg', [Validators.required]],
  });
  constructor() {
    void this.products.load();
    void this.categories.load();
  }
  edit(product: Product): void {
    this.editingId.set(product.id);
    this.currentImage = product.imageUrl;
    this.form.setValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stockCount: product.stockCount,
      categorySlug: product.categorySlug,
      weightOptions: product.weightOptions.join(', '),
    });
  }
  choose(event: Event): void {
    this.image = (event.target as HTMLInputElement).files?.[0];
  }
  async save(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    try {
      const imageUrl = this.image
        ? await this.products.uploadImage(this.image)
        : this.currentImage;
      const value = this.form.getRawValue();
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
        createdAt: new Date(),
      };
      await this.products.save(product);
      this.message.set('Ürün başarıyla kaydedildi.');
      this.currentImage = imageUrl;
    } catch (error) {
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
}
