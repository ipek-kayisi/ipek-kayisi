export type DeliveryType = 'pickup' | 'courier';
export type PaymentMethod = 'cash' | 'transfer';
export type OrderStatus = 'new' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  selectedWeight: string;
}

export interface Order {
  id?: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date | string;
}
