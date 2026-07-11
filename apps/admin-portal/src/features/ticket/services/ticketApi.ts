import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Ticket, TicketFilters, TicketListResponse, ScanRequest, ScanResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const ticketApi = createApi({
  reducerPath: 'ticketApi',
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
  tagTypes: ['Ticket'],
  endpoints: (builder) => ({
    getTickets: builder.query<TicketListResponse, TicketFilters>({
      query: (params) => ({
        url: '/tickets',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Ticket' as const, id })),
              { type: 'Ticket', id: 'LIST' },
            ]
          : [{ type: 'Ticket', id: 'LIST' }],
    }),
    getTicketById: builder.query<Ticket, number>({
      query: (id) => `/tickets/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Ticket', id }],
    }),
    checkInScan: builder.mutation<ScanResponse, ScanRequest>({
      query: (body) => ({
        url: '/check-in/scan',
        method: 'POST',
        body,
      }),
      invalidatesTags: () => [
        { type: 'Ticket', id: 'LIST' },
      ],
    }),
    updateTicketStatus: builder.mutation<Ticket, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/tickets/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCheckInScanMutation,
  useUpdateTicketStatusMutation,
} = ticketApi;
