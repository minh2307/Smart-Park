export type TicketStatus =
  | 'DRAFT'
  | 'AVAILABLE'
  | 'RESERVED'
  | 'SOLD'
  | 'ACTIVATED'
  | 'USED'
  | 'PARTIALLY_USED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Ticket {
  id: number;
  ticketCode: string;
  orderId?: number;
  orderItemId?: number;
  ticketType?: {
    id: number;
    name: string;
    price: number;
  };
  customer?: {
    id: number;
    fullName: string;
    email?: string;
    phone?: string;
  };
  venue?: {
    id: number;
    name: string;
  };
  status: TicketStatus;
  validDate: string;
  createdAt: string;
  usageCount: number;
  remainingUses: number;
  maxUses: number;
  scans?: Array<{
    id: number;
    attractionName: string;
    checkInTime: string;
    status: string;
  }>;
}

export interface TicketFilters {
  search?: string;
  status?: TicketStatus | '';
  venueId?: number | '';
  ticketTypeId?: number | '';
  page?: number;
  size?: number;
  sort?: string;
}

export interface TicketListResponse {
  content: Ticket[];
  totalElements: number;
  totalPages: number;
}

export interface ScanRequest {
  qrCode: string;
  attractionId: number;
}

export interface ScanResponse {
  id: number;
  ticketId: number;
  attractionId: number;
  checkInTime: string;
  status: 'THANH_CONG' | 'VE_HET_HAN' | 'SAI_DIA_DIEM' | string;
}
