export type RestaurantStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Restaurant {
  id: number;
  restaurantCode: string;
  restaurantName: string;
  venueId: number;
  venueName?: string;
  location: string;
  businessHours: string;
  manager: string;
  status: RestaurantStatus;
  revenue: number;
  ordersCount: number;
  queueLength: number;
}

export type MenuItemStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'OUT_OF_STOCK';

export interface MenuItem {
  id: number;
  restaurantId: number;
  restaurantName?: string;
  categoryName: string;
  itemName: string;
  image?: string;
  description: string;
  price: number;
  discount: number; // percentage or fixed
  preparationTime: number; // in minutes
  calories: number;
  status: MenuItemStatus;
}

export interface FoodCourtDashboardStats {
  totalRestaurants: number;
  activeRestaurants: number;
  dailyRevenue: number;
  ordersToday: number;
  bestSellingItems: { name: string; salesCount: number; revenue: number }[];
  occupancyRate: number; // percentage
  averageQueueLength: number;
  revenueTrend: { date: string; amount: number }[];
}

export interface RestaurantFilters {
  search?: string;
  status?: RestaurantStatus | '';
  page?: number;
  size?: number;
}

export interface MenuItemFilters {
  restaurantId?: number | '';
  category?: string;
  search?: string;
  status?: MenuItemStatus | '';
  page?: number;
  size?: number;
}
