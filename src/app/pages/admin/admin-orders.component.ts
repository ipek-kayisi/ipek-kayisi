import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Order, OrderStatus } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-admin-orders', standalone: true, imports: [CurrencyPipe, DatePipe],
  template: `<h1>Siparişler</h1><button (click)="load()">Yenile</button><p class="error">{{ error() }}</p><div class="table-wrap"><table><thead><tr><th>Sipariş</th><th>Müşteri</th><th>Tutar</th><th>Ödeme</th><th>Durum</th></tr></thead><tbody>@for(order of orders(); track order.id){<tr><td>#{{ order.id?.slice(-6)?.toUpperCase() }}<small>{{ order.createdAt | date:'dd.MM.yyyy HH:mm' }}</small></td><td>{{ order.customerName }}<small>{{ order.phone }}</small></td><td>{{ order.totalAmount | currency:'TRY':'₺':'1.0-0':'tr-TR' }}</td><td>{{ order.paymentMethod==='cash'?'Kapıda nakit':'Havale / EFT' }}</td><td><select [value]="order.status" (change)="update(order,$event)"><option value="new">Yeni</option><option value="processing">Hazırlanıyor</option><option value="completed">Tamamlandı</option><option value="cancelled">İptal</option></select></td></tr>}</tbody></table>@if(!orders().length){<p>Henüz sipariş bulunmuyor.</p>}</div>`,
  styles: [`.table-wrap{background:#fff;padding:18px;overflow:auto}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:12px;border-bottom:1px solid #eee;font-size:12px}th{color:#718176;font-size:10px;text-transform:uppercase}small{display:block;color:#899188;font-size:10px;margin-top:4px}select{padding:7px;border:1px solid #ddd;border-radius:4px}.error{color:#b44}`],
})
export class AdminOrdersComponent implements OnInit {
  private readonly service = inject(OrderService);
  readonly orders = signal<Order[]>([]);
  readonly error = signal('');
  ngOnInit(): void { void this.load(); }
  async load(): Promise<void> {
    try { this.orders.set(await this.service.list()); this.error.set(''); }
    catch { this.error.set('Siparişler yüklenemedi. Firestore ayarlarını kontrol edin.'); }
  }
  async update(order: Order, event: Event): Promise<void> {
    if (!order.id) return;
    const status = (event.target as HTMLSelectElement).value as OrderStatus;
    try {
      await this.service.setStatus(order.id, status);
      this.orders.update(items => items.map(item => item.id === order.id ? { ...item, status } : item));
    } catch { this.error.set('Sipariş durumu güncellenemedi.'); }
  }
}
