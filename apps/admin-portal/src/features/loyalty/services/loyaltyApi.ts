import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { PointTransaction, PointRulesConfig, PointAdjustmentRequest, LoyaltySummary } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockPointTransactions: PointTransaction[] = [
  {
    id: 1,
    customerId: 1,
    customerName: 'Emily Davis',
    membershipCode: 'MEM-EMILY-7829',
    type: 'EARNED',
    points: 150,
    balanceAfter: 1250,
    source: 'TICKET_BOOKING',
    bookingCode: 'BK-782910',
    status: 'SUCCESS',
    description: 'Earned from Ticket Booking (Standard Pass)',
    createdAt: '2026-07-01T10:15:00Z',
  },
  {
    id: 2,
    customerId: 2,
    customerName: 'Liam Nguyen',
    membershipCode: 'MEM-LIAM-9081',
    type: 'EARNED',
    points: 500,
    balanceAfter: 4200,
    source: 'TICKET_BOOKING',
    bookingCode: 'BK-908122',
    status: 'SUCCESS',
    description: 'Earned from VIP Ticket booking',
    createdAt: '2026-06-28T09:40:00Z',
  },
  {
    id: 3,
    customerId: 1,
    customerName: 'Emily Davis',
    membershipCode: 'MEM-EMILY-7829',
    type: 'REDEEMED',
    points: 200,
    balanceAfter: 1100,
    source: 'FOOD_BEVERAGE',
    bookingCode: 'FB-88122',
    status: 'SUCCESS',
    description: 'Redeemed points at Dino Bites Cafe',
    createdAt: '2026-06-20T12:30:00Z',
  },
  {
    id: 4,
    customerId: 4,
    customerName: 'Marcus Aurelius',
    membershipCode: 'MEM-MARCUS-0426',
    type: 'ADJUSTED',
    points: 100,
    balanceAfter: 850,
    source: 'MANUAL',
    status: 'SUCCESS',
    description: 'Manual adjustment: customer relations goodwill credit',
    operatorName: 'Admin Operator',
    createdAt: '2026-07-02T11:00:00Z',
  },
  {
    id: 5,
    customerId: 3,
    customerName: 'Sophia Martinez',
    membershipCode: 'MEM-SOPHIA-1212',
    type: 'EXPIRED',
    points: 50,
    balanceAfter: 120,
    source: 'MANUAL',
    status: 'SUCCESS',
    description: 'Point Expiration due to 12-month inactivity',
    createdAt: '2026-07-05T16:30:00Z',
  },
];

export let mockPointRules: PointRulesConfig = {
  earnRate: 1.00,
  redeemRate: 0.01,
  maxEarnPerTx: 1000,
  maxRedeemPerTx: 5000,
  minRedeemTx: 100,
  expirationMonths: 12,
  firstPurchaseBonus: 200,
  birthdayBonus: 150,
  referralBonus: 100,
  multipliers: {
    weekend: 1.20,
    holiday: 1.50,
    specialEvent: 2.00,
  },
};

export let mockAdjustmentRequests: PointAdjustmentRequest[] = [
  {
    id: 1,
    customerId: 1,
    customerName: 'Emily Davis',
    type: 'ADD',
    points: 250,
    reason: 'Correction of points missed during waterpark ticketing kiosk checkout',
    requestedBy: 'operator_dan',
    status: 'PENDING',
    createdAt: '2026-07-08T14:00:00Z',
  },
  {
    id: 2,
    customerId: 3,
    customerName: 'Sophia Martinez',
    type: 'DEDUCT',
    points: 100,
    reason: 'Chargeback processing points deduction for order return BK-0012',
    requestedBy: 'finance_steve',
    approvedBy: 'manager_julia',
    status: 'APPROVED',
    createdAt: '2026-07-02T09:15:00Z',
  },
];

