import { baseApi } from '../../../store/api/baseApi';
import type { TicketType, Venue, Attraction } from '../types/ticket.types';

export const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVenues: builder.query<Venue[], void>({
      query: () => ({
        url: '/venues',
        params: { status: 1, size: 100 },
      }),
      transformResponse: (response: any) => response.data?.content ?? response.data ?? [],
      providesTags: ['Venues'],
    }),

    getVenueTicketTypes: builder.query<TicketType[], number>({
      query: (venueId) => ({
        url: `/venues/${venueId}/ticket-types`,
      }),
      transformResponse: (response: any) => response.data ?? [],
    }),

    getVenueAttractions: builder.query<Attraction[], number>({
      query: (venueId) => ({
        url: `/venues/${venueId}/attractions`,
      }),
      transformResponse: (response: any) => response.data ?? [],
      providesTags: ['Attractions'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetVenuesQuery,
  useGetVenueTicketTypesQuery,
  useGetVenueAttractionsQuery,
} = ticketApi;
