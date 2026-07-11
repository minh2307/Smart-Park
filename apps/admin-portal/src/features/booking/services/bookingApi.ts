import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import {
  Booking,
  BookingFilters,
  BookingListResponse,
  OrderRequest,
  PaymentCreateRequest,
  PaymentCreateResponse,
  PaymentStatusResponse,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
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
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    getBookings: builder.query<BookingListResponse, BookingFilters>({
      query: (params) => ({
        url: '/orders',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Booking' as const, id })),
              { type: 'Booking', id: 'LIST' },
            ]
          : [{ type: 'Booking', id: 'LIST' }],
    }),
    getBookingById: builder.query<Booking, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Booking', id }],
    }),
    createBooking: builder.mutation<Booking, { body: OrderRequest; idempotencyKey: string }>({
      query: ({ body, idempotencyKey }) => ({
        url: '/orders',
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body,
      }),
      invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
    }),
    cancelBooking: builder.mutation<void, number>({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST' },
      ],
    }),
    createPaymentLink: builder.mutation<PaymentCreateResponse, PaymentCreateRequest>({
      query: (body) => ({
        url: '/payments/create',
        method: 'POST',
        body,
      }),
    }),
    getPaymentStatus: builder.query<PaymentStatusResponse, number>({
      query: (orderId) => `/payments/status/${orderId}`,
    }),
    getVenueTicketTypes: builder.query<any[], number>({
      query: (venueId) => `/venues/${venueId}/ticket-types`,
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
  useCreatePaymentLinkMutation,
  useGetPaymentStatusQuery,
  useGetVenueTicketTypesQuery,
} = bookingApi;

export const mockBookings: Booking[] = [
  {
    id: 1,
    customerId: 1,
    venueId: 1,
    totalAmount: 45.00,
    paymentMethod: 'CHUYEN_KHOAN_QR',
    status: 1,
    createdAt: '2026-07-09T08:15:30Z',
    customer: { id: 1, fullName: 'John Doe', email: 'john.doe@gmail.com', phone: '+123456789' },
    venue: { id: 1, name: 'Smart Park East Wing' },
    items: [{ ticketTypeId: 1, quantity: 1, ticketType: { id: 1, name: 'General Admission', price: 45.00 } }],
    tickets: [{ id: 1, ticketCode: 'TKT-7829-109', status: 'SOLD', validDate: '2026-12-31', createdAt: '2026-07-09T08:15:30Z', maxUses: 1, remainingUses: 1, usageCount: 0 }]
  },
  {
    id: 2,
    customerId: 2,
    venueId: 1,
    totalAmount: 95.00,
    paymentMethod: 'TIEN_MAT',
    status: 0,
    createdAt: '2026-07-09T10:00:00Z',
    customer: { id: 2, fullName: 'Jane Smith', email: 'jane.smith@yahoo.com', phone: '+987654321' },
    venue: { id: 1, name: 'Smart Park East Wing' },
    items: [{ ticketTypeId: 2, quantity: 1, ticketType: { id: 2, name: 'VIP Fast Pass', price: 95.00 } }],
  },
  {
    id: 3,
    customerId: 3,
    venueId: 2,
    totalAmount: 160.00,
    paymentMethod: 'CHUYEN_KHOAN_QR',
    status: 2,
    createdAt: '2026-07-08T14:22:15Z',
    customer: { id: 3, fullName: 'Robert Johnson', email: 'robert.j@outlook.com', phone: '+447911123' },
    venue: { id: 2, name: 'Water World Pavilion' },
    items: [{ ticketTypeId: 3, quantity: 2, ticketType: { id: 3, name: 'Two-Day Combo Pass', price: 80.00 } }],
  }
];

