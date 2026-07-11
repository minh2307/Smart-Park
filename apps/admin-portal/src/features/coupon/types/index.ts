export interface Coupon {
  id: number;
  code: string;
  name: string;
  campaignId: number | null;
  campaignName: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  quantity: number;
  remainingQuantity: number;
  usedQuantity: number;
  expirationDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PAUSED';
  assignedCustomers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CouponFilters {
  search?: string;
  status?: string;
  campaignId?: number;
  page?: number;
  size?: number;
}

export interface CouponListResponse {
  content: Coupon[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
