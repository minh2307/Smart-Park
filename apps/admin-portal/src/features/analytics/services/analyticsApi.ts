/**
 * Analytics RTK Query API
 * Single API slice for all dashboard/analytics endpoints
 * Uses queryFn with mock data fallback until backend endpoints are ready
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import type { DashboardSummary, DashboardFilters } from '../types/dashboard.types';
import type { RevenueAnalyticsData, RevenueFilters } from '../types/revenue.types';
import type { BookingAnalyticsData } from '../types/booking.types';
import type { TicketAnalyticsData } from '../types/ticket.types';
import type { RideAnalyticsData } from '../types/ride.types';
import type { ParkingAnalyticsData } from '../types/parking.types';
import type { RetailFoodAnalyticsData } from '../types/retail.types';
import type { MembershipAnalyticsData } from '../types/membership.types';
import type { PromotionAnalyticsData } from '../types/promotion.types';
import type { CustomerAnalyticsData } from '../types/customer.types';
import type { OperationalDashboardData } from '../types/operational.types';
import type { ExportJob, ReportTemplate, ReportGenerateRequest } from '../types/index';
import { REPORT_TEMPLATES } from '../constants/reportTemplates';
import {
  mockRevenueTrend,
  mockRevenueByVenue,
  mockExportHistory,
} from './mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const localFormatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value).replace(/\u200b/g, '').replace(/\s/g, ' ');
};

const mapKpiCard = (
  card: any,
  label: string,
  formatType: 'currency' | 'number' | 'percentage',
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
) => {
  const value = card ? Number(card.value) : 0;
  const previousValue = card ? Number(card.previousValue) : 0;
  const growth = card ? Number(card.growthPercentage) : 0;
  const trendDir = card && card.trend ? (card.trend.toLowerCase() as 'up' | 'down' | 'flat') : 'flat';

  let formattedValue = '';
  let compareFormattedValue = '';

  if (formatType === 'currency') {
    formattedValue = localFormatCurrency(value);
    compareFormattedValue = localFormatCurrency(previousValue);
  } else if (formatType === 'percentage') {
    formattedValue = `${value.toFixed(1)}%`;
    compareFormattedValue = `${previousValue.toFixed(1)}%`;
  } else {
    formattedValue = value.toLocaleString('vi-VN');
    compareFormattedValue = previousValue.toLocaleString('vi-VN');
  }

  return {
    label,
    value,
    formattedValue,
    trend: { value: Math.abs(growth), direction: trendDir },
    sparkline: card?.sparklineData || [],
    compareValue: previousValue,
    compareFormattedValue,
    color,
  };
};

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Dashboard', 'Analytics', 'Reports', 'Exports'],
  endpoints: (builder) => ({
    /* mock: replace with real endpoint GET /dashboard/summary */
    getDashboardSummary: builder.query<DashboardSummary, DashboardFilters>({
      query: () => '/dashboard/summary',
      transformResponse: (response: any): DashboardSummary => {
        const dto = response?.data || {};
        return {
          totalRevenue: mapKpiCard(dto.totalRevenue, 'Tổng Doanh Thu', 'currency', 'primary'),
          revenueGrowth: {
            label: 'Tăng trưởng Doanh Thu',
            value: dto.totalRevenue?.growthPercentage || 0,
            formattedValue: `${(dto.totalRevenue?.growthPercentage || 0).toFixed(1)}%`,
            trend: {
              value: Math.abs(dto.totalRevenue?.growthPercentage || 0),
              direction: (dto.totalRevenue?.trend || 'FLAT').toLowerCase() as 'up' | 'down' | 'flat',
            },
            sparkline: [],
            color: 'success',
          },
          visitorsToday: mapKpiCard(dto.totalVisitors, 'Số Lượng Khách Hàng', 'number', 'info'),
          bookingsToday: {
            label: 'Lượng Đặt Vé',
            value: Math.round(Number(dto.ticketsSold?.value || 0) * 0.15),
            formattedValue: Math.round(Number(dto.ticketsSold?.value || 0) * 0.15).toLocaleString('vi-VN'),
            trend: {
              value: dto.ticketsSold?.growthPercentage || 0,
              direction: (dto.ticketsSold?.trend || 'FLAT').toLowerCase() as 'up' | 'down' | 'flat',
            },
            color: 'primary',
          },
          ticketsSold: mapKpiCard(dto.ticketsSold, 'Vé Đã Bán', 'number', 'success'),
          activeMemberships: mapKpiCard(dto.activeMemberships, 'Thành Viên Hoạt Động', 'number', 'primary'),
          rideUtilization: mapKpiCard(dto.rideUtilization, 'Hiệu Suất Trò Chơi', 'percentage', 'info'),
          parkingUsage: {
            label: 'Sử Dụng Bãi Đỗ Xe',
            value: 62.1,
            formattedValue: '62.1%',
            trend: { value: 1.2, direction: 'down' },
            sparkline: [58, 60, 61, 62],
            color: 'warning',
          },
          foodCourtRevenue: mapKpiCard(dto.foodRevenue, 'Doanh Thu Quầy Ăn', 'currency', 'success'),
          retailRevenue: mapKpiCard(dto.retailRevenue, 'Doanh Thu Bán Lẻ', 'currency', 'primary'),
          refundRate: {
            label: 'Tỷ Lệ Hoàn Vé',
            value: 2.3,
            formattedValue: '2.3%',
            trend: { value: 0.5, direction: 'down' },
            color: 'error',
          },
          customerSatisfaction: mapKpiCard(dto.customerSatisfaction, 'Độ Hài Lòng', 'percentage', 'success'),
          netProfit: mapKpiCard(dto.totalProfit, 'Lợi Nhuận Ròng', 'currency', 'success'),
          operatingCost: mapKpiCard(dto.operatingCost || { value: Number(dto.totalRevenue?.value || 0) * 0.25, previousValue: Number(dto.totalRevenue?.previousValue || 0) * 0.25, growthPercentage: dto.totalRevenue?.growthPercentage, trend: dto.totalRevenue?.trend }, 'Chi Phí Vận Hành', 'currency', 'warning'),
          conversionRate: {
            label: 'Tỷ Lệ Chuyển Đổi',
            value: 6.9,
            formattedValue: '6.9%',
            trend: { value: 0.8, direction: 'up' },
            color: 'info',
          },
        };
      },
      providesTags: ['Dashboard'],
    }),

    /* mock: replace with real endpoint GET /dashboard/revenue */
    getRevenueAnalytics: builder.query<RevenueAnalyticsData, RevenueFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('from', filters.startDate.split('T')[0]);
        if (filters.endDate) params.append('to', filters.endDate.split('T')[0]);
        return `/dashboard/revenue?${params.toString()}`;
      },
      transformResponse: (response: any): RevenueAnalyticsData => {
        const list = response?.data || [];
        let totalRevenue = 0;
        let totalCost = 0;
        let totalProfit = 0;

        const trend = list.map((item: any) => {
          const rev = Number(item.revenue || 0);
          const c = Number(item.cost || 0);
          const prof = Number(item.profit || 0);
          totalRevenue += rev;
          totalCost += c;
          totalProfit += prof;
          return {
            date: item.period,
            revenue: rev,
            cost: c,
            profit: prof,
          };
        });

        return {
          totalRevenue,
          totalCost,
          totalProfit,
          growthRate: 12.3,
          trend: trend.length > 0 ? trend : mockRevenueTrend,
          breakdown: {
            byVenue: mockRevenueByVenue,
            byRide: [
              { name: 'Thunder Coaster', value: 63900000, percentage: 35.8, trend: 12.3 },
              { name: 'Water Splash', value: 53100000, percentage: 29.8, trend: 8.1 },
              { name: 'Bumper Cars', value: 31150000, percentage: 17.5, trend: 15.7 },
              { name: 'Sky Wheel', value: 30150000, percentage: 16.9, trend: -2.4 },
            ],
            byTicketType: [
              { name: 'General Admission', value: 289035000, percentage: 34.1, trend: 12.1 },
              { name: 'VIP Fast Pass', value: 305330000, percentage: 36.0, trend: 15.4 },
              { name: 'Two-Day Combo', value: 166640000, percentage: 19.7, trend: 5.2 },
              { name: 'Season Pass', value: 86200000, percentage: 10.2, trend: 2.3 },
            ],
            byMembership: [
              { name: 'Standard Tier', value: 120500000, percentage: 50.0, trend: 8.7 },
              { name: 'Silver Tier', value: 80500000, percentage: 33.4, trend: 12.1 },
              { name: 'Gold Tier', value: 40000000, percentage: 16.6, trend: 14.5 },
            ],
            byPromotion: [
              { name: 'Summer Pass Promotion', value: 110250000, percentage: 47.7, trend: 24.1 },
              { name: 'Weekend Family Bundle', value: 89600000, percentage: 38.8, trend: 18.2 },
              { name: 'Wednesday Student Offer', value: 31150000, percentage: 13.5, trend: 5.4 },
            ],
            byPaymentMethod: [
              { name: 'QR Transfer', value: 612000000, percentage: 72.2, trend: 18.5 },
              { name: 'Cash', value: 235230000, percentage: 27.8, trend: -3.1 },
            ],
            byRestaurant: [
              { name: 'Main Food Court', value: 98500000, percentage: 62.8, trend: 9.1 },
              { name: 'Sweet Corner', value: 58300000, percentage: 37.2, trend: 6.7 },
            ],
            byRetailShop: [
              { name: 'Gift Shop A', value: 54200000, percentage: 60.6, trend: 8.2 },
              { name: 'Gift Shop B', value: 35200000, percentage: 39.4, trend: 3.4 },
            ],
          },
          heatmapData: Array.from({ length: 7 * 24 }, (_, i) => ({
            dayOfWeek: Math.floor(i / 24),
            hour: i % 24,
            value: Math.floor(100000 + Math.random() * 2000000 * Math.sin(((i % 24) / 24) * Math.PI)),
          })),
          waterfallData: [
            { name: 'Bán vé', value: totalRevenue * 0.65, type: 'income' },
            { name: 'Quầy ăn', value: totalRevenue * 0.20, type: 'income' },
            { name: 'Cửa hàng lưu niệm', value: totalRevenue * 0.10, type: 'income' },
            { name: 'Gửi xe', value: totalRevenue * 0.05, type: 'income' },
            { name: 'Chi phí vận hành', value: -totalCost, type: 'expense' },
            { name: 'Lợi nhuận ròng', value: totalProfit, type: 'total' },
          ],
        };
      },
      providesTags: ['Analytics'],
    }),

    /* GET /dashboard/analytics/customer */
    getCustomerAnalytics: builder.query<CustomerAnalyticsData, DashboardFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate.split('T')[0]);
        if (filters.endDate) params.append('endDate', filters.endDate.split('T')[0]);
        return `/dashboard/analytics/customer?${params.toString()}`;
      },
      transformResponse: (response: any): CustomerAnalyticsData => response?.data,
      providesTags: ['Analytics'],
    }),

    /* GET /dashboard/analytics/booking */
    getBookingAnalytics: builder.query<BookingAnalyticsData, DashboardFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate.split('T')[0]);
        if (filters.endDate) params.append('endDate', filters.endDate.split('T')[0]);
        return `/dashboard/analytics/booking?${params.toString()}`;
      },
      transformResponse: (response: any): BookingAnalyticsData => response?.data,
      providesTags: ['Analytics'],
    }),

    /* GET /dashboard/analytics/ticket */
    getTicketAnalytics: builder.query<TicketAnalyticsData, DashboardFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate.split('T')[0]);
        if (filters.endDate) params.append('endDate', filters.endDate.split('T')[0]);
        return `/dashboard/analytics/ticket?${params.toString()}`;
      },
      transformResponse: (response: any): TicketAnalyticsData => response?.data,
      providesTags: ['Analytics'],
    }),

    /* GET /dashboard/analytics/ride */
    getRideAnalytics: builder.query<RideAnalyticsData, DashboardFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate.split('T')[0]);
        if (filters.endDate) params.append('endDate', filters.endDate.split('T')[0]);
        return `/dashboard/analytics/ride?${params.toString()}`;
      },
      transformResponse: (response: any): RideAnalyticsData => response?.data,
      providesTags: ['Analytics'],
    }),

    /* GET /dashboard/analytics/parking */
    getParkingAnalytics: builder.query<ParkingAnalyticsData, DashboardFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate.split('T')[0]);
        if (filters.endDate) params.append('endDate', filters.endDate.split('T')[0]);
        return `/dashboard/analytics/parking?${params.toString()}`;
      },
      transformResponse: (response: any): ParkingAnalyticsData => response?.data,
      providesTags: ['Analytics'],
    }),

    /* GET /dashboard/analytics/retail-food */
    getRetailFoodAnalytics: builder.query<RetailFoodAnalyticsData, DashboardFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate.split('T')[0]);
        if (filters.endDate) params.append('endDate', filters.endDate.split('T')[0]);
        return `/dashboard/analytics/retail-food?${params.toString()}`;
      },
      transformResponse: (response: any): RetailFoodAnalyticsData => response?.data,
      providesTags: ['Analytics'],
    }),

    /* GET /dashboard/analytics/membership */
    getMembershipAnalytics: builder.query<MembershipAnalyticsData, DashboardFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate.split('T')[0]);
        if (filters.endDate) params.append('endDate', filters.endDate.split('T')[0]);
        return `/dashboard/analytics/membership?${params.toString()}`;
      },
      transformResponse: (response: any): MembershipAnalyticsData => response?.data,
      providesTags: ['Analytics'],
    }),

    /* GET /dashboard/analytics/promotion */
    getPromotionAnalytics: builder.query<PromotionAnalyticsData, DashboardFilters>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate.split('T')[0]);
        if (filters.endDate) params.append('endDate', filters.endDate.split('T')[0]);
        return `/dashboard/analytics/promotion?${params.toString()}`;
      },
      transformResponse: (response: any): PromotionAnalyticsData => response?.data,
      providesTags: ['Analytics'],
    }),

    getOperationalDashboard: builder.query<OperationalDashboardData, void>({
      query: () => '/dashboard/operational',
      transformResponse: (response: any): OperationalDashboardData => response?.data,
      providesTags: ['Dashboard'],
    }),

    /* Reports */
    getReportTemplates: builder.query<ReportTemplate[], void>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 300));
        const mappedTemplates: ReportTemplate[] = REPORT_TEMPLATES.map((config, index) => ({
          id: `template-${index + 1}`,
          name: config.label,
          description: config.description,
          category: config.category,
          columns: config.defaultColumns,
          filters: [
            { field: 'dateRange', label: 'Date Range', type: 'date-range' },
            { field: 'venueId', label: 'Venue', type: 'select', options: [{ label: 'All Venues', value: 'all' }] },
          ],
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          createdBy: 'System',
          isSystem: true,
        }));
        return { data: mappedTemplates };
      },
      providesTags: ['Reports'],
    }),

    generateReport: builder.mutation<{ jobId: string }, ReportGenerateRequest>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 1200));
        return { data: { jobId: crypto.randomUUID() } };
      },
    }),

    /* Exports */
    getExportHistory: builder.query<ExportJob[], void>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 300));
        return { data: mockExportHistory };
      },
      providesTags: ['Exports'],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetRevenueAnalyticsQuery,
  useGetCustomerAnalyticsQuery,
  useGetBookingAnalyticsQuery,
  useGetTicketAnalyticsQuery,
  useGetRideAnalyticsQuery,
  useGetParkingAnalyticsQuery,
  useGetRetailFoodAnalyticsQuery,
  useGetMembershipAnalyticsQuery,
  useGetPromotionAnalyticsQuery,
  useGetOperationalDashboardQuery,
  useGetReportTemplatesQuery,
  useGenerateReportMutation,
  useGetExportHistoryQuery,
} = analyticsApi;
