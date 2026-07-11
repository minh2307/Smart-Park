/**
 * Centralized Mock Data for Analytics Dashboard
 * All data marked as mock - replace with real API when backend endpoints are ready
 */
import type { DashboardSummary, KpiMetric } from '../types/dashboard.types';
import type { RideAnalyticsData } from '../types/ride.types';
import type { ParkingAnalyticsData } from '../types/parking.types';
import type { RetailFoodAnalyticsData } from '../types/retail.types';
import type { MembershipAnalyticsData } from '../types/membership.types';
import type { PromotionAnalyticsData } from '../types/promotion.types';
import type { CustomerAnalyticsData } from '../types/customer.types';
import type { OperationalDashboardData } from '../types/operational.types';
import type { ExportJob } from '../types/index';

/* mock: helper to create KPI metric */
const kpi = (
  label: string,
  value: number,
  formatted: string,
  trendVal: number,
  dir: 'up' | 'down' | 'flat',
  sparkline?: number[]
): KpiMetric => ({
  label,
  value,
  formattedValue: formatted,
  trend: { value: trendVal, direction: dir },
  sparkline,
});

/* mock: Executive Dashboard Summary */
export const mockDashboardSummary: DashboardSummary = {
  totalRevenue: kpi('Total Revenue', 847230000, '₫847.2M', 12.3, 'up', [620, 680, 710, 750, 790, 820, 847]),
  revenueGrowth: kpi('Revenue Growth', 12.3, '12.3%', 2.1, 'up'),
  visitorsToday: kpi('Visitors Today', 3842, '3,842', 8.7, 'up', [2800, 3100, 3400, 3200, 3600, 3842]),
  bookingsToday: kpi('Bookings Today', 267, '267', 5.2, 'up'),
  ticketsSold: kpi('Tickets Sold', 12847, '12,847', 15.4, 'up', [9200, 10100, 11300, 12000, 12847]),
  activeMemberships: kpi('Active Memberships', 4521, '4,521', 3.8, 'up'),
  rideUtilization: kpi('Ride Utilization', 78.5, '78.5%', 2.3, 'up'),
  parkingUsage: kpi('Parking Usage', 62.1, '62.1%', -1.2, 'down'),
  foodCourtRevenue: kpi('Food Court Revenue', 156800000, '₫156.8M', 9.1, 'up'),
  retailRevenue: kpi('Retail Revenue', 89400000, '₫89.4M', 6.7, 'up'),
  refundRate: kpi('Refund Rate', 2.3, '2.3%', -0.5, 'down'),
  customerSatisfaction: kpi('Customer Satisfaction', 92.7, '92.7%', 1.2, 'up'),
  netProfit: kpi('Net Profit', 312500000, '₫312.5M', 14.1, 'up'),
  operatingCost: kpi('Operating Cost', 534730000, '₫534.7M', 3.2, 'up'),
  conversionRate: kpi('Conversion Rate', 6.9, '6.9%', 0.8, 'up'),
};

/* mock: Revenue trend data */
export const mockRevenueTrend = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2026, 5, i + 10).toISOString(),
  revenue: 20_000_000 + Math.random() * 15_000_000,
  cost: 12_000_000 + Math.random() * 8_000_000,
  profit: 8_000_000 + Math.random() * 7_000_000,
}));

/* mock: Revenue breakdown by venue */
export const mockRevenueByVenue = [
  { name: 'Smart Park East Wing', value: 320000000, percentage: 37.8, trend: 12.3 },
  { name: 'Water World Pavilion', value: 215000000, percentage: 25.4, trend: 8.1 },
  { name: 'Adventure Zone', value: 178000000, percentage: 21.0, trend: 15.7 },
  { name: 'Family Garden', value: 134230000, percentage: 15.8, trend: -2.4 },
];

/* mock: Visitor hourly flow */
export const mockVisitorFlow = {
  hourly: Array.from({ length: 16 }, (_, i) => ({
    hour: i + 7,
    count: Math.floor(100 + Math.random() * 400 * Math.sin((i / 16) * Math.PI)),
  })),
  totalToday: 3842,
  peakHour: 14,
  averageStayMinutes: 245,
};

