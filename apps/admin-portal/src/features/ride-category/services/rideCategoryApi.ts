import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { RideCategory, RideCategoryFilters, RideCategoryListResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const rideCategoryApi = createApi({
  reducerPath: 'rideCategoryApi',
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
  tagTypes: ['RideCategory'],
  endpoints: (builder) => ({
    getRideCategories: builder.query<RideCategoryListResponse, RideCategoryFilters>({
      query: (params) => ({
        url: '/ride-categories',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'RideCategory' as const, id })),
              { type: 'RideCategory', id: 'LIST' },
            ]
          : [{ type: 'RideCategory', id: 'LIST' }],
    }),
    getRideCategoryById: builder.query<RideCategory, number>({
      query: (id) => `/ride-categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'RideCategory', id }],
    }),
    createRideCategory: builder.mutation<RideCategory, Partial<RideCategory>>({
      query: (body) => ({
        url: '/ride-categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RideCategory', id: 'LIST' }],
    }),
    updateRideCategory: builder.mutation<RideCategory, { id: number; body: Partial<RideCategory> }>({
      query: ({ id, body }) => ({
        url: `/ride-categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'RideCategory', id },
        { type: 'RideCategory', id: 'LIST' },
      ],
    }),
    deleteRideCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/ride-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RideCategory', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRideCategoriesQuery,
  useGetRideCategoryByIdQuery,
  useCreateRideCategoryMutation,
  useUpdateRideCategoryMutation,
  useDeleteRideCategoryMutation,
} = rideCategoryApi;

// --- FALLBACK MOCK DATA FOR OFFLINE DEVELOPMENT ---
export const mockRideCategories: RideCategory[] = [
  {
    id: 1,
    name: 'Roller Coasters',
    code: 'CAT-COASTER',
    description: 'High-speed track-based rides featuring steep drops, inversions, and intense G-forces.',
    status: 'ACTIVE',
    rideCount: 4,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Water Rides',
    code: 'CAT-WATER',
    description: 'Log flumes, river rapids, and splash zones designed for family entertainment and hot summer days.',
    status: 'ACTIVE',
    rideCount: 2,
    createdAt: '2026-01-12T09:30:00Z',
    updatedAt: '2026-05-20T14:45:00Z',
  },
  {
    id: 3,
    name: 'Family & Carousel Rides',
    code: 'CAT-FAMILY',
    description: 'Gentle, scenic attractions suitable for all ages, including toddlers and seniors.',
    status: 'ACTIVE',
    rideCount: 5,
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-07-01T09:00:00Z',
  },
  {
    id: 4,
    name: 'Dark & Virtual Reality Rides',
    code: 'CAT-DARKVR',
    description: 'Indoor story-driven adventures utilizing motion bases, 3D projections, and interactive shooters.',
    status: 'ACTIVE',
    rideCount: 3,
    createdAt: '2026-02-01T14:00:00Z',
    updatedAt: '2026-02-01T14:00:00Z',
  },
  {
    id: 5,
    name: 'Extreme Thrill Drops',
    code: 'CAT-THRILL',
    description: 'Freefall towers, spin rides, and bungee launches pushing boundaries for adrenaline seekers.',
    status: 'ACTIVE',
    rideCount: 1,
    createdAt: '2026-03-10T10:20:00Z',
    updatedAt: '2026-07-02T16:00:00Z',
  },
];
