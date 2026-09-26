import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { TelegramService } from '../../core/services/telegram.service';
import { Order } from '../../core/models/order.model';
import { RouterLink } from '@angular/router';

@Component({ selector:'app-cart', standalone:true, imports:[CurrencyPipe,ReactiveFormsModule,RouterLink], templateUrl:'./cart.component.html', styleUrl:'./cart.component.scss' })
export class CartComponent {
  readonly cart=inject(CartService); private readonly fb=inject(FormBuilder); private readonly orders=inject(OrderService); private readonly telegram=inject(TelegramService);
  readonly delivery=signal<'pickup'|'courier'>('courier'); readonly payment=signal<'cash'|'transfer'>('cash'); readonly submitting=signal(false); readonly message=signal('');
  readonly form=this.fb.nonNullable.group({customerName:['',[Validators.required,Validators.minLength(2)]],phone:['',[Validators.required,Validators.minLength(10)]],address:['',[Validators.required,Validators.minLength(8)]]});
  readonly courierFee=computed(()=>this.delivery()==='courier'&&this.cart.total()<1500?99:0);
  readonly grandTotal=computed(()=>this.cart.total()+this.courierFee());
  async submit():Promise<void>{
    this.message.set('');
    if(this.form.invalid||!this.cart.items().length){this.form.markAllAsTouched();return;}
    this.submitting.set(true);
    const value=this.form.getRawValue();
    const order:Order={...value,deliveryType:this.delivery(),paymentMethod:this.payment(),items:this.cart.items().map(item=>({productId:item.productId,productName:item.productName,quantity:item.quantity,price:item.price,selectedWeight:item.selectedWeight})),totalAmount:this.grandTotal(),status:'new',createdAt:new Date()};
    try{const id=await this.orders.create(order);await this.telegram.notifyOrder(order,id);this.cart.clear();this.form.reset();this.message.set(`Siparişiniz alındı! Sipariş numaranız: ${id}`);}
    catch(error){this.message.set(error instanceof Error?error.message:'Sipariş gönderilemedi. Lütfen tekrar deneyin.');}
    finally{this.submitting.set(false);}
  }
}
