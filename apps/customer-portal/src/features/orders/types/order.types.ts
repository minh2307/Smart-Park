import type { Booking } from '../../booking/types/booking.types';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export type ItemType = 'TICKET' | 'FOOD' | 'RETAIL' | 'LOCKER';

export interface CustomerInfo {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface OrderItem {
  id: number;
  itemType: ItemType;
  referenceId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  // enriched fields for UI
  name?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  code: string; // VNPAY, MOMO
  provider?: string;
  status: 'ACTIVE' | 'MAINTENANCE';
}

export interface Payment {
  id: number;
  orderId: number;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  amount: number;
  status: PaymentStatus;
  paymentTime?: string;
}

export interface Refund {
  id: number;
  paymentId: number;
  amount: number;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  bookingId?: number;
  customer: CustomerInfo;
  orderCode: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  payments?: Payment[];
  refunds?: Refund[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
