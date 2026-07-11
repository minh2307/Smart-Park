import { baseApi } from '../../../store/api/baseApi';

interface LoginRequest {
  username: string;
  password: string;
  deviceId: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
}

interface UserResponse {
  id: number;
  username: string;
  email: string;
  status: string;
  role: string;
  fullName: string;
  avatarUrl: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<TokenResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: any) => response.data,
    }),

    register: builder.mutation<UserResponse, RegisterRequest>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        data: body,
      }),
      transformResponse: (response: any) => response.data,
    }),

    getMe: builder.query<UserResponse, void>({
      query: () => ({ url: '/auth/me' }),
      transformResponse: (response: any) => response.data,
    }),
  }),
  overrideExisting: true,
});

export const { useLoginMutation, useRegisterMutation, useGetMeQuery } = authApi;
