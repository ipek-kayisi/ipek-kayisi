import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { priceForWeight } from '../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, ProductCardComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly service = inject(ProductService);
  readonly cart = inject(CartService);
  readonly weight = signal('');
  readonly product = computed(() =>
    this.service
      .products()
      .find((p) => p.id === this.route.snapshot.paramMap.get('id')),
  );
  readonly recommendations = computed(() =>
    this.service
      .products()
      .filter((item) => item.id !== this.product()?.id && item.isAvailable)
      .slice(0, 4),
  );
  readonly selectedWeight = computed(() => this.weight() || this.product()?.weightOptions[0] || '1kg');
  readonly selectedPrice = computed(() => {
    const item = this.product();
    return item ? priceForWeight(item.price, this.selectedWeight()) : 0;
  });
  readonly cartItem = computed(() => {
    const item = this.product();
    return item ? this.cart.items().find(cartItem => cartItem.productId === item.id && cartItem.selectedWeight === this.selectedWeight()) : undefined;
  });
  increase(): void { const item = this.product(); if (item) this.cart.add(item, this.selectedWeight()); }
  decrease(): void { const item = this.cartItem(); if (item) this.cart.setQuantity(item.productId, item.selectedWeight, item.quantity - 1); }
  ngOnInit(): void {
    void this.service.load();
  }
}
