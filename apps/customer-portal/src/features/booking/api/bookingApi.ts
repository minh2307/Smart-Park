import { baseApi } from '../../../store/api/baseApi';
import type { BookingRequest, Booking } from '../types/booking.types';

export interface PaymentRequest {
  orderCode: string;
  paymentMethodCode: string; // VNPAY, MOMO
}

export interface PaymentResponse {
  paymentUrl: string;
}

export interface CouponValidationParams {
  code: string;
  customerId: number;
  orderTotal: number;
}

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation<Booking, BookingRequest>({
      query: (bookingReq) => ({
        url: '/bookings',
        method: 'POST',
        data: bookingReq,
      }),
      transformResponse: (response: any) => response.data,
    }),

    validateCoupon: builder.query<number, CouponValidationParams>({
      query: ({ code, customerId, orderTotal }) => ({
        url: '/promotions/validate',
        method: 'GET',
        params: { code, customerId, orderTotal },
      }),
      transformResponse: (response: any) => response.data ?? 0,
    }),

    getBookingDetails: builder.query<Booking, number>({
      query: (id) => ({
        url: `/bookings/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
    }),

    getBookingByCode: builder.query<Booking, string>({
      query: (code) => ({
        url: `/bookings/code/${code}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
    }),

    getBookingHistory: builder.query<Booking[], number>({
      query: (customerId) => ({
        url: `/bookings/history/${customerId}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data?.content ?? response.data ?? [],
    }),

    getMemberships: builder.query<any[], void>({
      query: () => ({
        url: '/memberships',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data?.content ?? response.data ?? [],
    }),

    createPayment: builder.mutation<PaymentResponse, PaymentRequest>({
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
  useCreateBookingMutation,
  useLazyValidateCouponQuery,
  useGetBookingDetailsQuery,
  useGetBookingByCodeQuery,
  useGetBookingHistoryQuery,
  useGetMembershipsQuery,
  useCreatePaymentMutation,
} = bookingApi;
