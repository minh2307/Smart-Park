export interface Voucher {
  id: number;
  code: string;
  voucherType: 'GIFT' | 'CASH' | 'DISCOUNT' | 'MEMBERSHIP' | 'BIRTHDAY' | 'PROMOTION' | 'REFERRAL' | 'COMPENSATION';
  voucherValue: number; // flat cash or discount percentage
  issueDate: string;
  expirationDate: string;
  assignedCustomer: string | null;
  redeemedDate: string | null;
  status: 'UNREDEEMED' | 'REDEEMED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
}

export interface VoucherFilters {
  search?: string;
  status?: string;
  voucherType?: string;
  page?: number;
  size?: number;
}

export interface VoucherListResponse {
  content: Voucher[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
