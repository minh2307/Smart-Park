import { Product } from '../../retail/types';

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercentage: number; // custom item-level discount
  finalPrice: number;
}

export type POSOrderStatus = 'COMPLETED' | 'HELD' | 'CANCELLED';

export interface POSOrder {
  id: number;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD' | 'QR' | 'SPLIT';
  amountPaid: number;
  changeAmount: number;
  customerName?: string;
  membershipCode?: string;
  couponCode?: string;
  voucherCode?: string;
  status: POSOrderStatus;
  holdReason?: string;
  createdAt: string;
}

export interface Shift {
  id: number;
  operatorName: string;
  startTime: string;
  endTime?: string;
  initialCash: number;
  closedCash?: number;
  status: 'OPEN' | 'CLOSED';
}
