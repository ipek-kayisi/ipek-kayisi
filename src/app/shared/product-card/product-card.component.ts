import { Component, Input, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  
  @Input({ required: true }) product!: Product;
  
  selectedWeight = '';
  
  private readonly snackBar = inject(MatSnackBar);
  private readonly cart = inject(CartService);

  selectWeight(event: Event): void {
    this.selectedWeight = (event.target as HTMLSelectElement).value;
  }

  addToCart(): void {
    this.cart.add(
      this.product,
      this.selectedWeight || this.product.weightOptions[0],
    );
    this.snackBar.open('Ürün sepete eklendi', 'Kapat', {
      duration: 3000,
    });
  }
}
