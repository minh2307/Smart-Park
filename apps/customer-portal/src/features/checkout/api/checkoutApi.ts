import { baseApi } from '../../../store/api/baseApi';
import type { PaymentMethod, PaymentRequest, PaymentResponse } from '../types/checkout.types';

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => ({
        url: '/payments/methods',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data ?? [],
    }),

    createPaymentSession: builder.mutation<PaymentResponse, PaymentRequest>({
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
  useGetPaymentMethodsQuery,
  useCreatePaymentSessionMutation,
} = checkoutApi;
