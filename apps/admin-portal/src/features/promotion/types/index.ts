export interface Promotion {
  id: number;
  code: string;
  name: string;
  description: string;
  campaignId: number | null;
  campaignName: string;
  promotionType: 'DISCOUNT' | 'BOGO' | 'COMBO' | 'FLASH_SALE' | 'EARLY_BIRD';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number | null;
  maxUsage: number | null;
  usagePerCustomer: number | null;
  priority: number;
  stackable: boolean;
  startDate: string;
  endDate: string;
  applicableVenues: string[];
  applicableTicketTypes: string[];
  applicableMemberships: string[];
  applicableCustomerGroups: string[];
  remainingQuota: number;
  usageCount: number;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'ARCHIVED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface PromotionFilters {
  search?: string;
  campaignId?: number;
  discountType?: string;
  status?: string;
  venue?: string;
  ticketType?: string;
  membership?: string;
  page?: number;
  size?: number;
}

export interface PromotionListResponse {
  content: Promotion[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PromotionSummary {
  totalPromotions: number;
  activePromotions: number;
  expiredPromotions: number;
  revenueGenerated: number;
  discountAmount: number;
  couponsIssued: number;
  couponsRedeemed: number;
  voucherUsage: number;
  conversionRate: number;
}
