import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Ride, RideFilters, RideListResponse, RideSchedule, RideMaintenance } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const rideApi = createApi({
  reducerPath: 'rideApi',
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
  tagTypes: ['Ride', 'RideSchedule', 'RideMaintenance'],
  endpoints: (builder) => ({
    getRides: builder.query<RideListResponse, RideFilters>({
      query: (params) => ({
        url: '/rides',
        method: 'GET',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Ride' as const, id })),
              { type: 'Ride', id: 'LIST' },
            ]
          : [{ type: 'Ride', id: 'LIST' }],
    }),
    getRideById: builder.query<Ride, number>({
      query: (id) => `/rides/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Ride', id }],
    }),
    createRide: builder.mutation<Ride, Partial<Ride>>({
      query: (body) => ({
        url: '/rides',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Ride', id: 'LIST' }],
    }),
    updateRide: builder.mutation<Ride, { id: number; body: Partial<Ride> }>({
      query: ({ id, body }) => ({
        url: `/rides/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ride', id },
        { type: 'Ride', id: 'LIST' },
      ],
    }),
    deleteRide: builder.mutation<void, number>({
      query: (id) => ({
        url: `/rides/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Ride', id: 'LIST' }],
    }),
    getRideSchedules: builder.query<RideSchedule[], number>({
      query: (rideId) => `/rides/${rideId}/schedules`,
      providesTags: (_result, _error, rideId) => [{ type: 'RideSchedule', id: rideId }],
    }),
    getRideMaintenances: builder.query<RideMaintenance[], number>({
      query: (rideId) => `/rides/${rideId}/maintenances`,
      providesTags: (_result, _error, rideId) => [{ type: 'RideMaintenance', id: rideId }],
    }),
    addRideMaintenance: builder.mutation<RideMaintenance, { rideId: number; body: Partial<RideMaintenance> }>({
      query: ({ rideId, body }) => ({
        url: `/rides/${rideId}/maintenances`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { rideId }) => [
        { type: 'Ride', id: rideId },
        { type: 'RideMaintenance', id: rideId },
      ],
    }),
  }),
});

export const {
  useGetRidesQuery,
  useGetRideByIdQuery,
  useCreateRideMutation,
  useUpdateRideMutation,
  useDeleteRideMutation,
  useGetRideSchedulesQuery,
  useGetRideMaintenancesQuery,
  useAddRideMaintenanceMutation,
} = rideApi;

// --- FALLBACK MOCK DATA FOR OFFLINE DEVELOPMENT ---
export const mockRides: Ride[] = [
  {
    id: 1,
    name: 'Cosmic Nebula Coaster',
    code: 'RD-NEBULA',
    description: 'An indoor multi-launch roller coaster carrying passengers through a simulated supernova explosion with projection domes.',
    capacity: 1200,
    durationSeconds: 145,
    status: 'OPERATING',
    venueId: 1,
    venueName: 'Smart Park East Wing',
    zoneId: 1,
    zoneName: 'Space Zone A',
    rideCategoryId: 1,
    categoryName: 'Roller Coasters',
    queueTimeMinutes: 45,
    popularityScore: 94,
    revenueContribution: 12450.00,
    images: [
      'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    coverImage: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
    restrictions: {
      minHeight: 120,
      maxHeight: 195,
      minAge: 10,
      maxAge: 70,
      healthWarning: true,
      pregnancyRestriction: true,
      accessibilityFriendly: false,
      safetyNotes: 'Secure all loose items. Not recommended for guests with high blood pressure, heart issues, or back problems.',
    },
    operatingHours: {
      open: '09:00',
      close: '21:00',
    },
    lastMaintenanceDate: '2026-06-30',
    nextMaintenanceDate: '2026-07-15',
    assignedTechnician: 'Alex Mercer',
    maintenanceStatus: 'SCHEDULED',
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-07-01T15:00:00Z',
  },
  {
    id: 2,
    name: 'Tsunami River Rapids',
    code: 'RD-TSUNAMI',
    description: 'A wild white-water adventure on 8-passenger circular rafts through cascading waterfalls and canyon runs.',
    capacity: 900,
    durationSeconds: 240,
    status: 'OPERATING',
    venueId: 2,
    venueName: 'Water World Pavilion',
    zoneId: 2,
    zoneName: 'Tropical Paradise',
    rideCategoryId: 2,
    categoryName: 'Water Rides',
    queueTimeMinutes: 15,
    popularityScore: 78,
    revenueContribution: 8400.00,
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'
    ],
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    restrictions: {
      minHeight: 105,
      minAge: 6,
      healthWarning: false,
      pregnancyRestriction: true,
      accessibilityFriendly: true,
      safetyNotes: 'You will get wet—potentially soaked. Ponchos are available for purchase. Guests must be able to sit upright independently.',
    },
    operatingHours: {
      open: '10:00',
      close: '18:00',
    },
    lastMaintenanceDate: '2026-07-02',
    nextMaintenanceDate: '2026-07-20',
    assignedTechnician: 'Sarah Connor',
    maintenanceStatus: 'SCHEDULED',
    createdAt: '2026-02-15T09:30:00Z',
    updatedAt: '2026-07-02T18:00:00Z',
  },
  {
    id: 3,
    name: 'Skyline Drop Tower',
    code: 'RD-SKYDROP',
    description: 'An extreme freefall ride lifting riders 100 meters in the air before releasing them into a pure gravity plunge.',
    capacity: 480,
    durationSeconds: 90,
    status: 'MAINTENANCE',
    venueId: 1,
    venueName: 'Smart Park East Wing',
    zoneId: 3,
    zoneName: 'Adrenaline Plaza',
    rideCategoryId: 5,
    categoryName: 'Extreme Thrill Drops',
    queueTimeMinutes: 0,
    popularityScore: 89,
    revenueContribution: 11200.00,
    images: [
      'https://images.unsplash.com/photo-1564750537905-213782435d08?auto=format&fit=crop&w=800&q=80'
    ],
    coverImage: 'https://images.unsplash.com/photo-1564750537905-213782435d08?auto=format&fit=crop&w=800&q=80',
    restrictions: {
      minHeight: 135,
      maxHeight: 198,
      minAge: 12,
      minWeight: 45,
      maxWeight: 115,
      healthWarning: true,
      pregnancyRestriction: true,
      accessibilityFriendly: false,
      safetyNotes: 'Harness locks are mandatory. Strictly prohibited for individuals with spine problems or vestibular conditions.',
    },
    operatingHours: {
      open: '09:00',
      close: '21:00',
    },
    lastMaintenanceDate: '2026-07-08',
    nextMaintenanceDate: '2026-07-10',
    assignedTechnician: 'Marcus Wright',
    maintenanceStatus: 'IN_PROGRESS',
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-07-08T08:30:00Z',
  },
  {
    id: 4,
    name: 'Fairytale Carousel',
    code: 'RD-CAROUSEL',
    description: 'A classic double-decker hand-painted wooden carousel featuring 48 jumping horses and decorative chariots.',
    capacity: 600,
    durationSeconds: 180,
    status: 'OPERATING',
    venueId: 1,
    venueName: 'Smart Park East Wing',
    zoneId: 4,
    zoneName: 'Fantasy Meadow',
    rideCategoryId: 3,
    categoryName: 'Family & Carousel Rides',
    queueTimeMinutes: 5,
    popularityScore: 65,
    revenueContribution: 4200.00,
    images: [
      'https://images.unsplash.com/photo-1572621426441-697728280a5c?auto=format&fit=crop&w=800&q=80'
    ],
    coverImage: 'https://images.unsplash.com/photo-1572621426441-697728280a5c?auto=format&fit=crop&w=800&q=80',
    restrictions: {
      accessibilityFriendly: true,
      safetyNotes: 'Children under 105cm must be accompanied by a supervising adult. Chariots are wheelchair accessible.',
    },
    operatingHours: {
      open: '09:00',
      close: '20:00',
    },
    lastMaintenanceDate: '2026-06-25',
    nextMaintenanceDate: '2026-07-25',
    assignedTechnician: 'Sarah Connor',
    maintenanceStatus: 'SCHEDULED',
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-06-25T11:00:00Z',
  },
  {
    id: 5,
    name: 'Cyberverse VR Flight',
    code: 'RD-CYBERVR',
    description: 'A simulator ride putting riders in a suspended glider pod while wearing high-definition virtual reality headsets.',
    capacity: 320,
    durationSeconds: 300,
    status: 'CLOSED',
    venueId: 1,
    venueName: 'Smart Park East Wing',
    zoneId: 5,
    zoneName: 'Cyber Metropolis',
    rideCategoryId: 4,
    categoryName: 'Dark & Virtual Reality Rides',
    queueTimeMinutes: 0,
    popularityScore: 82,
    revenueContribution: 9150.00,
    images: [
      'https://images.unsplash.com/photo-1478479405421-ce83f92fa7bd?auto=format&fit=crop&w=800&q=80'
    ],
    coverImage: 'https://images.unsplash.com/photo-1478479405421-ce83f92fa7bd?auto=format&fit=crop&w=800&q=80',
    restrictions: {
      minHeight: 110,
      minAge: 7,
      healthWarning: true,
      safetyNotes: 'VR headsets may cause motion sickness or vertigo. Staff can disable the VR view for standard dome projection mode.',
    },
    operatingHours: {
      open: '09:30',
      close: '20:30',
    },
    lastMaintenanceDate: '2026-07-01',
    nextMaintenanceDate: '2026-07-09',
    assignedTechnician: 'Alex Mercer',
    maintenanceStatus: 'OVERDUE',
    createdAt: '2026-04-12T13:00:00Z',
    updatedAt: '2026-07-01T17:30:00Z',
  }
];

export const mockRideSchedules: Record<number, RideSchedule[]> = {
  1: [
    { id: 1, shiftDate: '2026-07-09', startTime: '08:30:00', endTime: '15:00:00', operatorName: 'John Operator', status: 'ACTIVE' },
    { id: 2, shiftDate: '2026-07-09', startTime: '15:00:00', endTime: '21:30:00', operatorName: 'Jane Controller', status: 'ACTIVE' }
  ]
};

export const mockRideMaintenances: Record<number, RideMaintenance[]> = {
  1: [
    { id: 1, technicianName: 'Alex Mercer', scheduledDate: '2026-06-30', completionDate: '2026-06-30', status: 'COMPLETED', description: 'Monthly launch cable tension check and magnetic brake calibration.', cost: 850.00, notes: 'Brake pads within normal wear limits. Tension adjusted by +2%.' },
    { id: 2, technicianName: 'Alex Mercer', scheduledDate: '2026-07-15', status: 'SCHEDULED', description: 'Bi-weekly sensor diagnostic scan and track alignment sweep.' }
  ],
  3: [
    { id: 3, technicianName: 'Marcus Wright', scheduledDate: '2026-07-08', status: 'IN_PROGRESS', description: 'Emergency hydraulic actuator leak inspection and fluid exchange.', cost: 1200.00, notes: 'Replacement seal kit ordered. Secondary safety valve holds normal pressure.' }
  ]
};