/* mock: Booking analytics */
export const mockBookingAnalytics = {
  bookingsPerDay: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2026, 5, i + 10).toISOString(),
    count: Math.floor(80 + Math.random() * 120),
    revenue: 15_000_000 + Math.random() * 10_000_000,
  })),
  bookingsPerHour: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: i >= 8 && i <= 20 ? Math.floor(5 + Math.random() * 25) : Math.floor(Math.random() * 5),
    averageValue: 350000 + Math.random() * 200000,
  })),
  bookingConversion: {
    visitorsToBooking: 18.5,
    bookingToPayment: 72.3,
    paymentToCompleted: 94.1,
    overallConversion: 6.9,
    stages: [
      { name: 'Visitors', count: 3842, percentage: 100, dropOff: 0 },
      { name: 'Started Booking', count: 711, percentage: 18.5, dropOff: 81.5 },
      { name: 'Payment Initiated', count: 514, percentage: 72.3, dropOff: 27.7 },
      { name: 'Completed', count: 267, percentage: 94.1, dropOff: 5.9 },
    ],
  },
  cancellationRate: 4.7,
  refundRate: 2.3,
  bookingSources: [
    { label: 'Website', value: 156, percentage: 58.4 },
    { label: 'Mobile App', value: 78, percentage: 29.2 },
    { label: 'Walk-in', value: 33, percentage: 12.4 },
  ],
  peakBookingTime: [
    { hour: 10, dayOfWeek: 6, count: 42 },
    { hour: 11, dayOfWeek: 0, count: 38 },
    { hour: 14, dayOfWeek: 6, count: 35 },
  ],
  averageBookingValue: 485000,
  averageTicketsPerBooking: 2.8,
  statusDistribution: [
    { label: 'Completed', value: 201, percentage: 75.3 },
    { label: 'Pending', value: 42, percentage: 15.7 },
    { label: 'Cancelled', value: 24, percentage: 9.0 },
  ],
  totalBookings: 267,
  totalRevenue: 129495000,
};

