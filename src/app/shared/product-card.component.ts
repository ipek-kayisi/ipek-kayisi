import { Component, Input, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../core/services/cart.service';
import { Product } from '../core/models/product.model';

@Component({
  selector: 'app-product-card', standalone: true, imports: [RouterLink, CurrencyPipe],
  template: `<article class="product-card"><a class="photo" [routerLink]="['/product', product.id]"><img [src]="product.imageUrl" [alt]="product.name" loading="lazy"><span class="stock"><img src="/circle-check.svg" alt=""> Stokta</span></a><div class="details"><a class="name" [routerLink]="['/product', product.id]">{{ product.name }}</a><p class="description">{{ product.description }}</p><div class="purchase"><label class="weight"><span class="sr-only">Paket ağırlığı</span><select [value]="selectedWeight || product.weightOptions[0]" (change)="selectWeight($event)">@for(weight of product.weightOptions; track weight){<option [value]="weight">{{ weight }}</option>}</select></label><strong>{{ product.price | currency:'TRY':'₺':'1.0-0':'tr-TR' }}</strong></div><button type="button" (click)="addToCart()"><img src="/plus.svg" alt=""> Sepete Ekle</button></div></article>`,
  styles: [`.product-card{background:#fff;border-radius:14px;overflow:hidden;border:1px solid #ece9e1;transition:transform .25s,box-shadow .25s}.product-card:hover{transform:translateY(-4px);box-shadow:0 16px 38px #183a2a14}.photo{display:block;position:relative;height:220px;background:#f8f4ec;overflow:hidden}.photo img{width:100%;height:100%;object-fit:cover;transition:transform .45s}.product-card:hover .photo img{transform:scale(1.04)}.stock{position:absolute;top:14px;left:14px;background:#edf5e3;color:#487526;border-radius:20px;padding:6px 10px;font-size:10px;font-weight:700}.stock img{width:12px;height:12px;vertical-align:middle}.details{padding:17px}.name{font-size:16px;font-weight:700;color:#173f35;text-decoration:none}.description{min-height:38px;font-size:12px;line-height:1.55;color:#818781;margin:8px 0 16px}.purchase{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.purchase strong{font-size:19px;color:#cf7610}.weight select{border:1px solid #e8e8e3;background:#fff;border-radius:6px;padding:7px 25px 7px 9px;color:#535c55}.details button{width:100%;border:0;border-radius:7px;padding:12px;background:#ff9e16;color:#2a2318;font-weight:700;cursor:pointer}.details button:hover{background:#f28d00}.details button span{margin-left:8px}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.details button img{width:14px;height:14px;vertical-align:middle;margin-left:7px}`],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  selectedWeight = '';
  private readonly cart = inject(CartService);
  selectWeight(event: Event): void { this.selectedWeight = (event.target as HTMLSelectElement).value; }
  addToCart(): void { this.cart.add(this.product, this.selectedWeight || this.product.weightOptions[0]); }
}
