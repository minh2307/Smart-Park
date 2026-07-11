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
  mockDashboardSummary,
  mockRevenueTrend,
  mockRevenueByVenue,
  mockBookingAnalytics,
  mockOperationalData,
  mockRideAnalytics,
  mockParkingAnalytics,
  mockRetailFoodAnalytics,
  mockMembershipAnalytics,
  mockPromotionAnalytics,
  mockCustomerAnalytics,
  mockExportHistory,
} from './mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

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
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 600));
        return { data: mockDashboardSummary };
      },
      providesTags: ['Dashboard'],
    }),

    /* mock: replace with real endpoint GET /dashboard/revenue */
    getRevenueAnalytics: builder.query<RevenueAnalyticsData, RevenueFilters>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 600));
        return {
          data: {
            totalRevenue: 847230000,
            totalCost: 534730000,
            totalProfit: 312500000,
            growthRate: 12.3,
            trend: mockRevenueTrend,
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
              { name: 'Ticket Sales', value: 520000000, type: 'income' },
              { name: 'Food Court', value: 156800000, type: 'income' },
              { name: 'Retail', value: 89400000, type: 'income' },
              { name: 'Parking', value: 45200000, type: 'income' },
              { name: 'Memberships', value: 35830000, type: 'income' },
              { name: 'Operating Cost', value: -434730000, type: 'expense' },
              { name: 'Refunds', value: -19500000, type: 'expense' },
              { name: 'Marketing', value: -80500000, type: 'expense' },
              { name: 'Net Profit', value: 312500000, type: 'total' },
            ],
          },
        };
      },
      providesTags: ['Analytics'],
    }),

    /* mock: replace with real endpoint GET /dashboard/customers */
    getCustomerAnalytics: builder.query<CustomerAnalyticsData, DashboardFilters>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 500));
        return { data: mockCustomerAnalytics };
      },
      providesTags: ['Analytics'],
    }),

    /* mock: replace with real endpoint GET /dashboard/bookings */
    getBookingAnalytics: builder.query<BookingAnalyticsData, DashboardFilters>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 500));
        return { data: mockBookingAnalytics };
      },
      providesTags: ['Analytics'],
    }),

    /* mock: replace with real endpoint GET /dashboard/tickets */
    getTicketAnalytics: builder.query<TicketAnalyticsData, DashboardFilters>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 500));
        return {
          data: {
            ticketSales: Array.from({ length: 15 }, (_, i) => ({
              date: new Date(2026, 5, i + 20).toISOString(),
              sold: Math.floor(200 + Math.random() * 300),
              revenue: 15000000 + Math.floor(Math.random() * 10000000),
              validated: Math.floor(150 + Math.random() * 150),
            })),
            ticketRevenue: 520000000,
            totalTicketsSold: 12847,
            mostPopularTicket: { id: 1, name: 'General Admission', sold: 6423, revenue: 289035000, trend: 12.1 },
            leastPopularTicket: { id: 4, name: 'Season Pass', sold: 127, revenue: 76200000, trend: -5.3 },
            usageRate: 87.3,
            expirationRate: 4.2,
            validationSuccess: 98.7,
            rideUsage: [
              { rideId: 1, rideName: 'Thunder Coaster', usageCount: 4230, capacityPercentage: 78.5 },
              { rideId: 2, rideName: 'Water Splash', usageCount: 3210, capacityPercentage: 75.0 },
              { rideId: 3, rideName: 'Bumper Cars', usageCount: 2180, capacityPercentage: 65.2 },
              { rideId: 4, rideName: 'Sky Wheel', usageCount: 1240, capacityPercentage: 42.1 },
            ],
            venueUsage: [
              { venueId: 1, venueName: 'East Wing', ticketsSold: 5800, revenue: 261000000 },
              { venueId: 2, venueName: 'Water Pavilion', ticketsSold: 4210, revenue: 189450000 },
              { venueId: 3, venueName: 'Adventure Zone', ticketsSold: 2837, revenue: 127665000 },
            ],
            ticketTypeComparison: [
              { id: 1, name: 'General Admission', price: 45000, sold: 6423, revenue: 289035000, usageRate: 91.2, returnRate: 1.8 },
              { id: 2, name: 'VIP Fast Pass', price: 95000, sold: 3214, revenue: 305330000, usageRate: 88.4, returnRate: 2.1 },
              { id: 3, name: 'Two-Day Combo', price: 80000, sold: 2083, revenue: 166640000, usageRate: 82.6, returnRate: 3.4 },
              { id: 4, name: 'Season Pass', price: 600000, sold: 127, revenue: 76200000, usageRate: 74.8, returnRate: 0.8 },
            ],
          },
        };
      },
      providesTags: ['Analytics'],
    }),

    /* mock: placeholder endpoints with actual mock values */
    getRideAnalytics: builder.query<RideAnalyticsData, DashboardFilters>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 500));
        return { data: mockRideAnalytics };
      },
      providesTags: ['Analytics'],
    }),

    getParkingAnalytics: builder.query<ParkingAnalyticsData, DashboardFilters>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 500));
        return { data: mockParkingAnalytics };
      },
      providesTags: ['Analytics'],
    }),

    getRetailFoodAnalytics: builder.query<RetailFoodAnalyticsData, DashboardFilters>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 500));
        return { data: mockRetailFoodAnalytics };
      },
      providesTags: ['Analytics'],
    }),

    getMembershipAnalytics: builder.query<MembershipAnalyticsData, DashboardFilters>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 500));
        return { data: mockMembershipAnalytics };
      },
      providesTags: ['Analytics'],
    }),

    getPromotionAnalytics: builder.query<PromotionAnalyticsData, DashboardFilters>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 500));
        return { data: mockPromotionAnalytics };
      },
      providesTags: ['Analytics'],
    }),

    getOperationalDashboard: builder.query<OperationalDashboardData, void>({
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 400));
        return { data: mockOperationalData };
      },
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