/* mock: Ride analytics data */
export const mockRideAnalytics: RideAnalyticsData = {
  ridePopularity: [
    { id: 1, name: 'Thunder Coaster', totalRiders: 1420, rating: 4.8, trend: 5.4 },
    { id: 2, name: 'Water Splash', totalRiders: 1180, rating: 4.6, trend: 2.1 },
    { id: 3, name: 'Bumper Cars', totalRiders: 890, rating: 4.2, trend: -1.5 },
    { id: 4, name: 'Sky Wheel', totalRiders: 620, rating: 4.7, trend: 0.8 },
  ],
  rideCapacity: [
    { id: 1, name: 'Thunder Coaster', maxCapacity: 36, currentLoad: 28, utilizationPercent: 77.8 },
    { id: 2, name: 'Water Splash', maxCapacity: 24, currentLoad: 18, utilizationPercent: 75.0 },
    { id: 3, name: 'Bumper Cars', maxCapacity: 20, currentLoad: 12, utilizationPercent: 60.0 },
    { id: 4, name: 'Sky Wheel', maxCapacity: 40, currentLoad: 0, utilizationPercent: 0.0 },
  ],
  rideUtilization: [
    { id: 1, name: 'Thunder Coaster', utilizationPercent: 88.5, hoursActive: 10.6, hoursTotal: 12 },
    { id: 2, name: 'Water Splash', utilizationPercent: 78.3, hoursActive: 9.4, hoursTotal: 12 },
    { id: 3, name: 'Bumper Cars', utilizationPercent: 65.2, hoursActive: 7.8, hoursTotal: 12 },
    { id: 4, name: 'Sky Wheel', utilizationPercent: 42.1, hoursActive: 5.1, hoursTotal: 12 },
  ],
  averageQueueTime: 18.5,
  averageWaitingTime: 14.2,
  rideRevenue: [
    { id: 1, name: 'Thunder Coaster', revenue: 63900000, ticketsSold: 1420, averageRevenuePer: 45000 },
    { id: 2, name: 'Water Splash', revenue: 53100000, ticketsSold: 1180, averageRevenuePer: 45000 },
    { id: 3, name: 'Bumper Cars', revenue: 31150000, ticketsSold: 890, averageRevenuePer: 35000 },
    { id: 4, name: 'Sky Wheel', revenue: 27900000, ticketsSold: 620, averageRevenuePer: 45000 },
  ],
  rideDowntime: [
    { id: 3, name: 'Sky Wheel', downtimeMinutes: 120, reason: 'Routine safety check', date: '2026-07-09' },
    { id: 1, name: 'Thunder Coaster', downtimeMinutes: 45, reason: 'Sensor replacement', date: '2026-07-08' },
  ],
  maintenanceStats: {
    scheduledCount: 5,
    completedCount: 4,
    pendingCount: 1,
    averageResolutionHours: 2.5,
    upcomingMaintenance: [
      { rideId: 1, rideName: 'Thunder Coaster', scheduledDate: '2026-07-11T06:00:00Z', type: 'inspection', status: 'scheduled' },
      { rideId: 2, rideName: 'Water Splash', scheduledDate: '2026-07-12T07:00:00Z', type: 'routine', status: 'scheduled' },
    ],
  },
  rideAvailability: [
    { id: 1, name: 'Thunder Coaster', availabilityPercent: 98.2, status: 'active' },
    { id: 2, name: 'Water Splash', availabilityPercent: 96.5, status: 'active' },
    { id: 3, name: 'Bumper Cars', availabilityPercent: 99.1, status: 'active' },
    { id: 4, name: 'Sky Wheel', availabilityPercent: 82.4, status: 'maintenance' },
  ],
  peakHours: Array.from({ length: 12 }, (_, i) => ({
    hour: i + 8,
    averageRiders: Math.floor(150 + Math.random() * 250 * Math.sin((i / 12) * Math.PI)),
    averageWaitMinutes: Math.floor(10 + Math.random() * 30 * Math.sin((i / 12) * Math.PI)),
  })),
};

/* mock: Parking analytics data */
export const mockParkingAnalytics: ParkingAnalyticsData = {
  parkingOccupancy: {
    totalSpots: 500,
    occupiedSpots: 311,
    availableSpots: 189,
    occupancyPercent: 62.2,
  },
  parkingRevenue: 45200000,
  averageParkingDuration: 4.8,
  vehicleTypes: [
    { type: 'Sedan/SUV', count: 187, percentage: 60.1 },
    { type: 'Motorcycle', count: 94, percentage: 30.2 },
    { type: 'Bus/Minivan', count: 30, percentage: 9.7 },
  ],
  peakHours: Array.from({ length: 12 }, (_, i) => ({
    hour: i + 8,
    occupancy: Math.floor(40 + Math.random() * 50 * Math.sin((i / 12) * Math.PI)),
    revenue: Math.floor(1000000 + Math.random() * 4000000 * Math.sin((i / 12) * Math.PI)),
  })),
  parkingUtilization: 74.5,
  zoneUtilization: [
    { zoneId: 'A', zoneName: 'Zone A - Entrance', totalSpots: 150, occupied: 125, utilization: 83.3 },
    { zoneId: 'B', zoneName: 'Zone B - Main lot', totalSpots: 200, occupied: 134, utilization: 67.0 },
    { zoneId: 'C', zoneName: 'Zone C - West Wing', totalSpots: 150, occupied: 52, utilization: 34.7 },
  ],
  dailyTrend: Array.from({ length: 15 }, (_, i) => ({
    date: new Date(2026, 5, i + 20).toISOString(),
    vehicles: Math.floor(250 + Math.random() * 150),
    revenue: 3000000 + Math.floor(Math.random() * 2000000),
    averageDuration: 4.0 + Math.random() * 1.5,
  })),
};

