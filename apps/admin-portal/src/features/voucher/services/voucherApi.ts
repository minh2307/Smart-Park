import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Voucher, VoucherFilters, VoucherListResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockVouchers: Voucher[] = [
  {
    id: 1,
    code: 'VOUCH-GIFT-50',
    voucherType: 'GIFT',
    voucherValue: 50,
    issueDate: '2026-06-01',
    expirationDate: '2026-12-31',
    assignedCustomer: 'Emily Davis',
    redeemedDate: null,
    status: 'UNREDEEMED',
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 2,
    code: 'VOUCH-COMP-100',
    voucherType: 'COMPENSATION',
    voucherValue: 100,
    issueDate: '2026-06-10',
    expirationDate: '2026-09-10',
    assignedCustomer: 'Liam Nguyen',
    redeemedDate: '2026-06-25T14:30:00Z',
    status: 'REDEEMED',
    createdAt: '2026-06-10T10:00:00Z',
    updatedAt: '2026-06-25T14:30:00Z',
  },
  {
    id: 3,
    code: 'VOUCH-BDAY-25',
    voucherType: 'BIRTHDAY',
    voucherValue: 25,
    issueDate: '2026-07-01',
    expirationDate: '2026-07-31',
    assignedCustomer: 'Sophia Martinez',
    redeemedDate: null,
    status: 'UNREDEEMED',
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-07-01T09:00:00Z',
  },
  {
    id: 4,
    code: 'VOUCH-EXP-15',
    voucherType: 'DISCOUNT',
    voucherValue: 15,
    issueDate: '2026-01-01',
    expirationDate: '2026-04-01',
    assignedCustomer: 'Marcus Aurelius',
    redeemedDate: null,
    status: 'EXPIRED',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-04-01T23:59:59Z',
  },
];

export interface VoucherGenerationRequest {
  voucherType: Voucher['voucherType'];
  voucherValue: number;
  expirationDate: string;
  prefix?: string;
  count: number;
}

export const voucherApi = createApi({
  reducerPath: 'voucherApi',
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
  tagTypes: ['Voucher'],
  endpoints: (builder) => ({
    getVouchers: builder.query<VoucherListResponse, VoucherFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockVouchers];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (v) =>
              v.code.toLowerCase().includes(s) ||
              (v.assignedCustomer && v.assignedCustomer.toLowerCase().includes(s))
          );
        }
        if (filters.status) {
          filtered = filtered.filter((v) => v.status === filters.status);
        }
        if (filters.voucherType) {
          filtered = filtered.filter((v) => v.voucherType === filters.voucherType);
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
      providesTags: ['Voucher'],
    }),

    getVoucherById: builder.query<Voucher, number>({
      queryFn: async (id) => {
        const v = mockVouchers.find((item) => item.id === id);
        if (!v) return { error: { status: 404, statusText: 'Voucher Not Found', data: null } };
        return { data: v };
      },
      providesTags: (_res, _err, id) => [{ type: 'Voucher', id }],
    }),

    createVoucher: builder.mutation<Voucher, Partial<Voucher>>({
      queryFn: async (body) => {
        const newV: Voucher = {
          id: mockVouchers.length + 1,
          code: body.code || `VOUCH-${Math.floor(1000 + Math.random() * 9000)}`,
          voucherType: body.voucherType || 'GIFT',
          voucherValue: body.voucherValue || 10,
          issueDate: body.issueDate || new Date().toISOString().split('T')[0],
          expirationDate: body.expirationDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          assignedCustomer: body.assignedCustomer || null,
          redeemedDate: null,
          status: 'UNREDEEMED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockVouchers.push(newV);
        return { data: newV };
      },
      invalidatesTags: ['Voucher'],
    }),

    updateVoucher: builder.mutation<Voucher, { id: number; body: Partial<Voucher> }>({
      queryFn: async ({ id, body }) => {
        const index = mockVouchers.findIndex((item) => item.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Voucher Not Found', data: null } };
        const current = mockVouchers[index];
        const updated: Voucher = {
          ...current,
          ...body,
          updatedAt: new Date().toISOString(),
        };
        mockVouchers[index] = updated;
        return { data: updated };
      },
      invalidatesTags: (_res, _err, { id }) => ['Voucher', { type: 'Voucher', id }],
    }),

    deleteVoucher: builder.mutation<void, number>({
      queryFn: async (id) => {
        mockVouchers = mockVouchers.filter((item) => item.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ['Voucher'],
    }),

    generateVouchersBulk: builder.mutation<Voucher[], VoucherGenerationRequest>({
      queryFn: async (req) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const generated: Voucher[] = [];

        for (let i = 0; i < req.count; i++) {
          let codePart = '';
          for (let l = 0; l < 8; l++) {
            codePart += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          const finalCode = `${req.prefix || 'VOUCH-'}${codePart}`;

          const newV: Voucher = {
            id: mockVouchers.length + 1 + i,
            code: finalCode,
            voucherType: req.voucherType,
            voucherValue: req.voucherValue,
            issueDate: new Date().toISOString().split('T')[0],
            expirationDate: req.expirationDate,
            assignedCustomer: null,
            redeemedDate: null,
            status: 'UNREDEEMED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          mockVouchers.push(newV);
          generated.push(newV);
        }

        return { data: generated };
      },
      invalidatesTags: ['Voucher'],
    }),

    redeemVoucher: builder.mutation<Voucher, number>({
      queryFn: async (id) => {
        const index = mockVouchers.findIndex((item) => item.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Voucher Not Found', data: null } };
        const current = mockVouchers[index];
        if (current.status !== 'UNREDEEMED') {
          return { error: { status: 400, statusText: 'Voucher cannot be redeemed', data: null } };
        }
        const updated: Voucher = {
          ...current,
          status: 'REDEEMED',
          redeemedDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockVouchers[index] = updated;
        return { data: updated };
      },
      invalidatesTags: (_res, _err, id) => ['Voucher', { type: 'Voucher', id }],
    }),
  }),
});

export const {
  useGetVouchersQuery,
  useGetVoucherByIdQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useGenerateVouchersBulkMutation,
  useRedeemVoucherMutation,
} = voucherApi;
