/**
 * Promotion Analytics Types
 * Campaign performance, coupon/voucher usage, ROI, top campaigns
 */

export interface PromotionAnalyticsData {
  campaignPerformance: CampaignPerformanceItem[];
  promotionRevenue: number;
  couponUsage: CouponUsageData;
  voucherUsage: VoucherUsageData;
  conversionRate: number;
  totalDiscountAmount: number;
  roi: number;
  topCampaigns: TopCampaignItem[];
  dailyTrend: PromotionDailyPoint[];
}

export interface CampaignPerformanceItem {
  id: number;
  name: string;
  type: string;
  impressions: number;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number;
  status: 'active' | 'paused' | 'completed' | 'scheduled';
  startDate: string;
  endDate: string;
}

export interface CouponUsageData {
  totalIssued: number;
  totalUsed: number;
  usageRate: number;
  totalDiscount: number;
  byType: { type: string; count: number; discount: number }[];
}

export interface VoucherUsageData {
  totalIssued: number;
  totalRedeemed: number;
  redemptionRate: number;
  totalValue: number;
  byType: { type: string; count: number; value: number }[];
}

export interface TopCampaignItem {
  id: number;
  name: string;
  revenue: number;
  conversions: number;
  roi: number;
}

export interface PromotionDailyPoint {
  date: string;
  revenue: number;
  discounts: number;
  conversions: number;
}
