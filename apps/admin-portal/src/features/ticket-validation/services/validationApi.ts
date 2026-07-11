import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { ValidationLog, ValidationSummaryStats } from '../types';
import { mockGates } from '../../gate/services/gateApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export interface ValidationFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  gateId?: number;
  attractionId?: number;
}

export interface ValidationListResponse {
  content: ValidationLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export let mockValidationLogs: ValidationLog[] = [
  {
    id: 1,
    ticketId: 1,
    ticketCode: 'TK_DS_STANDARD_998811A',
    customerName: 'Nguyễn Minh Hải',
    attractionId: 1,
    attractionName: 'Hố Đen Vũ Trụ',
    checkInTime: new Date(Date.now() - 3600 * 1000).toISOString(),
    status: 'SUCCESS',
    gateId: 2,
    gateCode: 'GATE_THRILL_ENTRY',
    operatorName: 'Nguyễn Văn Hải',
    remainingUsage: 0,
  },
  {
    id: 2,
    ticketId: null,
    ticketCode: 'TK_EXPIRED_XYZ_999',
    customerName: 'Trần Thị Thuỷ',
    attractionId: null,
    attractionName: null,
    checkInTime: new Date(Date.now() - 1800 * 1000).toISOString(),
    status: 'EXPIRED',
    gateId: 1,
    gateCode: 'GATE_MAIN_01',
    operatorName: 'Phan Văn Tiến',
    failureReason: 'Vé đã hết hạn sử dụng (Hạn dùng: 2026-06-30)',
  },
  {
    id: 3,
    ticketId: 2,
    ticketCode: 'TK_DS_VIP_998811B',
    customerName: 'Nguyễn Minh Hải',
    attractionId: 1,
    attractionName: 'Hố Đen Vũ Trụ',
    checkInTime: new Date(Date.now() - 900 * 1000).toISOString(),
    status: 'SUCCESS',
    gateId: 2,
    gateCode: 'GATE_THRILL_ENTRY',
    operatorName: 'Nguyễn Văn Hải',
    remainingUsage: 1,
  },
  {
    id: 4,
    ticketId: null,
    ticketCode: 'UNKNOWN_TICKET_CODE_456',
    customerName: 'Khách không xác định',
    attractionId: null,
    attractionName: null,
    checkInTime: new Date(Date.now() - 300 * 1000).toISOString(),
    status: 'INVALID_CODE',
    gateId: 1,
    gateCode: 'GATE_MAIN_01',
    operatorName: 'Phan Văn Tiến',
    failureReason: 'Mã QR không đúng định dạng hoặc không có trong hệ thống',
  },
];

export const validationApi = createApi({
  reducerPath: 'validationApi',
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
  tagTypes: ['ValidationLog', 'ValidationStats'],
  endpoints: (builder) => ({
    getValidationLogs: builder.query<ValidationListResponse, ValidationFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockValidationLogs];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (l) =>
              l.ticketCode.toLowerCase().includes(s) ||
              l.customerName.toLowerCase().includes(s) ||
              (l.failureReason && l.failureReason.toLowerCase().includes(s))
          );
        }
        if (filters.status) {
          filtered = filtered.filter((l) => l.status === filters.status);
        }
        if (filters.gateId) {
          filtered = filtered.filter((l) => l.gateId === filters.gateId);
        }

        // Sort descending by checkInTime
        filtered.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());

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
      providesTags: ['ValidationLog'],
    }),

    getValidationStats: builder.query<ValidationSummaryStats, void>({
      queryFn: async () => {
        const stats: ValidationSummaryStats = {
          totalScans: mockValidationLogs.length,
          successfulScans: mockValidationLogs.filter((l) => l.status === 'SUCCESS').length,
          failedScans: mockValidationLogs.filter((l) => l.status !== 'SUCCESS').length,
          wrongLocationScans: mockValidationLogs.filter((l) => l.status === 'WRONG_LOCATION').length,
          expiredScans: mockValidationLogs.filter((l) => l.status === 'EXPIRED').length,
          alreadyUsedScans: mockValidationLogs.filter((l) => l.status === 'ALREADY_USED').length,
        };
        return { data: stats };
      },
      providesTags: ['ValidationStats'],
    }),

    validateTicketScan: builder.mutation<
      { success: boolean; log: ValidationLog },
      { qrCode: string; gateId: number; attractionId?: number }
    >({
      queryFn: async ({ qrCode, gateId, attractionId }) => {
        const gate = mockGates.find((g) => g.id === gateId);
        const gateCode = gate ? gate.code : 'GATE_UNKNOWN';
        const operatorName = gate?.currentOperator || 'System Automated';
        
        let status: 'SUCCESS' | 'EXPIRED' | 'WRONG_LOCATION' | 'ALREADY_USED' | 'INVALID_CODE' | 'SUSPENDED' = 'SUCCESS';
        let failureReason = '';
        let customerName = 'Khách vãng lai';
        let ticketId: number | null = null;
        let attractionName: string | null = null;

        // Simple validation rule checks
        if (!qrCode || qrCode.trim() === '') {
          status = 'INVALID_CODE';
          failureReason = 'Mã QR rỗng';
        } else if (qrCode.startsWith('TK_EXPIRED')) {
          status = 'EXPIRED';
          failureReason = 'Vé đã hết hạn sử dụng (Hạn dùng: 2026-06-30)';
        } else if (qrCode.startsWith('TK_WRONG_LOC')) {
          status = 'WRONG_LOCATION';
          failureReason = 'Sai địa điểm. Vé này chỉ được sử dụng tại Fantasy Park';
        } else if (qrCode.startsWith('TK_USED') || qrCode === 'TK_DS_STANDARD_998811A') {
          status = 'ALREADY_USED';
          failureReason = 'Vé đã được check-in lúc ' + new Date().toLocaleTimeString();
        } else if (qrCode.startsWith('TK_SUSPENDED')) {
          status = 'SUSPENDED';
          failureReason = 'Vé đã bị tạm khóa do vi phạm nội quy công viên';
        } else if (!qrCode.startsWith('TK_DS_') && !qrCode.startsWith('TK_FANTASY_')) {
          status = 'INVALID_CODE';
          failureReason = 'Mã QR không đúng định dạng vé GateOS';
        } else {
          // Valid ticket format
          status = 'SUCCESS';
          ticketId = Math.floor(Math.random() * 1000) + 10;
          customerName = qrCode.includes('VIP') ? 'Trần Văn VIP' : 'Lê Thị Thu';
        }

        if (attractionId) {
          attractionName = attractionId === 1 ? 'Hố Đen Vũ Trụ' : 'Trò chơi chỉ định';
        }

        const newLog: ValidationLog = {
          id: mockValidationLogs.length + 1,
          ticketId,
          ticketCode: qrCode,
          customerName,
          attractionId: attractionId || null,
          attractionName,
          checkInTime: new Date().toISOString(),
          status,
          gateId,
          gateCode,
          operatorName,
          failureReason: failureReason || undefined,
          remainingUsage: status === 'SUCCESS' ? (qrCode.includes('VIP') ? 2 : 0) : undefined,
        };

        mockValidationLogs.push(newLog);

        return {
          data: {
            success: status === 'SUCCESS',
            log: newLog,
          },
        };
      },
      invalidatesTags: ['ValidationLog', 'ValidationStats'],
    }),

    clearValidationLogs: builder.mutation<void, void>({
      queryFn: async () => {
        mockValidationLogs = [];
        return { data: undefined };
      },
      invalidatesTags: ['ValidationLog', 'ValidationStats'],
    }),
  }),
});

export const {
  useGetValidationLogsQuery,
  useGetValidationStatsQuery,
  useValidateTicketScanMutation,
  useClearValidationLogsMutation,
} = validationApi;
