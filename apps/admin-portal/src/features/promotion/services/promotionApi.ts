import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Promotion, PromotionFilters, PromotionListResponse, PromotionSummary } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockPromotions: Promotion[] = [
  {
    id: 1,
    code: 'SUMMER_PASS_20',
    name: 'Summer Splash Discount',
    description: 'Get 20% off all ticket types during weekdays.',
    campaignId: 1,
    campaignName: 'Summer Splash 2026',
    promotionType: 'DISCOUNT',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxDiscount: 15,
    minOrderAmount: 30,
    maxUsage: 1000,
    usagePerCustomer: 2,
    priority: 1,
    stackable: false,
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    applicableVenues: ['Adventure Park', 'Fantasy Land'],
    applicableTicketTypes: ['Standard Admission', 'Kids Pass'],
    applicableMemberships: ['Bronze Base', 'Silver Rewards'],
    applicableCustomerGroups: ['General Visitors'],
    remainingQuota: 785,
    usageCount: 215,
    status: 'ACTIVE',
    createdAt: '2026-05-20T09:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 2,
    code: 'BOGO_COASTER',
    name: 'Buy One Get One Free Ride',
    description: 'Buy one Standard Admission, get a second one free on Wednesdays.',
    campaignId: 1,
    campaignName: 'Summer Splash 2026',
    promotionType: 'BOGO',
    discountType: 'PERCENTAGE',
    discountValue: 100,
    maxDiscount: null,
    minOrderAmount: null,
    maxUsage: 500,
    usagePerCustomer: 1,
    priority: 2,
    stackable: true,
    startDate: '2026-06-15',
    endDate: '2026-08-15',
    applicableVenues: ['Adventure Park'],
    applicableTicketTypes: ['Standard Admission'],
    applicableMemberships: ['All Memberships'],
    applicableCustomerGroups: ['Online Buyers'],
    remainingQuota: 452,
    usageCount: 48,
    status: 'ACTIVE',
    createdAt: '2026-06-10T11:00:00Z',
    updatedAt: '2026-06-15T08:00:00Z',
  },
  {
    id: 3,
    code: 'HALLOWEEN_FLASH_10',
    name: 'Halloween Spooktacular Flash Sale',
    description: 'Flash sale offering $10 flat discount on evening horror sessions.',
    campaignId: 2,
    campaignName: 'Halloween Haunt Fest',
    promotionType: 'FLASH_SALE',
    discountType: 'FIXED_AMOUNT',
    discountValue: 10,
    maxDiscount: null,
    minOrderAmount: 25,
    maxUsage: 300,
    usagePerCustomer: 1,
    priority: 3,
    stackable: false,
    startDate: '2026-10-25',
    endDate: '2026-10-31',
    applicableVenues: ['Adventure Park'],
    applicableTicketTypes: ['VIP Pass'],
    applicableMemberships: ['Platinum Prestige'],
    applicableCustomerGroups: ['VIP Guests'],
    remainingQuota: 300,
    usageCount: 0,
    status: 'DRAFT',
    createdAt: '2026-07-02T10:00:00Z',
    updatedAt: '2026-07-02T10:00:00Z',
  },
  {
    id: 4,
    code: 'EARLY_BIRD_SPRING',
    name: 'Spring Renewal VIP Early Bird Discount',
    description: 'Get $15 off standard park admission when booked 14 days in advance.',
    campaignId: 3,
    campaignName: 'Spring Renewal VIP',
    promotionType: 'EARLY_BIRD',
    discountType: 'FIXED_AMOUNT',
    discountValue: 15,
    maxDiscount: null,
    minOrderAmount: 50,
    maxUsage: 200,
    usagePerCustomer: 2,
    priority: 1,
    stackable: false,
    startDate: '2026-03-01',
    endDate: '2026-05-15',
    applicableVenues: ['Fantasy Land'],
    applicableTicketTypes: ['Standard Admission'],
    applicableMemberships: ['Silver Rewards', 'Gold Elite'],
    applicableCustomerGroups: ['Repeat Guests'],
    remainingQuota: 0,
    usageCount: 200,
    status: 'EXPIRED',
    createdAt: '2026-02-15T08:30:00Z',
    updatedAt: '2026-05-16T00:00:00Z',
  },
];

export let mockSummary: PromotionSummary = {
  totalPromotions: 15,
  activePromotions: 8,
  expiredPromotions: 4,
  revenueGenerated: 187420,
  discountAmount: 32450,
  couponsIssued: 4500,
  couponsRedeemed: 2850,
  voucherUsage: 1420,
  conversionRate: 14.8,
};

