import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';

// Configure a secure server-side webhook endpoint; never put a bot token in browser code.
const TELEGRAM_ORDER_WEBHOOK = '';

@Injectable({ providedIn: 'root' })
export class TelegramService {
  async notifyOrder(order: Order, orderId: string): Promise<void> {
    if (!TELEGRAM_ORDER_WEBHOOK) return;
    const response = await fetch(TELEGRAM_ORDER_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order, orderId }),
    });
    if (!response.ok) throw new Error('Telegram bildirimi gönderilemedi.');
  }
}
