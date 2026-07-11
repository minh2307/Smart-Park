import type { TicketType, Attraction } from '../../tickets/types/ticket.types';
import type { Booking } from '../../booking/types/booking.types';

export type TicketStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'PAID'
  | 'CHECKED_IN'
  | 'USED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

export interface Ticket {
  id: number;
  orderItemId?: number | null;
  booking?: Booking | null;
  ticketType: TicketType;
  customerId: number;
  ticketCode: string;
  status: TicketStatus;
  validDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface CheckIn {
  id: number;
  ticketId: number;
  checkInTime: string;
}

export interface TicketFilters {
  search: string;
  status: TicketStatus | 'ALL' | 'ACTIVE';
  sortBy: 'date_desc' | 'date_asc' | 'status';
}
