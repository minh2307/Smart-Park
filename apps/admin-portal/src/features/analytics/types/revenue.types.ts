/**
 * Revenue Analytics Types
 * Revenue breakdown by venue, ride, ticket type, membership,
 * promotion, payment method, restaurant, retail shop
 */

export interface RevenueByCategory {
  name: string;
  value: number;
  percentage: number;
  trend: number;
  color?: string;
}

export interface RevenueBreakdown {
  byVenue: RevenueByCategory[];
  byRide: RevenueByCategory[];
  byTicketType: RevenueByCategory[];
  byMembership: RevenueByCategory[];
  byPromotion: RevenueByCategory[];
  byPaymentMethod: RevenueByCategory[];
  byRestaurant: RevenueByCategory[];
  byRetailShop: RevenueByCategory[];
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface RevenueAnalyticsData {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  growthRate: number;
  trend: RevenueTrendPoint[];
  breakdown: RevenueBreakdown;
  heatmapData: RevenueHeatmapPoint[];
  waterfallData: RevenueWaterfallItem[];
}

export interface RevenueHeatmapPoint {
  dayOfWeek: number;
  hour: number;
  value: number;
}

export interface RevenueWaterfallItem {
  name: string;
  value: number;
  type: 'income' | 'expense' | 'total';
}

export interface RevenueFilters {
  startDate: string;
  endDate: string;
  venueId?: number;
  groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year';
  category?: string;
}
