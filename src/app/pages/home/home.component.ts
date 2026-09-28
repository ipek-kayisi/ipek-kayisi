import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ContactsService } from '../../core/services/contacts.service';

@Component({
  selector: 'app-home', standalone: true, imports: [RouterLink, ProductCardComponent],
  templateUrl: './home.component.html', styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  readonly products = inject(ProductService);
  readonly categories = inject(CategoryService);
  readonly contacts = inject(ContactsService);
  ngOnInit(): void { void this.products.load(); void this.categories.load(); void this.contacts.load(); }
}
