import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ContactsService } from '../../core/services/contacts.service';

@Component({ selector:'app-catalog', standalone:true, imports:[ProductCardComponent], templateUrl:'./catalog.component.html', styleUrl:'./catalog.component.scss' })
export class CatalogComponent implements OnInit {
  readonly productService = inject(ProductService);
  readonly categories = inject(CategoryService);
  readonly contacts = inject(ContactsService);
  readonly selectedCategory = signal('all');
  readonly visibleProducts = computed(() => this.productService.products().filter(p => p.isAvailable && (this.selectedCategory() === 'all' || p.categorySlug === this.selectedCategory())));
  private readonly route = inject(ActivatedRoute);
  ngOnInit(): void {
    void this.productService.load(); void this.categories.load(); void this.contacts.load();
    this.route.queryParamMap.subscribe(params => this.selectedCategory.set(params.get('category') ?? 'all'));
  }
  selectCategory(slug: string): void { this.selectedCategory.set(slug); }
}
