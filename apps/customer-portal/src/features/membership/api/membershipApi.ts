import { baseApi } from '../../../store/api/baseApi';
import type { Membership, PointHistory, Coupon } from '../types/membership.types';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const membershipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMemberships: builder.query<PaginatedResponse<Membership>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 100 } = {}) => ({
        url: '/memberships',
        method: 'GET',
        params: { page, size },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ['Memberships' as any],
    }),

    getMembershipById: builder.query<Membership, number>({
      query: (id) => ({
        url: `/memberships/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, id) => [{ type: 'Memberships' as any, id }],
    }),

    getMembershipHistory: builder.query<PointHistory[], number>({
      query: (id) => ({
        url: `/memberships/${id}/history`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data ?? [],
      providesTags: (result, error, id) => [{ type: 'Memberships' as any, id: `${id}-history` }],
    }),

    updateMembershipTier: builder.mutation<Membership, { id: number; tierId: number }>({
      query: ({ id, tierId }) => ({
        url: `/memberships/${id}/tier`,
        method: 'PATCH',
        params: { tierId },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Memberships' as any, id },
        'Memberships' as any,
      ],
    }),

    getCoupons: builder.query<PaginatedResponse<Coupon>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 100 } = {}) => ({
        url: '/promotions/coupons',
        method: 'GET',
        params: { page, size },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ['Coupons' as any],
    }),

    getPromotions: builder.query<any, { page?: number; size?: number }>({
      query: ({ page = 0, size = 100 } = {}) => ({
        url: '/promotions',
        method: 'GET',
        params: { page, size },
      }),
      transformResponse: (response: any) => response.data,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetMembershipsQuery,
  useGetMembershipByIdQuery,
  useGetMembershipHistoryQuery,
  useUpdateMembershipTierMutation,
  useGetCouponsQuery,
  useGetPromotionsQuery,
} = membershipApi;