/* mock: Retail & Food Court analytics */
export const mockRetailFoodAnalytics: RetailFoodAnalyticsData = {
  restaurantRevenue: 156800000,
  shopRevenue: 89400000,
  bestSellingProducts: [
    { id: 101, name: 'Burger Combo', category: 'Food & Beverage', unitsSold: 423, revenue: 38070000, trend: 15.4, shopName: 'Main Food Court' },
    { id: 102, name: 'Teddy Bear', category: 'Souvenirs', unitsSold: 184, revenue: 27600000, trend: 8.2, shopName: 'Gift Shop A' },
    { id: 103, name: 'Ice Cream Cup', category: 'Food & Beverage', unitsSold: 312, revenue: 15600000, trend: 12.1, shopName: 'Sweet Corner' },
  ],
  worstSellingProducts: [
    { id: 108, name: 'Sun Hat Small', category: 'Apparel', unitsSold: 12, revenue: 1800000, trend: -8.5, shopName: 'Gift Shop B' },
    { id: 109, name: 'Organic Salad', category: 'Food & Beverage', unitsSold: 15, revenue: 1200000, trend: -12.3, shopName: 'Main Food Court' },
  ],
  topCategories: [
    { name: 'Fast Food', revenue: 98500000, unitsSold: 1050, percentage: 40.0 },
    { name: 'Souvenirs & Gifts', revenue: 64200000, unitsSold: 580, percentage: 26.1 },
    { name: 'Beverages', revenue: 45800000, unitsSold: 1820, percentage: 18.6 },
    { name: 'Apparel', revenue: 37700000, unitsSold: 220, percentage: 15.3 },
  ],
  averageOrderValue: 128000,
  inventoryTurnover: [
    { productId: 101, productName: 'Burger Bun', turnoverRate: 14.5, stockLevel: 250, reorderPoint: 100 },
    { productId: 102, productName: 'Teddy Bear', turnoverRate: 3.2, stockLevel: 80, reorderPoint: 20 },
    { productId: 105, productName: 'Soda Can', turnoverRate: 18.1, stockLevel: 500, reorderPoint: 150 },
  ],
  supplierPerformance: [
    { supplierId: 1, supplierName: 'Metro Food Distributors', onTimeDelivery: 96.5, qualityScore: 94.2, totalOrders: 45 },
    { supplierId: 2, supplierName: 'Souvenir World Ltd', onTimeDelivery: 92.1, qualityScore: 96.0, totalOrders: 24 },
  ],
  dailyTrend: Array.from({ length: 15 }, (_, i) => ({
    date: new Date(2026, 5, i + 20).toISOString(),
    restaurantRevenue: 8000000 + Math.floor(Math.random() * 6000000),
    shopRevenue: 4000000 + Math.floor(Math.random() * 3000000),
    orderCount: Math.floor(100 + Math.random() * 80),
  })),
};

/* mock: Membership analytics data */
export const mockMembershipAnalytics: MembershipAnalyticsData = {
  membershipGrowth: Array.from({ length: 12 }, (_, i) => ({
    date: new Date(2026, i, 1).toISOString(),
    newMembers: Math.floor(150 + Math.random() * 100),
    totalMembers: Math.floor(2000 + i * 220),
    upgrades: Math.floor(15 + Math.random() * 10),
    downgrades: Math.floor(2 + Math.random() * 3),
    churned: Math.floor(8 + Math.random() * 5),
  })),
  membershipUpgrade: 28,
  membershipDowngrade: 4,
  pointsEarned: 145000,
  pointsRedeemed: 82000,
  benefitsUsage: [
    { benefitName: 'Free Parking', usageCount: 842, usageRate: 72.3, totalAvailable: 1164 },
    { benefitName: '10% Food Discount', usageCount: 1423, usageRate: 85.6, totalAvailable: 1662 },
    { benefitName: 'VIP Fast Lane', usageCount: 652, usageRate: 52.1, totalAvailable: 1251 },
  ],
  tierDistribution: [
    { tier: 'Standard', count: 2842, percentage: 62.8, avgSpending: 380000, color: '#94a3b8' },
    { tier: 'Silver', count: 1247, percentage: 27.6, avgSpending: 650000, color: '#cbd5e1' },
    { tier: 'Gold', count: 432, percentage: 9.6, avgSpending: 1250000, color: '#f59e0b' },
  ],
  revenueContribution: [
    { tier: 'Standard', revenue: 1079960000, percentage: 42.4, membersCount: 2842 },
    { tier: 'Silver', revenue: 810550000, percentage: 31.8, membersCount: 1247 },
    { tier: 'Gold', revenue: 540000000, percentage: 25.8, membersCount: 432 },
  ],
  totalActiveMembers: 4521,
  averagePointsBalance: 3200,
};

