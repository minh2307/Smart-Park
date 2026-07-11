import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { POSOrder, Shift } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// In-memory mock database
export let mockPOSOrders: POSOrder[] = [
  {
    id: 1,
    orderNumber: 'POS-20260709-1001',
    items: [
      {
        product: {
          id: 1,
          sku: 'PROD-SWIM001',
          barcode: '8936012345678',
          productName: 'Kính Bơi Speedo Pro',
          categoryId: 2,
          categoryName: 'Kính & Mũ Bơi',
          brand: 'Speedo',
          price: 350000,
          costPrice: 200000,
          discount: 10,
          tax: 10,
          stock: 45,
          minimumStock: 10,
          supplierId: 1,
          supplierName: 'Speedo Việt Nam Co.',
          status: 'ACTIVE',
        },
        quantity: 1,
        discountPercentage: 0,
        finalPrice: 315000,
      },
    ],
    subtotal: 315000,
    discountAmount: 0,
    taxAmount: 31500,
    totalAmount: 346500,
    paymentMethod: 'CASH',
    amountPaid: 350000,
    changeAmount: 3500,
    customerName: 'Nguyễn Văn A',
    status: 'COMPLETED',
    createdAt: '2026-07-09T15:00:00Z',
  },
];

export let mockShifts: Shift[] = [
  {
    id: 1,
    operatorName: 'Phạm Thị Thùy',
    startTime: '2026-07-09T08:00:00Z',
    status: 'OPEN',
    initialCash: 1000000,
  },
];

export const posApi = createApi({
  reducerPath: 'posApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['POSOrder', 'POSShift'],
  endpoints: (builder) => ({
    getPOSOrders: builder.query<{ content: POSOrder[] }, { status?: 'COMPLETED' | 'HELD' }>({
      queryFn: async (filters) => {
        let filtered = [...mockPOSOrders];
        if (filters.status) {
          filtered = filtered.filter((o) => o.status === filters.status);
        }
        return { data: { content: filtered } };
      },
      providesTags: ['POSOrder'],
    }),

    createPOSOrder: builder.mutation<POSOrder, Partial<POSOrder>>({
      queryFn: async (body) => {
        const newOrder: POSOrder = {
          id: mockPOSOrders.length + 1,
          orderNumber: body.orderNumber || `POS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
          items: body.items || [],
          subtotal: body.subtotal || 0,
          discountAmount: body.discountAmount || 0,
          taxAmount: body.taxAmount || 0,
          totalAmount: body.totalAmount || 0,
          paymentMethod: body.paymentMethod || 'CASH',
          amountPaid: body.amountPaid || 0,
          changeAmount: body.changeAmount || 0,
          customerName: body.customerName || 'Khách Vãng Lai',
          membershipCode: body.membershipCode,
          couponCode: body.couponCode,
          voucherCode: body.voucherCode,
          status: body.status || 'COMPLETED',
          holdReason: body.holdReason,
          createdAt: new Date().toISOString(),
        };

        mockPOSOrders.unshift(newOrder);
        return { data: newOrder };
      },
      invalidatesTags: ['POSOrder'],
    }),

    updatePOSOrderStatus: builder.mutation<POSOrder, { id: number; status: 'COMPLETED' | 'CANCELLED'; payment?: any }>({
      queryFn: async ({ id, status, payment }) => {
        const order = mockPOSOrders.find((o) => o.id === id);
        if (!order) return { error: { status: 404, statusText: 'Order Not Found', data: null } };

        order.status = status;
        if (payment) {
          order.paymentMethod = payment.paymentMethod;
          order.amountPaid = payment.amountPaid;
          order.changeAmount = payment.changeAmount;
        }

        return { data: order };
      },
      invalidatesTags: ['POSOrder'],
    }),

    getCurrentShift: builder.query<Shift | null, void>({
      queryFn: async () => {
        const active = mockShifts.find((s) => s.status === 'OPEN');
        return { data: active || null };
      },
      providesTags: ['POSShift'],
    }),

    openShift: builder.mutation<Shift, { operatorName: string; initialCash: number }>({
      queryFn: async ({ operatorName, initialCash }) => {
        const active = mockShifts.find((s) => s.status === 'OPEN');
        if (active) return { error: { status: 400, statusText: 'Shift already open', data: null } };

        const newShift: Shift = {
          id: mockShifts.length + 1,
          operatorName,
          startTime: new Date().toISOString(),
          status: 'OPEN',
          initialCash,
        };

        mockShifts.push(newShift);
        return { data: newShift };
      },
      invalidatesTags: ['POSShift'],
    }),

    closeShift: builder.mutation<Shift, { closedCash: number }>({
      queryFn: async ({ closedCash }) => {
        const active = mockShifts.find((s) => s.status === 'OPEN');
        if (!active) return { error: { status: 404, statusText: 'No open shift', data: null } };

        active.status = 'CLOSED';
        active.endTime = new Date().toISOString();
        active.closedCash = closedCash;

        return { data: active };
      },
      invalidatesTags: ['POSShift'],
    }),
  }),
});

export const {
  useGetPOSOrdersQuery,
  useCreatePOSOrderMutation,
  useUpdatePOSOrderStatusMutation,
  useGetCurrentShiftQuery,
  useOpenShiftMutation,
  useCloseShiftMutation,
} = posApi;
