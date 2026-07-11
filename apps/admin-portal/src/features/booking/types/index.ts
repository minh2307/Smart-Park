import { Ticket } from '../../ticket/types';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAID'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'COMPLETED';

export interface BookingItem {
  ticketTypeId: number;
  quantity: number;
  ticketType?: {
    id: number;
    name: string;
    price: number;
  };
}

export interface Booking {
  id: number;
  customerId: number;
  venueId: number;
  totalAmount: number;
  paymentMethod: 'CHUYEN_KHOAN_QR' | 'TIEN_MAT' | string;
  status: number | BookingStatus; // 0: Pending, 1: Paid, 2: Cancelled (supports both backend enum and string)
  createdAt: string;
  visitDate?: string;
  customer?: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
  };
  venue?: {
    id: number;
    name: string;
  };
  items?: BookingItem[];
  tickets?: Ticket[];
  visitors?: Array<{
    id: number;
    fullName: string;
    phone?: string;
    idCard?: string;
  }>;
  promotions?: {
    code: string;
    discountAmount: number;
    description?: string;
  };
  membershipDiscount?: number;
  timeline?: Array<{
    status: string;
    timestamp: string;
    title: string;
    description?: string;
  }>;
}

export type { BookingInput } from '../schemas/bookingSchema';

export interface BookingFilters {
  search?: string;
  customerId?: number | '';
  venueId?: number | '';
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface BookingListResponse {
  content: Booking[];
  totalElements: number;
  totalPages: number;
}

export interface OrderRequest {
  customerId: number;
  venueId: number;
  items: Array<{
    ticketTypeId: number;
    quantity: number;
  }>;
}

export interface PaymentCreateRequest {
  orderId: number;
  paymentMethod: 'CHUYEN_KHOAN_QR' | 'TIEN_MAT';
}

export interface PaymentCreateResponse {
  orderId: number;
  paymentUrl: string;
}

export interface PaymentStatusResponse {
  orderId: number;
  status: number; // 0: Pending, 1: Paid, 2: Cancelled
}
