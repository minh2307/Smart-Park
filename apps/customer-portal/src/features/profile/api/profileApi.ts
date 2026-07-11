import { baseApi } from '../../../store/api/baseApi';
import type { CustomerProfile } from '../types/profile.types';
import type { User } from '@shared/types';

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword?: string;
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomersList: builder.query<any, { page: number; size: number }>({
      query: ({ page, size }) => ({
        url: '/customers',
        method: 'GET',
        params: { page, size },
      }),
      providesTags: ['Customers' as any],
    }),

    getCustomerById: builder.query<CustomerProfile, number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Customer' as any, id }],
      transformResponse: (response: any) => response.data,
    }),

    updateCustomer: builder.mutation<CustomerProfile, { id: number; data: Partial<CustomerProfile> }>({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Customer' as any, id },
        'Customers' as any,
      ],
      transformResponse: (response: any) => response.data,
    }),

    deleteCustomerAccount: builder.mutation<string, number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customers' as any],
      transformResponse: (response: any) => response.data,
    }),

    changePassword: builder.mutation<void, ChangePasswordPayload>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        data,
      }),
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCustomersListQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerAccountMutation,
  useChangePasswordMutation,
  useGetCurrentUserQuery,
} = profileApi;