/* mock: Promotion analytics data */
export const mockPromotionAnalytics: PromotionAnalyticsData = {
  campaignPerformance: [
    { id: 1, name: 'Summer Carnival Pass', type: 'Discount Pass', impressions: 45000, conversions: 2450, revenue: 110250000, cost: 25000000, roi: 341.0, status: 'active', startDate: '2026-06-01', endDate: '2026-08-31' },
    { id: 2, name: 'Weekend Family Deal', type: 'Bundle Ticket', impressions: 28000, conversions: 1120, revenue: 89600000, cost: 18000000, roi: 397.8, status: 'active', startDate: '2026-06-15', endDate: '2026-07-31' },
    { id: 3, name: 'Student Wednesday 15%', type: 'Direct Discount', impressions: 12000, conversions: 890, revenue: 31150000, cost: 8000000, roi: 289.4, status: 'active', startDate: '2026-05-01', endDate: '2026-12-31' },
  ],
  promotionRevenue: 231000000,
  couponUsage: {
    totalIssued: 5000,
    totalUsed: 1420,
    usageRate: 28.4,
    totalDiscount: 28400000,
    byType: [
      { type: 'SUMMER10', count: 850, discount: 17000000 },
      { type: 'WELCOME5', count: 570, discount: 11400000 },
    ],
  },
  voucherUsage: {
    totalIssued: 1000,
    totalRedeemed: 423,
    redemptionRate: 42.3,
    totalValue: 42300000,
    byType: [
      { type: '₫100k Cash Voucher', count: 283, value: 28300000 },
      { type: 'Free Drink Voucher', count: 140, value: 14000000 },
    ],
  },
  conversionRate: 8.7,
  totalDiscountAmount: 70700000,
  roi: 326.7,
  topCampaigns: [
    { id: 2, name: 'Weekend Family Deal', revenue: 89600000, conversions: 1120, roi: 397.8 },
    { id: 1, name: 'Summer Carnival Pass', revenue: 110250000, conversions: 2450, roi: 341.0 },
    { id: 3, name: 'Student Wednesday 15%', revenue: 31150000, conversions: 890, roi: 289.4 },
  ],
  dailyTrend: Array.from({ length: 15 }, (_, i) => ({
    date: new Date(2026, 5, i + 20).toISOString(),
    revenue: 12000000 + Math.floor(Math.random() * 8000000),
    discounts: 3000000 + Math.floor(Math.random() * 2000000),
    conversions: 80 + Math.floor(Math.random() * 60),
  })),
};

