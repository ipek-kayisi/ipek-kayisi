import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

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
  readonly weight = signal('1kg');
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
  ngOnInit(): void {
    void this.service.load();
  }
}
