import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Gate, GateFilters, GateListResponse } from '../types';
import { GateInput } from '../schemas/gateSchema';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockGates: Gate[] = [
  {
    id: 1,
    code: 'GATE_MAIN_01',
    name: 'Cổng Chính Lối Vào 01',
    type: 'ENTRY',
    assignedVenueId: 1,
    assignedVenueName: 'Đầm Sen Water Park',
    assignedZoneId: null,
    assignedZoneName: null,
    assignedAttractionId: null,
    assignedAttractionName: null,
    status: 'OPEN',
    deviceStatus: 'ONLINE',
    currentOperator: 'Phan Văn Tiến',
    deviceInfo: {
      ipAddress: '192.168.10.101',
      macAddress: '00:1A:2B:3C:4D:5E',
      firmwareVersion: 'v2.4.1',
    },
    scannerConfig: {
      autoScan: true,
      continuousScan: false,
      beepSound: true,
      flashLight: false,
    },
    operatingHours: {
      open: '08:00',
      close: '18:00',
    },
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 2,
    code: 'GATE_THRILL_ENTRY',
    name: 'Cổng Vào Khu Cảm Giác Mạnh',
    type: 'RIDE',
    assignedVenueId: 1,
    assignedVenueName: 'Đầm Sen Water Park',
    assignedZoneId: 1,
    assignedZoneName: 'Cảm giác mạnh Water',
    assignedAttractionId: 1,
    assignedAttractionName: 'Hố Đen Vũ Trụ',
    status: 'OPEN',
    deviceStatus: 'ONLINE',
    currentOperator: 'Nguyễn Văn Hải',
    deviceInfo: {
      ipAddress: '192.168.10.102',
      macAddress: '00:1A:2B:3C:4D:5F',
      firmwareVersion: 'v2.4.1',
    },
    scannerConfig: {
      autoScan: true,
      continuousScan: true,
      beepSound: true,
      flashLight: false,
    },
    operatingHours: {
      open: '08:00',
      close: '18:00',
    },
    createdAt: '2026-06-15T09:00:00Z',
    updatedAt: '2026-06-15T09:00:00Z',
  },
  {
    id: 3,
    code: 'GATE_MAIN_EXIT_01',
    name: 'Cổng Lối Ra Chính',
    type: 'EXIT',
    assignedVenueId: 1,
    assignedVenueName: 'Đầm Sen Water Park',
    assignedZoneId: null,
    assignedZoneName: null,
    assignedAttractionId: null,
    assignedAttractionName: null,
    status: 'OPEN',
    deviceStatus: 'ONLINE',
    currentOperator: null,
    deviceInfo: {
      ipAddress: '192.168.10.103',
      macAddress: '00:1A:2B:3C:4D:60',
      firmwareVersion: 'v2.3.9',
    },
    scannerConfig: {
      autoScan: true,
      continuousScan: false,
      beepSound: false,
      flashLight: false,
    },
    operatingHours: {
      open: '08:00',
      close: '20:00',
    },
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-20T10:00:00Z',
  },
  {
    id: 4,
    code: 'GATE_VIP_01',
    name: 'Cổng VIP & FastPass',
    type: 'VIP',
    assignedVenueId: 1,
    assignedVenueName: 'Đầm Sen Water Park',
    assignedZoneId: null,
    assignedZoneName: null,
    assignedAttractionId: null,
    assignedAttractionName: null,
    status: 'MAINTENANCE',
    deviceStatus: 'OFFLINE',
    currentOperator: null,
    deviceInfo: {
      ipAddress: '192.168.10.104',
      macAddress: '00:1A:2B:3C:4D:61',
      firmwareVersion: 'v2.4.2',
    },
    scannerConfig: {
      autoScan: false,
      continuousScan: false,
      beepSound: true,
      flashLight: false,
    },
    operatingHours: {
      open: '08:00',
      close: '18:00',
    },
    createdAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-07-01T08:00:00Z',
  },
];

export const gateApi = createApi({
  reducerPath: 'gateApi',
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
  tagTypes: ['Gate'],
  endpoints: (builder) => ({
    getGates: builder.query<GateListResponse, GateFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockGates];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (g) =>
              g.name.toLowerCase().includes(s) ||
              g.code.toLowerCase().includes(s) ||
              (g.currentOperator && g.currentOperator.toLowerCase().includes(s))
          );
        }
        if (filters.type) {
          filtered = filtered.filter((g) => g.type === filters.type);
        }
        if (filters.status) {
          filtered = filtered.filter((g) => g.status === filters.status);
        }
        if (filters.venueId) {
          filtered = filtered.filter((g) => g.assignedVenueId === filters.venueId);
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
      providesTags: ['Gate'],
    }),

    getGateById: builder.query<Gate, number>({
      queryFn: async (id) => {
        const g = mockGates.find((item) => item.id === id);
        if (!g) return { error: { status: 404, statusText: 'Gate Not Found', data: null } };
        return { data: g };
      },
      providesTags: (_res, _err, id) => [{ type: 'Gate', id }],
    }),

    createGate: builder.mutation<Gate, GateInput>({
      queryFn: async (body) => {
        const newG: Gate = {
          id: mockGates.length + 1,
          code: body.code,
          name: body.name,
          type: body.type,
          assignedVenueId: body.assignedVenueId,
          assignedVenueName: body.assignedVenueId === 1 ? 'Đầm Sen Water Park' : 'Fantasy Park',
          assignedZoneId: body.assignedZoneId || null,
          assignedZoneName: body.assignedZoneId ? 'Khu vực chỉ định' : null,
          assignedAttractionId: body.assignedAttractionId || null,
          assignedAttractionName: body.assignedAttractionId ? 'Trò chơi chỉ định' : null,
          status: body.status,
          deviceStatus: body.deviceStatus,
          currentOperator: body.currentOperator || null,
          deviceInfo: body.deviceInfo,
          scannerConfig: body.scannerConfig,
          operatingHours: body.operatingHours,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockGates.push(newG);
        return { data: newG };
      },
      invalidatesTags: ['Gate'],
    }),

    updateGate: builder.mutation<Gate, { id: number; body: Partial<Gate> }>({
      queryFn: async ({ id, body }) => {
        const index = mockGates.findIndex((item) => item.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Gate Not Found', data: null } };
        const current = mockGates[index];
        const updated: Gate = {
          ...current,
          ...body,
          updatedAt: new Date().toISOString(),
        };
        mockGates[index] = updated;
        return { data: updated };
      },
      invalidatesTags: (_res, _err, { id }) => ['Gate', { type: 'Gate', id }],
    }),

    deleteGate: builder.mutation<void, number>({
      queryFn: async (id) => {
        mockGates = mockGates.filter((item) => item.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ['Gate'],
    }),
  }),
});

export const {
  useGetGatesQuery,
  useGetGateByIdQuery,
  useCreateGateMutation,
  useUpdateGateMutation,
  useDeleteGateMutation,
} = gateApi;
