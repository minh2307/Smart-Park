/**
 * Retail & Food Court Analytics Types
 * Restaurant revenue, shop revenue, best/worst sellers, categories
 */

export interface RetailFoodAnalyticsData {
  restaurantRevenue: number;
  shopRevenue: number;
  bestSellingProducts: ProductSalesItem[];
  worstSellingProducts: ProductSalesItem[];
  topCategories: CategoryItem[];
  averageOrderValue: number;
  inventoryTurnover: InventoryTurnoverItem[];
  supplierPerformance: SupplierPerformanceItem[];
  dailyTrend: RetailDailyPoint[];
}

export interface ProductSalesItem {
  id: number;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  trend: number;
  shopName: string;
}

export interface CategoryItem {
  name: string;
  revenue: number;
  unitsSold: number;
  percentage: number;
}

export interface InventoryTurnoverItem {
  productId: number;
  productName: string;
  turnoverRate: number;
  stockLevel: number;
  reorderPoint: number;
}

export interface SupplierPerformanceItem {
  supplierId: number;
  supplierName: string;
  onTimeDelivery: number;
  qualityScore: number;
  totalOrders: number;
}

export interface RetailDailyPoint {
  date: string;
  restaurantRevenue: number;
  shopRevenue: number;
  orderCount: number;
}
