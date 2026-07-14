import type { TicketType } from '../../tickets/types/ticket.types';

export interface TicketRequest {
  ticketTypeId: number;
  quantity: number;
}

export interface BookingRequest {
  customerId: number;
  tickets: TicketRequest[];
  validDate: string; // YYYY-MM-DD
  couponCode?: string | null;
}

export interface Booking {
  id: number;
  code: string;
  customerId: number;
  customer?: {
    id: number;
    fullName: string;
    email: string;
  };
  validDate: string; // YYYY-MM-DD
  totalAmount: number;
  discountAmount?: number;
  couponCode: string | null;
  status: 'PENDING' | 'PAID' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  tickets?: any[];
}

export interface CartItem {
  ticketType: TicketType;
  quantity: number;
  visitDate: string; // YYYY-MM-DD
}
