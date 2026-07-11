import { baseApi } from '../../../store/api/baseApi';
import type { Order, PaginatedResponse, PaymentMethod, Payment, Refund } from '../types/order.types';

export interface OrderFilters {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaymentRequest {
  orderCode: string;
  paymentMethodCode: string;
}

export interface PaymentResponse {
  paymentUrl: string;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<PaginatedResponse<Order>, OrderFilters>({
      query: ({ page = 0, size = 20, sort = 'createdAt,desc' } = {}) => ({
        url: '/orders',
        method: 'GET',
        params: { page, size, sort },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Tickets' as const, id })), // reuse tickets/orders tags
              { type: 'Tickets' as const, id: 'LIST' },
            ]
          : [{ type: 'Tickets' as const, id: 'LIST' }],
    }),

    getOrderDetails: builder.query<Order, number>({
      query: (id) => ({
        url: `/orders/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, id) => [{ type: 'Tickets' as const, id }],
    }),

    getOrderByCode: builder.query<Order, string>({
      query: (code) => ({
        url: `/orders/code/${code}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result) => (result ? [{ type: 'Tickets' as const, id: result.id }] : []),
    }),

    cancelOrder: builder.mutation<Order, string>({
      query: (code) => ({
        url: `/orders/code/${code}/cancel`,
        method: 'POST',
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, code) => [
        { type: 'Tickets' as const, id: 'LIST' },
      ],
    }),

    cancelBooking: builder.mutation<any, { code: string; reason?: string }>({
      query: ({ code, reason = 'User requested cancellation' }) => ({
        url: `/bookings/${code}/cancel`,
        method: 'PUT',
        params: { reason },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error) => [{ type: 'Tickets' as const, id: 'LIST' }],
    }),

    requestRefund: builder.mutation<Refund, { paymentId: number; reason: string }>({
      query: ({ paymentId, reason }) => ({
        url: `/payments/${paymentId}/refunds`,
        method: 'POST',
        params: { reason }, // reason is a RequestParam on the backend
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { paymentId }) => [
        { type: 'Tickets' as const, id: 'LIST' },
      ],
    }),

    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => ({
        url: '/payments/methods',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data ?? [],
    }),

    retryPayment: builder.mutation<PaymentResponse, PaymentRequest>({
      query: (paymentReq) => ({
        url: '/payments/create',
        method: 'POST',
        data: paymentReq,
      }),
      transformResponse: (response: any) => response.data,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetOrdersQuery,
  useGetOrderDetailsQuery,
  useGetOrderByCodeQuery,
  useCancelOrderMutation,
  useCancelBookingMutation,
  useRequestRefundMutation,
  useGetPaymentMethodsQuery,
  useRetryPaymentMutation,
} = orderApi;
