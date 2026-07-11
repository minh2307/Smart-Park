import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Venue, VenueFilters, VenueListResponse } from '../types';
import { VenueInput } from '../schemas/venueSchema';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const venueApi = createApi({
  reducerPath: 'venueApi',
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
  tagTypes: ['Venue'],
  endpoints: (builder) => ({
    getVenues: builder.query<VenueListResponse, VenueFilters>({
      query: (params) => {
        let backendStatus: number | undefined;
        if (params.status === 'ACTIVE') backendStatus = 1;
        if (params.status === 'INACTIVE') backendStatus = 0;

        return {
          url: '/venues',
          method: 'GET',
          params: {
            page: params.page,
            size: params.size,
            status: backendStatus,
            search: params.search,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Venue' as const, id })),
              { type: 'Venue', id: 'LIST' },
            ]
          : [{ type: 'Venue', id: 'LIST' }],
    }),
    getVenueById: builder.query<Venue, number>({
      query: (id) => `/venues/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Venue', id }],
    }),
    createVenue: builder.mutation<Venue, VenueInput>({
      query: (body) => {
        const backendStatus = body.status === 'ACTIVE' ? 1 : 0;
        return {
          url: '/venues',
          method: 'POST',
          body: {
            name: body.name,
            address: body.address,
            status: backendStatus,
          },
        };
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }],
    }),
    updateVenue: builder.mutation<Venue, { id: number; body: VenueInput }>({
      query: ({ id, body }) => {
        const backendStatus = body.status === 'ACTIVE' ? 1 : 0;
        return {
          url: `/venues/${id}`,
          method: 'PUT',
          body: {
            name: body.name,
            address: body.address,
            status: backendStatus,
          },
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Venue', id },
        { type: 'Venue', id: 'LIST' },
      ],
    }),
    deleteVenue: builder.mutation<void, number>({
      query: (id) => ({
        url: `/venues/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetVenuesQuery,
  useGetVenueByIdQuery,
  useCreateVenueMutation,
  useUpdateVenueMutation,
  useDeleteVenueMutation,
} = venueApi;
