import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Coupon, CouponFilters, CouponListResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockCoupons: Coupon[] = [
  {
    id: 1,
    code: 'WELCOME_SPLASH_5',
    name: 'Welcome Splash Coupon',
    campaignId: 1,
    campaignName: 'Summer Splash 2026',
    discountType: 'FIXED_AMOUNT',
    discountValue: 5,
    quantity: 1000,
    remainingQuantity: 750,
    usedQuantity: 250,
    expirationDate: '2026-08-31',
    status: 'ACTIVE',
    assignedCustomers: ['Emily Davis', 'Liam Nguyen', 'Sophia Martinez'],
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 2,
    code: 'STUDENT_COSTER_10',
    name: 'Student Ride Discount Coupon',
    campaignId: 1,
    campaignName: 'Summer Splash 2026',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    quantity: 500,
    remainingQuantity: 412,
    usedQuantity: 88,
    expirationDate: '2026-08-15',
    status: 'ACTIVE',
    assignedCustomers: ['Marcus Aurelius', 'Jane Doe'],
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-06-15T09:00:00Z',
  },
  {
    id: 3,
    code: 'PAUSED_COUPON_15',
    name: 'Paused Summer Coupon',
    campaignId: 1,
    campaignName: 'Summer Splash 2026',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    quantity: 100,
    remainingQuantity: 100,
    usedQuantity: 0,
    expirationDate: '2026-08-30',
    status: 'PAUSED',
    assignedCustomers: [],
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 4,
    code: 'EXPIRED_SPRING_20',
    name: 'Expired Spring Coupon',
    campaignId: 3,
    campaignName: 'Spring Renewal VIP',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    quantity: 100,
    remainingQuantity: 10,
    usedQuantity: 90,
    expirationDate: '2026-05-15',
    status: 'EXPIRED',
    assignedCustomers: ['Liam Nguyen'],
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-05-15T18:00:00Z',
  },
];

export interface BulkGenerationRequest {
  name: string;
  campaignId: number | null;
  campaignName: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  quantity: number;
  expirationDate: string;
  prefix?: string;
  suffix?: string;
  length?: number;
  format?: 'ALPHANUMERIC' | 'NUMERIC' | 'ALPHA';
  count: number;
}

export const couponApi = createApi({
  reducerPath: 'couponApi',
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
  tagTypes: ['Coupon'],
  endpoints: (builder) => ({
    getCoupons: builder.query<CouponListResponse, CouponFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockCoupons];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.name.toLowerCase().includes(s) ||
              c.code.toLowerCase().includes(s)
          );
        }
        if (filters.campaignId) {
          filtered = filtered.filter((c) => c.campaignId === filters.campaignId);
        }
        if (filters.status) {
          filtered = filtered.filter((c) => c.status === filters.status);
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
      providesTags: ['Coupon'],
    }),

    getCouponById: builder.query<Coupon, number>({
      queryFn: async (id) => {
        const c = mockCoupons.find((item) => item.id === id);
        if (!c) return { error: { status: 404, statusText: 'Coupon Not Found', data: null } };
        return { data: c };
      },
      providesTags: (_res, _err, id) => [{ type: 'Coupon', id }],
    }),

    createCoupon: builder.mutation<Coupon, Partial<Coupon>>({
      queryFn: async (body) => {
        const newC: Coupon = {
          id: mockCoupons.length + 1,
          code: body.code || `COUP-${Math.floor(1000 + Math.random() * 9000)}`,
          name: body.name || 'New Coupon',
          campaignId: body.campaignId || null,
          campaignName: body.campaignName || 'General Campaign',
          discountType: body.discountType || 'PERCENTAGE',
          discountValue: body.discountValue || 0,
          quantity: body.quantity || 100,
          remainingQuantity: body.quantity || 100,
          usedQuantity: 0,
          expirationDate: body.expirationDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: body.status || 'ACTIVE',
          assignedCustomers: body.assignedCustomers || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockCoupons.push(newC);
        return { data: newC };
      },
      invalidatesTags: ['Coupon'],
    }),

    updateCoupon: builder.mutation<Coupon, { id: number; body: Partial<Coupon> }>({
      queryFn: async ({ id, body }) => {
        const index = mockCoupons.findIndex((item) => item.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Coupon Not Found', data: null } };
        const current = mockCoupons[index];
        const updated: Coupon = {
          ...current,
          ...body,
          updatedAt: new Date().toISOString(),
        };
        mockCoupons[index] = updated;
        return { data: updated };
      },
      invalidatesTags: (_res, _err, { id }) => ['Coupon', { type: 'Coupon', id }],
    }),

    deleteCoupon: builder.mutation<void, number>({
      queryFn: async (id) => {
        mockCoupons = mockCoupons.filter((item) => item.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ['Coupon'],
    }),

    generateCouponsBulk: builder.mutation<Coupon[], BulkGenerationRequest>({
      queryFn: async (req) => {
        const chars = {
          ALPHANUMERIC: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
          NUMERIC: '0123456789',
          ALPHA: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        };
        const activeChars = chars[req.format || 'ALPHANUMERIC'];
        const customLength = req.length || 8;
        const generated: Coupon[] = [];

        for (let i = 0; i < req.count; i++) {
          let codePart = '';
          for (let l = 0; l < customLength; l++) {
            codePart += activeChars.charAt(Math.floor(Math.random() * activeChars.length));
          }
          const finalCode = `${req.prefix || ''}${codePart}${req.suffix || ''}`;

          const newC: Coupon = {
            id: mockCoupons.length + 1 + i,
            code: finalCode,
            name: `${req.name} #${i + 1}`,
            campaignId: req.campaignId,
            campaignName: req.campaignName,
            discountType: req.discountType,
            discountValue: req.discountValue,
            quantity: req.quantity,
            remainingQuantity: req.quantity,
            usedQuantity: 0,
            expirationDate: req.expirationDate,
            status: 'ACTIVE',
            assignedCustomers: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          mockCoupons.push(newC);
          generated.push(newC);
        }

        return { data: generated };
      },
      invalidatesTags: ['Coupon'],
    }),

    assignCoupons: builder.mutation<Coupon, { id: number; customers: string[] }>({
      queryFn: async ({ id, customers }) => {
        const index = mockCoupons.findIndex((item) => item.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Coupon Not Found', data: null } };
        const current = mockCoupons[index];
        const updated: Coupon = {
          ...current,
          assignedCustomers: Array.from(new Set([...current.assignedCustomers, ...customers])),
          updatedAt: new Date().toISOString(),
        };
        mockCoupons[index] = updated;
        return { data: updated };
      },
      invalidatesTags: (_res, _err, { id }) => ['Coupon', { type: 'Coupon', id }],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponByIdQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useGenerateCouponsBulkMutation,
  useAssignCouponsMutation,
} = couponApi;
