import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Order, OrderStatus } from '../../core/models/order.model';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `<div class="page-head">
      <div>
        <span>MAĞAZA ÖZETİ</span>
        <h1>Genel Bakış</h1>
        <p>Mağazanızdaki güncel durum.</p>
      </div>
      <button (click)="refresh()">
        <img src="/refresh-cw.svg" alt="" /> Yenile
      </button>
    </div>
    <div class="metrics">
      <article>
        <span>Toplam satış</span
        ><b>{{ sales() | currency: 'TRY' : '₺' : '1.0-0' : 'tr-TR' }}</b
        ><small>Gelen siparişlerden</small>
      </article>
      <article>
        <span>Aktif ürünler</span><b>{{ products.products().length }}</b
        ><small>Mağazada listeleniyor</small>
      </article>
      <article>
        <span>Yeni siparişler</span><b>{{ newOrders() }}</b
        ><small>İşlem bekliyor</small>
      </article>
    </div>
    <section class="orders">
      <h2>Son siparişler</h2>
      @if (orders().length) {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SİPARİŞ</th>
                <th>MÜŞTERİ</th>
                <th>TARİH</th>
                <th>TUTAR</th>
                <th>DURUM</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders().slice(0, 8); track order.id) {
                <tr>
                  <td>#{{ order.id?.slice(-6)?.toUpperCase() }}</td>
                  <td>{{ order.customerName }}</td>
                  <td>{{ order.createdAt | date: 'dd.MM.yyyy HH:mm' }}</td>
                  <td>
                    {{
                      order.totalAmount
                        | currency: 'TRY' : '₺' : '1.0-0' : 'tr-TR'
                    }}
                  </td>
                  <td>
                    <span class="status">{{ label(order.status) }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <p class="empty">
          Henüz sipariş bulunmuyor. Firebase ayarlarınızı tamamlayın veya mağaza
          siparişlerini bekleyin.
        </p>
      }
    </section>`,
  styles: [
    `
      .page-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 22px;
      }
      .page-head span {
        font-size: 9px;
        color: #87947f;
        letter-spacing: 0.15em;
        font-weight: 800;
      }
      .page-head h1 {
        font: 30px Georgia;
        color: #204d40;
        margin: 7px 0;
      }
      .page-head p {
        font-size: 11px;
        color: #879087;
        margin: 0;
      }
      .page-head button {
        border: 1px solid #e1e6de;
        background: white;
        color: #426957;
        padding: 9px 12px;
        border-radius: 5px;
        cursor: pointer;
      }
      .page-head button img {
        width: 14px;
        height: 14px;
        vertical-align: middle;
        margin-right: 5px;
      }
      .metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
      }
      .metrics article,
      .orders {
        background: white;
        border: 1px solid #e9ece5;
        border-radius: 7px;
        padding: 19px;
      }
      .metrics article span,
      .metrics article small {
        display: block;
        color: #7f8980;
        font-size: 11px;
      }
      .metrics article b {
        display: block;
        color: #225342;
        font-size: 26px;
        margin: 12px 0 6px;
      }
      .metrics article small {
        font-size: 10px;
        color: #a0a69d;
      }
      .orders {
        margin-top: 20px;
      }
      .orders h2 {
        font: 20px Georgia;
        color: #225342;
        margin: 0 0 16px;
      }
      .table-wrap {
        overflow: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        white-space: nowrap;
      }
      th {
        font-size: 9px;
        letter-spacing: 0.08em;
        color: #919990;
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      td {
        font-size: 11px;
        color: #4a5b50;
        padding: 13px 10px;
        border-bottom: 1px solid #f1f2ee;
      }
      .status {
        background: #f3eedf;
        color: #9c7329;
        padding: 5px 8px;
        border-radius: 20px;
        font-size: 9px;
      }
      .empty {
        font-size: 12px;
        color: #858e83;
        padding: 18px 0;
      }
      .orders {
        min-height: 150px;
      }
      @media (max-width: 620px) {
        .metrics {
          grid-template-columns: 1fr;
        }
        .metrics article {
          padding: 13px;
        }
        .metrics article b {
          margin: 5px 0;
        }
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  readonly products = inject(ProductService);
  private readonly service = inject(OrderService);
  readonly orders = signal<Order[]>([]);
  readonly sales = signal(0);
  readonly newOrders = signal(0);
  ngOnInit(): void {
    void this.refresh();
    void this.products.load();
  }
  async refresh(): Promise<void> {
    const data = await this.service.list();
    this.orders.set(data);
    this.sales.set(
      data
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0),
    );
    this.newOrders.set(data.filter((o) => o.status === 'new').length);
  }
  label(status: OrderStatus): string {
    return {
      new: 'Yeni',
      processing: 'Hazırlanıyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal',
    }[status];
  }
}