/* mock: Customer analytics data */
export const mockCustomerAnalytics: CustomerAnalyticsData = {
  newCustomers: 342,
  returningCustomers: 1876,
  vipCustomers: 234,
  totalCustomers: 8742,
  customerGrowth: Array.from({ length: 12 }, (_, i) => ({
    date: new Date(2026, i, 1).toISOString(),
    newCustomers: 200 + Math.floor(Math.random() * 150),
    totalCustomers: 2000 + i * 220,
    churnedCustomers: 8 + Math.floor(Math.random() * 5),
  })),
  ageDistribution: [
    { label: '18-24', value: 1748, percentage: 20 },
    { label: '25-34', value: 2623, percentage: 30 },
    { label: '35-44', value: 2185, percentage: 25 },
    { label: '45-54', value: 1311, percentage: 15 },
    { label: '55+', value: 875, percentage: 10 },
  ],
  genderDistribution: [
    { label: 'Male', value: 4546, percentage: 52 },
    { label: 'Female', value: 3934, percentage: 45 },
    { label: 'Other', value: 262, percentage: 3 },
  ],
  nationalityDistribution: [
    { label: 'Vietnam', value: 6818, percentage: 78.0 },
    { label: 'South Korea', value: 874, percentage: 10.0 },
    { label: 'United States', value: 437, percentage: 5.0 },
    { label: 'Others', value: 613, percentage: 7.0 },
  ],
  membershipDistribution: [
    { label: 'Non-Member', value: 4221, percentage: 48.3 },
    { label: 'Standard', value: 2842, percentage: 32.5 },
    { label: 'Silver', value: 1247, percentage: 14.3 },
    { label: 'Gold', value: 432, percentage: 4.9 },
  ],
  visitFrequency: [
    { label: '1 visit', count: 5420, percentage: 62.0 },
    { label: '2-4 visits', count: 2447, percentage: 28.0 },
    { label: '5+ visits', count: 875, percentage: 10.0 },
  ],
  lifetimeValue: {
    average: 2450000,
    median: 1800000,
    distribution: [
      { range: 'Under 1M', count: 4200 },
      { range: '1M-3M', count: 3100 },
      { range: '3M-5M', count: 1100 },
      { range: 'Over 5M', count: 342 },
    ],
    bySegment: [
      { segment: 'VIP Customers', ltv: 8400000 },
      { segment: 'Regular Members', ltv: 3200000 },
      { segment: 'Casual Visitors', ltv: 950000 },
    ],
  },
  averageSpending: 485000,
  retentionRate: 68.4,
  churnRate: 31.6,
  topCustomers: [
    { id: 1, fullName: 'Nguyen Van Minh', email: 'minh.nv@email.com', totalSpent: 15200000, visitCount: 24, membershipTier: 'Gold', lastVisit: '2026-07-08' },
    { id: 2, fullName: 'Tran Thi Lan', email: 'lan.tt@email.com', totalSpent: 12800000, visitCount: 18, membershipTier: 'Gold', lastVisit: '2026-07-07' },
    { id: 3, fullName: 'Le Hoang Nam', email: 'nam.lh@email.com', totalSpent: 9600000, visitCount: 15, membershipTier: 'Silver', lastVisit: '2026-07-09' },
  ],
};

