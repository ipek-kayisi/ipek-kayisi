import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/product-card.component';

@Component({
  selector: 'app-home', standalone: true, imports: [RouterLink, ProductCardComponent],
  templateUrl: './home.component.html', styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  readonly products = inject(ProductService);
  readonly categories = inject(CategoryService);
  ngOnInit(): void { void this.products.load(); void this.categories.load(); }
}
