import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import {
  Locker,
  LockerStatus,
  LockerFilters,
  LockerListResponse,
  LockerRental,
  LockerRentalFilters,
  LockerRentalListResponse,
  LockerDashboardStats,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockLockers: Locker[] = [
  {
    id: 1,
    zoneId: 1,
    zoneName: 'Khu A - Cổng Vào',
    lockerCode: 'L-A101',
    size: 'SMALL',
    status: 'AVAILABLE',
    location: 'Tủ số 1 - Hàng A',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    zoneId: 1,
    zoneName: 'Khu A - Cổng Vào',
    lockerCode: 'L-A102',
    size: 'MEDIUM',
    status: 'OCCUPIED',
    location: 'Tủ số 2 - Hàng A',
    createdAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 3,
    zoneId: 2,
    zoneName: 'Khu B - Hồ Bơi',
    lockerCode: 'L-B201',
    size: 'LARGE',
    status: 'RESERVED',
    location: 'Tủ số 1 - Hàng B',
    createdAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 4,
    zoneId: 2,
    zoneName: 'Khu B - Hồ Bơi',
    lockerCode: 'L-B202',
    size: 'FAMILY',
    status: 'MAINTENANCE',
    location: 'Tủ số 2 - Hàng B',
    createdAt: '2026-01-04T00:00:00Z',
  },
  {
    id: 5,
    zoneId: 3,
    zoneName: 'Khu VIP - Spa',
    lockerCode: 'L-VIP99',
    size: 'VIP',
    status: 'AVAILABLE',
    location: 'Phòng thay đồ VIP',
    createdAt: '2026-01-05T00:00:00Z',
  },
];

export let mockLockerRentals: LockerRental[] = [
  {
    id: 1,
    lockerId: 2,
    lockerCode: 'L-A102',
    customerId: 1,
    customerName: 'Emily Davis',
    bookingCode: 'BK-112233',
    startTime: '2026-07-09T08:00:00Z',
    depositAmount: 50000,
    status: 'ACTIVE',
  },
  {
    id: 2,
    lockerId: 1,
    lockerCode: 'L-A101',
    customerId: 2,
    customerName: 'Liam Nguyen',
    bookingCode: 'BK-445566',
    startTime: '2026-07-08T09:00:00Z',
    endTime: '2026-07-08T17:00:00Z',
    durationHours: 8,
    amountPaid: 80000,
    depositAmount: 50000,
    status: 'COMPLETED',
  },
];

export const lockerApi = createApi({
  reducerPath: 'lockerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Locker', 'LockerRental', 'LockerDashboard'],
  endpoints: (builder) => ({
    getLockerDashboardStats: builder.query<LockerDashboardStats, void>({
      queryFn: async () => {
        const totalLockers = mockLockers.length;
        const availableCount = mockLockers.filter((l) => l.status === 'AVAILABLE').length;
        const occupiedCount = mockLockers.filter((l) => l.status === 'OCCUPIED').length;
        const reservedCount = mockLockers.filter((l) => l.status === 'RESERVED').length;
        const outOfServiceCount = mockLockers.filter((l) => l.status === 'MAINTENANCE' || l.status === 'OUT_OF_SERVICE').length;

        const totalRevenue = mockLockerRentals.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

        const stats: LockerDashboardStats = {
          totalLockers,
          availableCount,
          occupiedCount,
          reservedCount,
          outOfServiceCount,
          revenue: totalRevenue,
          rentalCount: mockLockerRentals.length,
          usageRate: totalLockers > 0 ? (occupiedCount / totalLockers) * 100 : 0,
        };

        return { data: stats };
      },
      providesTags: ['LockerDashboard'],
    }),

    getLockers: builder.query<LockerListResponse, LockerFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockLockers];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (l) => l.lockerCode.toLowerCase().includes(s) || l.location?.toLowerCase().includes(s)
          );
        }
        if (filters.status) {
          filtered = filtered.filter((l) => l.status === filters.status);
        }
        if (filters.size) {
          filtered = filtered.filter((l) => l.size === filters.size);
        }

        const size = filters.sizeCount || 10;
        const page = filters.page || 0;
        const offset = page * size;
        const content = filtered.slice(offset, offset + size);
        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size);

        return {
          data: {
            content,
            totalElements,
            totalPages,
            size,
            number: page,
          },
        };
      },
      providesTags: ['Locker'],
    }),

    getLockerRentals: builder.query<LockerRentalListResponse, LockerRentalFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockLockerRentals];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (r) => r.customerName.toLowerCase().includes(s) || r.lockerCode.toLowerCase().includes(s)
          );
        }
        if (filters.status) {
          filtered = filtered.filter((r) => r.status === filters.status);
        }

        const size = filters.size || 10;
        const page = filters.page || 0;
        const offset = page * size;
        const content = filtered.slice(offset, offset + size);
        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size);

        return {
          data: {
            content,
            totalElements,
            totalPages,
            size,
            number: page,
          },
        };
      },
      providesTags: ['LockerRental'],
    }),

    createLocker: builder.mutation<Locker, Partial<Locker>>({
      queryFn: async (body) => {
        const newLocker: Locker = {
          id: mockLockers.length + 1,
          zoneId: body.zoneId || 1,
          zoneName: body.zoneId === 2 ? 'Khu B - Hồ Bơi' : 'Khu A - Cổng Vào',
          lockerCode: body.lockerCode || `L-NEW-${Math.floor(100 + Math.random() * 900)}`,
          size: body.size || 'SMALL',
          status: 'AVAILABLE',
          location: body.location,
          createdAt: new Date().toISOString(),
        };
        mockLockers.push(newLocker);
        return { data: newLocker };
      },
      invalidatesTags: ['Locker', 'LockerDashboard'],
    }),

    updateLockerStatus: builder.mutation<Locker, { id: number; status: LockerStatus }>({
      queryFn: async ({ id, status }) => {
        const index = mockLockers.findIndex((l) => l.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        
        mockLockers[index] = { ...mockLockers[index], status };
        return { data: mockLockers[index] };
      },
      invalidatesTags: ['Locker', 'LockerDashboard'],
    }),

    rentLocker: builder.mutation<LockerRental, { lockerId: number; customerName: string; deposit: number }>({
      queryFn: async ({ lockerId, customerName, deposit }) => {
        const lockerIndex = mockLockers.findIndex((l) => l.id === lockerId);
        if (lockerIndex === -1) return { error: { status: 404, statusText: 'Locker Not Found', data: null } };

        mockLockers[lockerIndex] = { ...mockLockers[lockerIndex], status: 'OCCUPIED' };

        const newRental: LockerRental = {
          id: mockLockerRentals.length + 1,
          lockerId,
          lockerCode: mockLockers[lockerIndex].lockerCode,
          customerId: 99, // General guest id
          customerName,
          bookingCode: `BK-L-${Math.floor(100000 + Math.random() * 900000)}`,
          startTime: new Date().toISOString(),
          depositAmount: deposit,
          status: 'ACTIVE',
        };

        mockLockerRentals = [newRental, ...mockLockerRentals];
        return { data: newRental };
      },
      invalidatesTags: ['Locker', 'LockerRental', 'LockerDashboard'],
    }),

    returnLocker: builder.mutation<LockerRental, { rentalId: number; penalty?: number; damageFee?: number }>({
      queryFn: async ({ rentalId, penalty = 0, damageFee = 0 }) => {
        const rentalIndex = mockLockerRentals.findIndex((r) => r.id === rentalId);
        if (rentalIndex === -1) return { error: { status: 404, statusText: 'Rental Not Found', data: null } };

        const updatedRental = {
          ...mockLockerRentals[rentalIndex],
          status: 'COMPLETED' as const,
          endTime: new Date().toISOString(),
          penaltyAmount: penalty + damageFee,
          amountPaid: 50000 + penalty + damageFee,
        };

        mockLockerRentals[rentalIndex] = updatedRental;

        // update locker status back to available
        const lockerIndex = mockLockers.findIndex((l) => l.id === updatedRental.lockerId);
        if (lockerIndex !== -1) {
          mockLockers[lockerIndex] = { ...mockLockers[lockerIndex], status: 'AVAILABLE' };
        }

        return { data: updatedRental };
      },
      invalidatesTags: ['Locker', 'LockerRental', 'LockerDashboard'],
    }),
  }),
});

export const {
  useGetLockerDashboardStatsQuery,
  useGetLockersQuery,
  useGetLockerRentalsQuery,
  useCreateLockerMutation,
  useUpdateLockerStatusMutation,
  useRentLockerMutation,
  useReturnLockerMutation,
} = lockerApi;