/* mock: Operational status */
export const mockOperationalData: OperationalDashboardData = {
  gateStatus: [
    { id: 1, name: 'Main Entrance A', status: 'open', lastScan: new Date().toISOString(), scansToday: 1247 },
    { id: 2, name: 'Main Entrance B', status: 'open', lastScan: new Date().toISOString(), scansToday: 1089 },
    { id: 3, name: 'VIP Gate', status: 'open', lastScan: new Date().toISOString(), scansToday: 342 },
    { id: 4, name: 'Service Gate', status: 'maintenance', lastScan: new Date().toISOString(), scansToday: 0 },
  ],
  rideStatus: [
    { id: 1, name: 'Thunder Coaster', status: 'active', currentLoad: 28, maxCapacity: 36, waitTimeMinutes: 25, lastUpdated: new Date().toISOString() },
    { id: 2, name: 'Water Splash', status: 'active', currentLoad: 18, maxCapacity: 24, waitTimeMinutes: 15, lastUpdated: new Date().toISOString() },
    { id: 3, name: 'Sky Wheel', status: 'maintenance', currentLoad: 0, maxCapacity: 40, waitTimeMinutes: 0, lastUpdated: new Date().toISOString() },
    { id: 4, name: 'Bumper Cars', status: 'active', currentLoad: 12, maxCapacity: 20, waitTimeMinutes: 10, lastUpdated: new Date().toISOString() },
  ],
  parkingStatus: {
    totalSpots: 500,
    occupied: 311,
    available: 189,
    reserved: 12,
    zoneBreakdown: [
      { zone: 'Zone A', occupied: 125, total: 150 },
      { zone: 'Zone B', occupied: 134, total: 200 },
      { zone: 'Zone C', occupied: 52, total: 150 },
    ],
  },
  lockerStatus: {
    totalLockers: 200,
    inUse: 134,
    available: 58,
    maintenance: 8,
  },
  scannerStatus: [
    { id: 1, location: 'Gate Entrance A1', status: 'online', lastActivity: new Date().toISOString(), scansToday: 624 },
    { id: 2, location: 'Gate Entrance A2', status: 'online', lastActivity: new Date().toISOString(), scansToday: 623 },
    { id: 3, location: 'Ride entrance Thunder Coaster', status: 'online', lastActivity: new Date().toISOString(), scansToday: 1420 },
    { id: 4, location: 'Parking terminal A', status: 'offline', lastActivity: new Date(Date.now() - 3600000).toISOString(), scansToday: 241 },
  ],
  operatorStatus: [
    { id: 1, fullName: 'Hoang Van Thắng', role: 'Security Supervisor', status: 'active', assignedArea: 'Main Entrance A', shiftStart: '06:00', shiftEnd: '14:00' },
    { id: 2, fullName: 'Phan Thị Nga', role: 'Ride Operator', status: 'active', assignedArea: 'Thunder Coaster', shiftStart: '08:00', shiftEnd: '16:00' },
    { id: 3, fullName: 'Nguyen Van Tuấn', role: 'Ticketing Agent', status: 'break', assignedArea: 'Main Entrance B', shiftStart: '08:00', shiftEnd: '16:00' },
  ],
  incidents: [
    { id: 1, title: 'Minor equipment malfunction at Water Splash', severity: 'medium', status: 'investigating', location: 'Water World', reportedAt: new Date().toISOString() },
    { id: 2, title: 'Lost child reported near food court', severity: 'high', status: 'resolved', location: 'Food Court', reportedAt: new Date().toISOString(), assignedTo: 'Security Team A' },
  ],
  supportTickets: {
    total: 24,
    open: 4,
    inProgress: 6,
    resolved: 14,
    averageResolutionHours: 2.1,
  },
  maintenanceItems: [
    { id: 1, targetName: 'Sky Wheel Cable Replacement', targetType: 'ride', scheduledDate: new Date(Date.now() + 86400000).toISOString(), status: 'scheduled', priority: 'high', assignedTo: 'Technical Crew B' },
    { id: 2, targetName: 'Entrance Scanner A2 recalibration', targetType: 'scanner', scheduledDate: new Date().toISOString(), status: 'in_progress', priority: 'medium', assignedTo: 'System Admin' },
  ],
  weatherImpact: {
    currentTemp: 32,
    condition: 'Sunny',
    visitorImpact: 'positive',
    forecastHours: [
      { hour: 9, temp: 28, condition: 'Sunny' },
      { hour: 12, temp: 33, condition: 'Sunny' },
      { hour: 15, temp: 34, condition: 'Sunny' },
      { hour: 18, temp: 30, condition: 'Clear' },
    ],
  },
};

/* mock: Export History logs */
export const mockExportHistory: ExportJob[] = [
  { id: '1', reportName: 'Monthly Revenue Report - June 2026', format: 'xlsx', status: 'completed', progress: 100, fileSize: 102450, createdAt: new Date(Date.now() - 3600000).toISOString(), completedAt: new Date(Date.now() - 3590000).toISOString() },
  { id: '2', reportName: 'VIP Customer List', format: 'pdf', status: 'completed', progress: 100, fileSize: 254120, createdAt: new Date(Date.now() - 7200000).toISOString(), completedAt: new Date(Date.now() - 7180000).toISOString() },
  { id: '3', reportName: 'Ride Downtime Logs', format: 'csv', status: 'failed', progress: 45, error: 'Database timeout occurred during export', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', reportName: 'Quarterly Visitor Analytics', format: 'json', status: 'processing', progress: 75, createdAt: new Date().toISOString() },
];
