import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Order, OrderStatus } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  template: `<h1>Siparişler</h1>
    <button class="btn-refresh" (click)="load()">Yenile</button>
    <p class="error">{{ error() }}</p>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Sipariş</th>
            <th>Müşteri</th>
            <th>Tutar</th>
            <th>Ödeme</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          @for (order of orders(); track order.id) {
            <tr>
              <td>
                #{{ order.id?.slice(-6)?.toUpperCase()
                }}<small>{{
                  order.createdAt | date: 'dd.MM.yyyy HH:mm'
                }}</small>
              </td>
              <td>
                {{ order.customerName }}<small>{{ order.phone }}</small>
              </td>
              <td>
                {{
                  order.totalAmount | currency: 'TRY' : '₺' : '1.0-0' : 'tr-TR'
                }}
              </td>
              <td>
                {{
                  order.paymentMethod === 'cash'
                    ? 'Kapıda nakit'
                    : 'Havale / EFT'
                }}
              </td>
              <td>
                <select [value]="order.status" (change)="update(order, $event)">
                  <option value="new">Yeni</option>
                  <option value="processing">Hazırlanıyor</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal</option>
                </select>
              </td>
            </tr>
          }
        </tbody>
      </table>
      <div class="order-cards">
        @for (order of orders(); track order.id) {
          <article class="order-card">
            <div class="card-heading">
              <div>
                <strong>#{{ order.id?.slice(-6)?.toUpperCase() }}</strong>
                <small>{{ order.createdAt | date: 'dd.MM.yyyy HH:mm' }}</small>
              </div>
              <strong class="card-total">
                {{ order.totalAmount | currency: 'TRY' : '₺' : '1.0-0' : 'tr-TR' }}
              </strong>
            </div>
            <div class="card-details">
              <div><span>Müşteri</span><strong>{{ order.customerName }}</strong><small>{{ order.phone }}</small></div>
              <div><span>Ödeme</span><strong>{{ order.paymentMethod === 'cash' ? 'Kapıda nakit' : 'Havale / EFT' }}</strong></div>
            </div>
            <label class="card-status">
              <span>Durum</span>
              <select [value]="order.status" (change)="update(order, $event)">
                <option value="new">Yeni</option>
                <option value="processing">Hazırlanıyor</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal</option>
              </select>
            </label>
          </article>
        }
      </div>
      @if (!orders().length) {
        <p>Henüz sipariş bulunmuyor.</p>
      }
    </div>`,
  styles: [
    `
    .btn-refresh {
      margin-bottom: 12px;
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: #fff;
      cursor: pointer;
    }
    .btn-refresh:hover {
      background: #f5f4ed;
    }
      .table-wrap {
        background: #fff;
        padding: 18px;
        overflow: auto;
      }
      .order-cards {
        display: none;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      th,
      td {
        padding: 12px;
        border-bottom: 1px solid #eee;
        font-size: 12px;
      }
      th {
        color: #718176;
        font-size: 10px;
        text-transform: uppercase;
      }
      small {
        display: block;
        color: #899188;
        font-size: 10px;
        margin-top: 4px;
      }
      select {
        padding: 7px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .error {
        color: #b44;
      }
      @media (max-width: 620px) {
        .table-wrap {
          padding: 12px;
          overflow: visible;
          background: transparent;
        }
        table {
          display: none;
        }
        .order-cards {
          display: grid;
          gap: 12px;
        }
        .order-card {
          min-width: 0;
          padding: 16px;
          background: #fff;
          border: 1px solid #e9ece5;
          border-radius: 8px;
        }
        .card-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eee;
        }
        .card-heading > div,
        .card-details > div {
          min-width: 0;
        }
        .card-heading > div > strong {
          color: #294c3e;
          font-size: 15px;
        }
        .card-heading small,
        .card-details small {
          overflow-wrap: anywhere;
        }
        .card-total {
          flex: 0 0 auto;
          color: #294c3e;
          font-size: 15px;
        }
        .card-details {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12px;
          padding: 13px 0;
        }
        .card-details span,
        .card-status > span {
          display: block;
          margin-bottom: 5px;
          color: #718176;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .card-details strong {
          display: block;
          color: #354c40;
          font-size: 13px;
          font-weight: 600;
        }
        .card-status {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }
        .card-status > span {
          margin: 0;
        }
        .card-status select {
          max-width: 65%;
        }
      }
    `,
  ],
})
export class AdminOrdersComponent implements OnInit {
  private readonly service = inject(OrderService);
  readonly orders = signal<Order[]>([]);
  readonly error = signal('');
  ngOnInit(): void {
    void this.load();
  }
  async load(): Promise<void> {
    try {
      this.orders.set(await this.service.list());
      this.error.set('');
    } catch {
      this.error.set(
        'Siparişler yüklenemedi. Firestore ayarlarını kontrol edin.',
      );
    }
  }
  async update(order: Order, event: Event): Promise<void> {
    if (!order.id) return;
    const status = (event.target as HTMLSelectElement).value as OrderStatus;
    try {
      await this.service.setStatus(order.id, status);
      this.orders.update((items) =>
        items.map((item) =>
          item.id === order.id ? { ...item, status } : item,
        ),
      );
    } catch {
      this.error.set('Sipariş durumu güncellenemedi.');
    }
  }
}
