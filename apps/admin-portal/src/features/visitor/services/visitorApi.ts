import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Visitor, VisitorFilters, VisitorListResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const visitorApi = createApi({
  reducerPath: 'visitorApi',
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
  tagTypes: ['Visitor'],
  endpoints: (builder) => ({
    getVisitors: builder.query<VisitorListResponse, VisitorFilters>({
      query: (params) => ({
        url: '/visitors',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Visitor' as const, id })),
              { type: 'Visitor', id: 'LIST' },
            ]
          : [{ type: 'Visitor', id: 'LIST' }],
    }),
    getVisitorById: builder.query<Visitor, number>({
      query: (id) => `/visitors/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Visitor', id }],
    }),
    getVisitorsByCustomerId: builder.query<Visitor[], number>({
      query: (customerId) => `/customers/${customerId}/visitors`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Visitor' as const, id })),
              { type: 'Visitor', id: 'LIST' },
            ]
          : [{ type: 'Visitor', id: 'LIST' }],
    }),
    createVisitor: builder.mutation<Visitor, Partial<Visitor>>({
      query: (body) => ({
        url: '/visitors',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Visitor', id: 'LIST' }],
    }),
    updateVisitor: builder.mutation<Visitor, { id: number; body: Partial<Visitor> }>({
      query: ({ id, body }) => ({
        url: `/visitors/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Visitor', id },
        { type: 'Visitor', id: 'LIST' },
      ],
    }),
    deleteVisitor: builder.mutation<void, number>({
      query: (id) => ({
        url: `/visitors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Visitor', id: 'LIST' }],
    }),
    assignVisitorToBooking: builder.mutation<void, { bookingId: number; visitorIds: number[] }>({
      query: ({ bookingId, visitorIds }) => ({
        url: `/bookings/${bookingId}/assign-visitors`,
        method: 'POST',
        body: { visitorIds },
      }),
      invalidatesTags: [{ type: 'Visitor', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetVisitorsQuery,
  useGetVisitorByIdQuery,
  useGetVisitorsByCustomerIdQuery,
  useCreateVisitorMutation,
  useUpdateVisitorMutation,
  useDeleteVisitorMutation,
  useAssignVisitorToBookingMutation,
} = visitorApi;

// --- FALLBACK MOCK DATA FOR OFFLINE / BACKEND FALLBACKS ---
export const mockVisitors: Visitor[] = [
  {
    id: 1,
    customerId: 1, // Emily Davis
    fullName: 'Billy Davis',
    age: 9,
    gender: 'MALE',
    nationality: 'American',
    identificationNumber: 'CH-9023812',
    relationship: 'CHILD',
    status: 'ACTIVE',
    bookingCount: 4,
    ticketCount: 8,
    emergencyContactName: 'Emily Davis',
    emergencyContactPhone: '+1 415-555-2671',
    medicalNotes: 'Peanut allergy, carries EpiPen',
    createdAt: '2026-01-16T09:00:00Z',
    updatedAt: '2026-01-16T09:00:00Z',
    assignedTickets: [
      { id: 301, ticketCode: 'TKT-BILLY-8821', validDate: '2026-12-31', status: 'UNUSED', ticketType: { name: 'Child Day Pass' } }
    ]
  },
  {
    id: 2,
    customerId: 1, // Emily Davis
    fullName: 'Arthur Davis',
    age: 42,
    gender: 'MALE',
    nationality: 'American',
    identificationNumber: 'PASS-89230198',
    relationship: 'SPOUSE',
    status: 'ACTIVE',
    bookingCount: 8,
    ticketCount: 12,
    emergencyContactName: 'Emily Davis',
    emergencyContactPhone: '+1 415-555-2671',
    medicalNotes: 'No medical conditions reported',
    createdAt: '2026-01-16T09:05:00Z',
    updatedAt: '2026-01-16T09:05:00Z',
    assignedTickets: [
      { id: 302, ticketCode: 'TKT-ARTHUR-0982', validDate: '2026-12-31', status: 'USED', ticketType: { name: 'General Admission' } }
    ]
  },
  {
    id: 3,
    customerId: 2, // Liam Nguyen
    fullName: 'Mai Nguyen',
    age: 32,
    gender: 'FEMALE',
    nationality: 'Vietnamese',
    identificationNumber: 'ID-079188001234',
    relationship: 'SPOUSE',
    status: 'ACTIVE',
    bookingCount: 15,
    ticketCount: 30,
    emergencyContactName: 'Liam Nguyen',
    emergencyContactPhone: '+84 908-123-456',
    medicalNotes: 'Asthma, sensitive to dust',
    createdAt: '2026-02-11T08:00:00Z',
    updatedAt: '2026-02-11T08:00:00Z',
  },
  {
    id: 4,
    customerId: 2, // Liam Nguyen
    fullName: 'Minh Nguyen',
    age: 5,
    gender: 'MALE',
    nationality: 'Vietnamese',
    identificationNumber: 'ID-079203009988',
    relationship: 'CHILD',
    status: 'ACTIVE',
    bookingCount: 10,
    ticketCount: 15,
    emergencyContactName: 'Mai Nguyen',
    emergencyContactPhone: '+84 908-123-456',
    createdAt: '2026-02-11T08:10:00Z',
    updatedAt: '2026-02-11T08:10:00Z',
  },
  {
    id: 5,
    customerId: 3, // Sophia Martinez
    fullName: 'Abuela Martinez',
    age: 72,
    gender: 'FEMALE',
    nationality: 'Mexican',
    identificationNumber: 'PASS-98730128',
    relationship: 'PARENT',
    status: 'ACTIVE',
    bookingCount: 2,
    ticketCount: 4,
    emergencyContactName: 'Sophia Martinez',
    emergencyContactPhone: '+1 212-555-8930',
    medicalNotes: 'Difficulty walking long distances, requires wheelchair accessibility assistance',
    createdAt: '2026-03-06T10:00:00Z',
    updatedAt: '2026-03-06T10:00:00Z',
  }
];
