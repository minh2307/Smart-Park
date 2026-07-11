import { fetchBaseQuery as originalFetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiResponse } from '../types/api';

export const fetchBaseQuery: typeof originalFetchBaseQuery = (options) => {
  const baseQuery = originalFetchBaseQuery(options);
  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    if (result.data && typeof result.data === 'object' && 'data' in result.data) {
      return {
        ...result,
        data: (result.data as ApiResponse<unknown>).data,
      };
    }
    return result;
  };
};
