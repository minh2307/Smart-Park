import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { LoginResponse, User } from '../types';
import { LoginInput } from '../schemas/loginSchema';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      // Prioritize localStorage token so that newly saved tokens during the login flow are used immediately
      const token = localStorage.getItem('accessToken') || (getState() as any).auth.accessToken;
      console.log('[DEBUG] prepareHeaders - Token read:', token);
      if (token && token !== 'mocked-token-for-preview') {
        headers.set('Authorization', `Bearer ${token}`);
      } else {
        console.warn('[DEBUG] prepareHeaders - No token set or using mocked token');
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginInput>({
      query: (credentials) => {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
          deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
          localStorage.setItem('deviceId', deviceId);
        }
        return {
          url: '/auth/login',
          method: 'POST',
          body: {
            username: credentials.username,
            password: credentials.password,
            deviceId,
          },
        };
      },
    }),
    logout: builder.mutation<void, { refreshToken: string }>({
      query: (body) => {
        const deviceId = localStorage.getItem('deviceId') || 'web-browser';
        return {
          url: '/auth/logout',
          method: 'POST',
          headers: {
            'Device-Id': deviceId,
          },
          body,
        };
      },
    }),
    refreshToken: builder.mutation<LoginResponse, { refreshToken: string }>({
      query: (body) => {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
          deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
          localStorage.setItem('deviceId', deviceId);
        }
        return {
          url: '/auth/refresh-token',
          method: 'POST',
          body: {
            refreshToken: body.refreshToken,
            deviceId,
          },
        };
      },
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
    }),
    changePassword: builder.mutation<void, any>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),
    updateProfile: builder.mutation<User, any>({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  useChangePasswordMutation,
  useUpdateProfileMutation,
} = authApi;
