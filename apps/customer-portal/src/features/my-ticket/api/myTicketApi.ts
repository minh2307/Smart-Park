import { baseApi } from '../../../store/api/baseApi';
import type { Ticket } from '../types/my-ticket.types';
import type { Booking } from '../../booking/types/booking.types';

export interface PaginatedTickets {
  content: Ticket[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const myTicketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerTickets: builder.query<
      PaginatedTickets,
      { customerId: number; page?: number; size?: number }
    >({
      query: ({ customerId, page = 0, size = 10 }) => ({
        url: `/tickets/customer/${customerId}`,
        method: 'GET',
        params: { page, size, sort: 'createdAt,desc' },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Tickets' as const, id })),
              { type: 'Tickets' as const, id: 'LIST' },
            ]
          : [{ type: 'Tickets' as const, id: 'LIST' }],
    }),

    getTicketById: builder.query<Ticket, number>({
      query: (id) => ({
        url: `/tickets/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, id) => [{ type: 'Tickets' as const, id }],
    }),

    getTicketByCode: builder.query<Ticket, string>({
      query: (code) => ({
        url: `/tickets/code/${code}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result) => (result ? [{ type: 'Tickets' as const, id: result.id }] : []),
    }),

    cancelBookingFromTicket: builder.mutation<Booking, { code: string; reason?: string }>({
      query: ({ code, reason = 'User requested cancellation' }) => ({
        url: `/bookings/${code}/cancel`,
        method: 'PUT',
        params: { reason },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { code }) => [
        { type: 'Tickets' as const, id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCustomerTicketsQuery,
  useGetTicketByIdQuery,
  useGetTicketByCodeQuery,
  useCancelBookingFromTicketMutation,
} = myTicketApi;
