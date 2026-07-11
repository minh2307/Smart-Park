import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Customer, CustomerFilters, CustomerListResponse, CustomerActivityLog } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const customerApi = createApi({
  reducerPath: 'customerApi',
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
  tagTypes: ['Customer', 'CustomerActivity'],
  endpoints: (builder) => ({
    getCustomers: builder.query<CustomerListResponse, CustomerFilters>({
      query: (params) => ({
        url: '/customers',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Customer' as const, id })),
              { type: 'Customer', id: 'LIST' },
            ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),
    getCustomerById: builder.query<Customer, number>({
      query: (id) => `/customers/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Customer', id }],
    }),
    createCustomer: builder.mutation<Customer, Partial<Customer>>({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
    updateCustomer: builder.mutation<Customer, { id: number; body: Partial<Customer> }>({
      query: ({ id, body }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
    deleteCustomer: builder.mutation<void, number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
    getCustomerActivities: builder.query<CustomerActivityLog[], number>({
      query: (id) => `/customers/${id}/activities`,
      providesTags: (_result, _error, id) => [{ type: 'CustomerActivity', id }],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerActivitiesQuery,
} = customerApi;

// --- FALLBACK MOCK DATA FOR OFFLINE / BACKEND FALLBACKS ---
export const mockMembershipTiers = [
  { id: 1, name: 'Bronze', code: 'BRONZE', discountPercentage: 0, pointsMultiplier: 1.0, minSpend: 0 },
  { id: 2, name: 'Silver', code: 'SILVER', discountPercentage: 5, pointsMultiplier: 1.15, minSpend: 500 },
  { id: 3, name: 'Gold', code: 'GOLD', discountPercentage: 10, pointsMultiplier: 1.3, minSpend: 1500 },
  { id: 4, name: 'Platinum', code: 'PLATINUM', discountPercentage: 15, pointsMultiplier: 1.5, minSpend: 4000 },
];

export const mockCustomers: Customer[] = [
  {
    id: 1,
    fullName: 'Emily Davis',
    email: 'emily.davis@gmail.com',
    phone: '+1 415-555-2671',
    birthDate: '1992-04-12',
    gender: 'FEMALE',
    address: '456 Market St, San Francisco, CA',
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-07-01T10:15:00Z',
    membership: {
      id: 101,
      membershipCode: 'MEM-EMILY-7829',
      points: 1250,
      joinDate: '2026-01-15',
      expirationDate: '2027-01-15',
      status: 'ACTIVE',
      tier: mockMembershipTiers[2], // Gold
    },
    stats: {
      totalOrders: 12,
      totalTickets: 28,
      totalSpending: 1650.00,
    },
  },
  {
    id: 2,
    fullName: 'Liam Nguyen',
    email: 'liam.nguyen@yahoo.com',
    phone: '+84 908-123-456',
    birthDate: '1988-11-23',
    gender: 'MALE',
    address: '78 Nguyen Hue, District 1, HCMC',
    status: 'ACTIVE',
    createdAt: '2026-02-10T14:22:00Z',
    updatedAt: '2026-06-28T09:40:00Z',
    membership: {
      id: 102,
      membershipCode: 'MEM-LIAM-9081',
      points: 4200,
      joinDate: '2026-02-10',
      status: 'ACTIVE',
      tier: mockMembershipTiers[3], // Platinum
    },
    stats: {
      totalOrders: 24,
      totalTickets: 64,
      totalSpending: 4120.50,
    },
  },
  {
    id: 3,
    fullName: 'Sophia Martinez',
    email: 'sophia.m@outlook.com',
    phone: '+1 212-555-8930',
    birthDate: '1995-07-08',
    gender: 'FEMALE',
    address: '128 Broadway, New York, NY',
    status: 'SUSPENDED',
    createdAt: '2026-03-05T09:15:00Z',
    updatedAt: '2026-07-05T16:30:00Z',
    membership: {
      id: 103,
      membershipCode: 'MEM-SOPHIA-1212',
      points: 120,
      joinDate: '2026-03-05',
      expirationDate: '2026-09-05',
      status: 'ACTIVE',
      tier: mockMembershipTiers[0], // Bronze
    },
    stats: {
      totalOrders: 2,
      totalTickets: 4,
      totalSpending: 180.00,
    },
  },
  {
    id: 4,
    fullName: 'Marcus Aurelius',
    email: 'marcus.aurelius@philosophy.org',
    phone: '+39 06-555-1234',
    birthDate: '1980-04-26',
    gender: 'MALE',
    address: 'Piazza Venezia, Rome, Italy',
    status: 'ACTIVE',
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-07-02T11:00:00Z',
    membership: {
      id: 104,
      membershipCode: 'MEM-MARCUS-0426',
      points: 850,
      joinDate: '2026-04-01',
      expirationDate: '2027-04-01',
      status: 'ACTIVE',
      tier: mockMembershipTiers[1], // Silver
    },
    stats: {
      totalOrders: 6,
      totalTickets: 12,
      totalSpending: 890.00,
    },
  },
];

export const mockCustomerActivities: Record<number, CustomerActivityLog[]> = {
  1: [
    { id: 1, action: 'CREATE', description: 'Registered customer account via Admin Panel', ipAddress: '192.168.1.15', createdAt: '2026-01-15T08:30:00Z' },
    { id: 2, action: 'UPDATE', description: 'Assigned to Gold Membership Tier', ipAddress: '192.168.1.15', createdAt: '2026-01-15T08:45:00Z' },
    { id: 3, action: 'TRANSACTION', description: 'Created Booking BK-0001 (Amount: $120.00)', ipAddress: '12.45.67.89', createdAt: '2026-02-14T10:30:00Z' },
    { id: 4, action: 'UPDATE', description: 'Updated contact address information', ipAddress: '192.168.1.18', createdAt: '2026-07-01T10:15:00Z' },
  ],
  2: [
    { id: 1, action: 'CREATE', description: 'Self-registered account via Web Portal', ipAddress: '115.78.162.2', createdAt: '2026-02-10T14:22:00Z' },
    { id: 2, action: 'TRANSACTION', description: 'Created Booking BK-0002 (Amount: $950.00)', ipAddress: '115.78.162.2', createdAt: '2026-02-10T15:00:00Z' },
    { id: 3, action: 'UPDATE', description: 'Upgraded to Platinum Membership Tier', ipAddress: 'system', createdAt: '2026-06-28T09:40:00Z' },
  ],
  3: [
    { id: 1, action: 'CREATE', description: 'Registered customer account via Admin Panel', ipAddress: '192.168.1.15', createdAt: '2026-03-05T09:15:00Z' },
    { id: 2, action: 'UPDATE', description: 'Account SUSPENDED due to chargeback dispute', ipAddress: '192.168.1.10', createdAt: '2026-07-05T16:30:00Z' },
  ],
  4: [
    { id: 1, action: 'CREATE', description: 'Registered customer account via Admin Panel', ipAddress: '192.168.1.15', createdAt: '2026-04-01T10:00:00Z' },
  ]
};