export const promotionApi = createApi({
  reducerPath: 'promotionApi',
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
  tagTypes: ['Promotion', 'PromotionSummary'],
  endpoints: (builder) => ({
    getPromotions: builder.query<PromotionListResponse, PromotionFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockPromotions];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(s) ||
              p.code.toLowerCase().includes(s) ||
              p.description.toLowerCase().includes(s)
          );
        }
        if (filters.campaignId) {
          filtered = filtered.filter((p) => p.campaignId === filters.campaignId);
        }
        if (filters.discountType) {
          filtered = filtered.filter((p) => p.discountType === filters.discountType);
        }
        if (filters.status) {
          filtered = filtered.filter((p) => p.status === filters.status);
        }
        if (filters.venue) {
          filtered = filtered.filter((p) => p.applicableVenues.includes(filters.venue || ''));
        }
        if (filters.ticketType) {
          filtered = filtered.filter((p) => p.applicableTicketTypes.includes(filters.ticketType || ''));
        }
        if (filters.membership) {
          filtered = filtered.filter((p) => p.applicableMemberships.includes(filters.membership || ''));
        }

        const size = filters.size || 10;
        const page = filters.page || 0;
        const offset = page * size;
        const content = filtered.slice(offset, offset + size);
        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size);

        return {
          data: {
            content,
            totalElements,
            totalPages,
            size,
            number: page,
          },
        };
      },
      providesTags: ['Promotion'],
    }),

    getPromotionById: builder.query<Promotion, number>({
      queryFn: async (id) => {
        const p = mockPromotions.find((item) => item.id === id);
        if (!p) return { error: { status: 404, statusText: 'Promotion Not Found', data: null } };
        return { data: p };
      },
      providesTags: (_res, _err, id) => [{ type: 'Promotion', id }],
    }),

    getPromotionSummary: builder.query<PromotionSummary, void>({
      queryFn: async () => {
        return { data: mockSummary };
      },
      providesTags: ['PromotionSummary'],
    }),

    createPromotion: builder.mutation<Promotion, Partial<Promotion>>({
      queryFn: async (body) => {
        const newP: Promotion = {
          id: mockPromotions.length + 1,
          code: body.code || `PROM-${Math.floor(1000 + Math.random() * 9000)}`,
          name: body.name || 'New Promotion',
          description: body.description || '',
          campaignId: body.campaignId || null,
          campaignName: body.campaignName || 'General Promotions',
          promotionType: body.promotionType || 'DISCOUNT',
          discountType: body.discountType || 'PERCENTAGE',
          discountValue: body.discountValue || 0,
          maxDiscount: body.maxDiscount || null,
          minOrderAmount: body.minOrderAmount || null,
          maxUsage: body.maxUsage || null,
          usagePerCustomer: body.usagePerCustomer || null,
          priority: body.priority || 1,
          stackable: body.stackable || false,
          startDate: body.startDate || new Date().toISOString().split('T')[0],
          endDate: body.endDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          applicableVenues: body.applicableVenues || [],
          applicableTicketTypes: body.applicableTicketTypes || [],
          applicableMemberships: body.applicableMemberships || [],
          applicableCustomerGroups: body.applicableCustomerGroups || [],
          remainingQuota: body.maxUsage || 100,
          usageCount: 0,
          status: body.status || 'DRAFT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockPromotions.push(newP);
        mockSummary.totalPromotions += 1;
        return { data: newP };
      },
      invalidatesTags: ['Promotion', 'PromotionSummary'],
    }),

    updatePromotion: builder.mutation<Promotion, { id: number; body: Partial<Promotion> }>({
      queryFn: async ({ id, body }) => {
        const index = mockPromotions.findIndex((item) => item.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Promotion Not Found', data: null } };
        const current = mockPromotions[index];
        const updated: Promotion = {
          ...current,
          ...body,
          updatedAt: new Date().toISOString(),
        };
        mockPromotions[index] = updated;
        return { data: updated };
      },
      invalidatesTags: (_res, _err, { id }) => ['Promotion', { type: 'Promotion', id }, 'PromotionSummary'],
    }),

    deletePromotion: builder.mutation<void, number>({
      queryFn: async (id) => {
        mockPromotions = mockPromotions.filter((item) => item.id !== id);
        mockSummary.totalPromotions = Math.max(0, mockSummary.totalPromotions - 1);
        return { data: undefined };
      },
      invalidatesTags: ['Promotion', 'PromotionSummary'],
    }),
  }),
});

export const {
  useGetPromotionsQuery,
  useGetPromotionByIdQuery,
  useGetPromotionSummaryQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
} = promotionApi;
