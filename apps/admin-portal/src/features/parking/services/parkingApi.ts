import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { ParkingArea, ParkingAreaFilters, ParkingAreaListResponse, ParkingDashboardStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockParkingAreas: ParkingArea[] = [
  {
    id: 1,
    parkId: 1,
    parkName: 'Đầm Sen Cultural Park',
    name: 'Bãi Xe Cổng Chính (Lạc Long Quân)',
    code: 'P-MAIN',
    totalSpaces: 500,
    occupiedSpaces: 310,
    availableSpaces: 190,
    operatingHours: '06:00 - 22:00',
    pricingPolicy: 'Xe máy: 5k, Ô tô: 30k/lượt',
    description: 'Bãi đỗ chính cho khách tham quan khu vui chơi Đầm Sen Khô.',
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 2,
    parkId: 1,
    parkName: 'Đầm Sen Cultural Park',
    name: 'Bãi Xe Cổng Hòa Bình',
    code: 'P-PEACE',
    totalSpaces: 300,
    occupiedSpaces: 120,
    availableSpaces: 180,
    operatingHours: '07:30 - 21:30',
    pricingPolicy: 'Đồng giá 5k/lượt',
    description: 'Khu đỗ phụ khu vực Công viên nước Đầm Sen.',
    status: 'ACTIVE',
    createdAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 3,
    parkId: 2,
    parkName: 'Suối Tiên Theme Park',
    name: 'Bãi Xe VIP Khách Đoàn',
    code: 'P-VIP',
    totalSpaces: 100,
    occupiedSpaces: 85,
    availableSpaces: 15,
    operatingHours: '06:00 - 23:00',
    pricingPolicy: 'Miễn phí VIP Pass, Thường: 50k/lượt',
    description: 'Dành riêng cho khách đặt lịch tour VIP hoặc xe điện đưa đón.',
    status: 'ACTIVE',
    createdAt: '2026-03-01T08:00:00Z',
  },
];

export const parkingApi = createApi({
  reducerPath: 'parkingApi',
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
  tagTypes: ['ParkingArea', 'ParkingDashboard'],
  endpoints: (builder) => ({
    getParkingDashboardStats: builder.query<ParkingDashboardStats, void>({
      queryFn: async () => {
        const totalAreas = mockParkingAreas.length;
        const totalSpaces = mockParkingAreas.reduce((acc, curr) => acc + curr.totalSpaces, 0);
        const occupiedSpaces = mockParkingAreas.reduce((acc, curr) => acc + curr.occupiedSpaces, 0);
        const availableSpaces = totalSpaces - occupiedSpaces;

        const stats: ParkingDashboardStats = {
          totalAreas,
          totalSpaces,
          availableSpaces,
          occupiedSpaces,
          reservedSpaces: 45,
          disabledSpaces: 20,
          parkingRevenue: 85400000,
          currentVehicles: occupiedSpaces,
          peakHours: [
            { hour: '08:00', count: 120 },
            { hour: '10:00', count: 350 },
            { hour: '12:00', count: 480 },
            { hour: '14:00', count: 420 },
            { hour: '16:00', count: 390 },
            { hour: '18:00', count: 410 },
            { hour: '20:00', count: 180 },
          ],
          durationStats: [
            { range: '< 2h', count: 140 },
            { range: '2h - 4h', count: 280 },
            { range: '4h - 8h', count: 410 },
            { range: '> 8h', count: 90 },
          ],
        };
        return { data: stats };
      },
      providesTags: ['ParkingDashboard'],
    }),

    getParkingAreas: builder.query<ParkingAreaListResponse, ParkingAreaFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockParkingAreas];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (p) => p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s)
          );
        }
        if (filters.status) {
          filtered = filtered.filter((p) => p.status === filters.status);
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
      providesTags: ['ParkingArea'],
    }),

    getParkingAreaById: builder.query<ParkingArea, number>({
      queryFn: async (id) => {
        const area = mockParkingAreas.find((p) => p.id === id);
        if (!area) return { error: { status: 404, statusText: 'Not Found', data: null } };
        return { data: area };
      },
      providesTags: (_res, _err, id) => [{ type: 'ParkingArea', id }],
    }),

    createParkingArea: builder.mutation<ParkingArea, Partial<ParkingArea>>({
      queryFn: async (body) => {
        const newArea: ParkingArea = {
          id: mockParkingAreas.length + 1,
          parkId: body.parkId || 1,
          parkName: body.parkId === 2 ? 'Suối Tiên Theme Park' : 'Đầm Sen Cultural Park',
          name: body.name || 'Bãi đỗ xe mới',
          code: body.code || 'P-NEW',
          totalSpaces: body.totalSpaces || 100,
          occupiedSpaces: 0,
          availableSpaces: body.totalSpaces || 100,
          operatingHours: body.operatingHours || '08:00 - 22:00',
          pricingPolicy: body.pricingPolicy || 'Đồng giá 5k/lượt',
          description: body.description,
          status: body.status || 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        mockParkingAreas.push(newArea);
        return { data: newArea };
      },
      invalidatesTags: ['ParkingArea', 'ParkingDashboard'],
    }),

    updateParkingArea: builder.mutation<ParkingArea, { id: number; body: Partial<ParkingArea> }>({
      queryFn: async ({ id, body }) => {
        const index = mockParkingAreas.findIndex((p) => p.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        const current = mockParkingAreas[index];
        const updated: ParkingArea = {
          ...current,
          ...body,
          availableSpaces: (body.totalSpaces || current.totalSpaces) - current.occupiedSpaces,
        };
        mockParkingAreas[index] = updated;
        return { data: updated };
      },
      invalidatesTags: (_res, _err, { id }) => ['ParkingArea', { type: 'ParkingArea', id }, 'ParkingDashboard'],
    }),

    deleteParkingArea: builder.mutation<void, number>({
      queryFn: async (id) => {
        mockParkingAreas = mockParkingAreas.filter((p) => p.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ['ParkingArea', 'ParkingDashboard'],
    }),
  }),
});

export const {
  useGetParkingDashboardStatsQuery,
  useGetParkingAreasQuery,
  useGetParkingAreaByIdQuery,
  useCreateParkingAreaMutation,
  useUpdateParkingAreaMutation,
  useDeleteParkingAreaMutation,
} = parkingApi;