export const loyaltyApi = createApi({
  reducerPath: 'loyaltyApi',
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
  tagTypes: ['LoyaltyTransaction', 'LoyaltyRules', 'LoyaltyAdjustment'],
  endpoints: (builder) => ({
    getLoyaltySummary: builder.query<LoyaltySummary, void>({
      queryFn: async () => {
        const totalEarned = mockPointTransactions
          .filter((t) => t.type === 'EARNED' || (t.type === 'ADJUSTED' && t.points > 0))
          .reduce((acc, t) => acc + Math.abs(t.points), 0);
        const totalRedeemed = mockPointTransactions
          .filter((t) => t.type === 'REDEEMED' || (t.type === 'ADJUSTED' && t.points < 0))
          .reduce((acc, t) => acc + Math.abs(t.points), 0);
        return {
          data: {
            totalEarned,
            totalRedeemed,
            expiringSoon: 450,
            activeEarners: 290,
          },
        };
      },
      providesTags: ['LoyaltyTransaction'],
    }),

    getTransactions: builder.query<PointTransaction[], { search?: string; type?: string; customerId?: number }>({
      queryFn: async (filters) => {
        let list = [...mockPointTransactions];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          list = list.filter(
            (t) =>
              t.customerName.toLowerCase().includes(s) ||
              t.membershipCode.toLowerCase().includes(s) ||
              t.description.toLowerCase().includes(s)
          );
        }
        if (filters.type) {
          list = list.filter((t) => t.type === filters.type);
        }
        if (filters.customerId) {
          list = list.filter((t) => t.customerId === filters.customerId);
        }
        return { data: list.sort((a, b) => b.id - a.id) };
      },
      providesTags: ['LoyaltyTransaction'],
    }),

    getRulesConfig: builder.query<PointRulesConfig, void>({
      queryFn: async () => {
        return { data: mockPointRules };
      },
      providesTags: ['LoyaltyRules'],
    }),

    updateRulesConfig: builder.mutation<PointRulesConfig, Partial<PointRulesConfig>>({
      queryFn: async (body) => {
        mockPointRules = {
          ...mockPointRules,
          ...body,
          multipliers: {
            ...mockPointRules.multipliers,
            ...body.multipliers,
          },
        };
        return { data: mockPointRules };
      },
      invalidatesTags: ['LoyaltyRules'],
    }),

    getAdjustmentRequests: builder.query<PointAdjustmentRequest[], void>({
      queryFn: async () => {
        return { data: mockAdjustmentRequests };
      },
      providesTags: ['LoyaltyAdjustment'],
    }),

    createAdjustmentRequest: builder.mutation<PointAdjustmentRequest, Partial<PointAdjustmentRequest>>({
      queryFn: async (body) => {
        const newReq: PointAdjustmentRequest = {
          id: mockAdjustmentRequests.length + 1,
          customerId: body.customerId || 1,
          customerName: body.customerName || 'Loyal Guest',
          type: body.type || 'ADD',
          points: body.points || 0,
          reason: body.reason || 'General adjustment',
          requestedBy: body.requestedBy || 'admin',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };
        mockAdjustmentRequests.push(newReq);
        return { data: newReq };
      },
      invalidatesTags: ['LoyaltyAdjustment'],
    }),

    approveAdjustmentRequest: builder.mutation<PointAdjustmentRequest, { id: number; approver: string }>({
      queryFn: async ({ id, approver }) => {
        const index = mockAdjustmentRequests.findIndex((r) => r.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Request Not Found', data: null } };
        
        const req = mockAdjustmentRequests[index];
        const updated: PointAdjustmentRequest = {
          ...req,
          status: 'APPROVED',
          approvedBy: approver,
        };
        mockAdjustmentRequests[index] = updated;

        // Apply point changes to transaction list
        const newTx: PointTransaction = {
          id: mockPointTransactions.length + 1,
          customerId: req.customerId,
          customerName: req.customerName,
          membershipCode: `MEM-${req.customerName.substring(0,4).toUpperCase()}-MOCK`,
          type: 'ADJUSTED',
          points: req.type === 'ADD' ? req.points : -req.points,
          balanceAfter: 1500, // mock incremented balance
          source: 'MANUAL',
          status: 'SUCCESS',
          description: `Adjustment Approved: ${req.reason}`,
          operatorName: approver,
          createdAt: new Date().toISOString(),
        };
        mockPointTransactions.push(newTx);

        return { data: updated };
      },
      invalidatesTags: ['LoyaltyAdjustment', 'LoyaltyTransaction'],
    }),

    rejectAdjustmentRequest: builder.mutation<PointAdjustmentRequest, { id: number; approver: string }>({
      queryFn: async ({ id, approver }) => {
        const index = mockAdjustmentRequests.findIndex((r) => r.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Request Not Found', data: null } };

        const req = mockAdjustmentRequests[index];
        const updated: PointAdjustmentRequest = {
          ...req,
          status: 'REJECTED',
          approvedBy: approver,
        };
        mockAdjustmentRequests[index] = updated;
        return { data: updated };
      },
      invalidatesTags: ['LoyaltyAdjustment'],
    }),
  }),
});

export const {
  useGetLoyaltySummaryQuery,
  useGetTransactionsQuery,
  useGetRulesConfigQuery,
  useUpdateRulesConfigMutation,
  useGetAdjustmentRequestsQuery,
  useCreateAdjustmentRequestMutation,
  useApproveAdjustmentRequestMutation,
  useRejectAdjustmentRequestMutation,
} = loyaltyApi;
