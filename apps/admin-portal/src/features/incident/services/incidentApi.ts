import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Incident, IncidentStats, IncidentFilters, IncidentStatus } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockIncidents: Incident[] = [
  {
    id: 1,
    title: 'Kẹt cabin vòng quay Mặt Trời',
    type: 'RIDE_BREAKDOWN',
    severity: 'CRITICAL',
    impact: 'VENUE',
    location: 'Khu Đu Quay B',
    venueId: 2,
    venueName: 'Khu Trò Chơi Cảm Giác Mạnh',
    rideId: 2,
    rideName: 'Tàu lượn siêu tốc',
    status: 'IN_PROGRESS',
    reporterName: 'Lê Văn Tám (Giám sát vận hành)',
    reporterContact: '0919283746',
    assigneeName: 'Trần Văn Hoàng (Đội Trưởng Kỹ Thuật)',
    description: 'Cabin số 08 bị kẹt trục quay phụ khi đang di chuyển ở độ cao 15m. Có 4 khách đang ở bên trong.',
    attachments: ['https://picsum.photos/seed/cabin/600/400'],
    timeline: [
      {
        id: 1,
        status: 'REPORTED',
        notes: 'Phát hiện sự cố rung lắc nhẹ và kẹt cứng cáp cabin số 08.',
        updatedBy: 'Lê Văn Tám',
        createdAt: '2026-07-09T14:30:00Z',
      },
      {
        id: 2,
        status: 'INVESTIGATING',
        notes: 'Đội kỹ thuật đã tiếp cận chân tháp đu quay, chuẩn bị phương án kéo tời thủ công.',
        updatedBy: 'Trần Văn Hoàng',
        createdAt: '2026-07-09T14:45:00Z',
      },
    ],
    createdAt: '2026-07-09T14:30:00Z',
  },
  {
    id: 2,
    title: 'Mất điện lưới diện rộng bãi B',
    type: 'POWER_FAILURE',
    severity: 'HIGH',
    impact: 'VENUE',
    location: 'Khu gửi xe B',
    status: 'RESOLVED',
    reporterName: 'Hệ thống tự động (UPS Alert)',
    reporterContact: 'N/A',
    assigneeName: 'Nguyễn Tiến Dũng (M&E)',
    description: 'Mất điện lưới chính cấp cho trạm biến áp số 2, máy phát dự phòng tự động kích hoạt sau 10 giây.',
    timeline: [
      {
        id: 1,
        status: 'REPORTED',
        notes: 'Mất nguồn chính trạm biến áp số 2.',
        updatedBy: 'Hệ thống',
        createdAt: '2026-07-09T08:00:00Z',
      },
      {
        id: 2,
        status: 'RESOLVED',
        notes: 'Đã đóng máy phát điện dự phòng và cấp điện trở lại cho toàn khu B.',
        updatedBy: 'Nguyễn Tiến Dũng',
        createdAt: '2026-07-09T08:15:00Z',
      },
    ],
    rootCause: 'Nhà thầu đào cáp thi công bên ngoài cắt trúng đường cáp trung thế 22kV.',
    correctiveAction: 'Sử dụng máy phát điện chạy dầu khẩn cấp.',
    preventiveAction: 'Lắp thêm rào chắn cảnh báo cáp ngầm dọc trục quốc lộ trước cổng bãi B.',
    resolvedAt: '2026-07-09T08:15:00Z',
    createdAt: '2026-07-09T08:00:00Z',
  },
];

export const incidentApi = createApi({
  reducerPath: 'incidentApi',
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
  tagTypes: ['Incident', 'IncidentStats'],
  endpoints: (builder) => ({
    getIncidentStats: builder.query<IncidentStats, void>({
      queryFn: async () => {
        const total = mockIncidents.length;
        const active = mockIncidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
        const resolved = mockIncidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;

        const stats: IncidentStats = {
          totalIncidents: total,
          activeIncidents: active,
          resolvedIncidents: resolved,
          averageResolutionTimeMinutes: 18.5,
          incidentsByType: [
            { type: 'RIDE_BREAKDOWN', count: 12 },
            { type: 'POWER_FAILURE', count: 4 },
            { type: 'MEDICAL_EMERGENCY', count: 8 },
            { type: 'SECURITY', count: 3 },
            { type: 'OTHER', count: 5 },
          ],
          incidentsBySeverity: [
            { severity: 'LOW', count: 15 },
            { severity: 'MEDIUM', count: 9 },
            { severity: 'HIGH', count: 6 },
            { severity: 'CRITICAL', count: 2 },
          ],
          monthlyTrend: [
            { date: '03/07', count: 2 },
            { date: '04/07', count: 4 },
            { date: '05/07', count: 3 },
            { date: '06/07', count: 1 },
            { date: '07/07', count: 5 },
            { date: '08/07', count: 3 },
            { date: '09/07', count: total },
          ],
        };
        return { data: stats };
      },
      providesTags: ['IncidentStats'],
    }),

    getIncidents: builder.query<{ content: Incident[]; totalElements: number; totalPages: number }, IncidentFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockIncidents];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (i) =>
              i.title.toLowerCase().includes(s) ||
              i.location.toLowerCase().includes(s) ||
              i.description.toLowerCase().includes(s)
          );
        }
        if (filters.type) {
          filtered = filtered.filter((i) => i.type === filters.type);
        }
        if (filters.severity) {
          filtered = filtered.filter((i) => i.severity === filters.severity);
        }
        if (filters.status) {
          filtered = filtered.filter((i) => i.status === filters.status);
        }
        if (filters.venueId) {
          filtered = filtered.filter((i) => i.venueId === filters.venueId);
        }
        if (filters.rideId) {
          filtered = filtered.filter((i) => i.rideId === filters.rideId);
        }

        const size = filters.size || 10;
        const page = filters.page || 0;
        const offset = page * size;
        const content = filtered.slice(offset, offset + size);

        return {
          data: {
            content,
            totalElements: filtered.length,
            totalPages: Math.ceil(filtered.length / size),
          },
        };
      },
      providesTags: ['Incident'],
    }),

    createIncident: builder.mutation<Incident, Partial<Incident>>({
      queryFn: async (body) => {
        const newIncident: Incident = {
          id: mockIncidents.length + 1,
          title: body.title || 'Sự cố mới phát sinh',
          type: body.type || 'OTHER',
          severity: body.severity || 'LOW',
          impact: body.impact || 'INDIVIDUAL',
          location: body.location || 'Khu vực chung',
          venueId: body.venueId,
          venueName: body.venueName,
          rideId: body.rideId,
          rideName: body.rideName,
          status: 'REPORTED',
          reporterName: body.reporterName || 'N/A',
          reporterContact: body.reporterContact || 'N/A',
          assigneeName: body.assigneeName,
          description: body.description || '',
          attachments: body.attachments,
          timeline: [
            {
              id: 1,
              status: 'REPORTED',
              notes: 'Ghi nhận báo cáo sự cố ban đầu.',
              updatedBy: body.reporterName || 'Hệ thống',
              createdAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
        };
        mockIncidents.unshift(newIncident);
        return { data: newIncident };
      },
      invalidatesTags: ['Incident', 'IncidentStats'],
    }),

    updateIncidentStatus: builder.mutation<Incident, { id: number; status: IncidentStatus; notes: string; updatedBy: string }>({
      queryFn: async ({ id, status, notes, updatedBy }) => {
        const idx = mockIncidents.findIndex((i) => i.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };

        const timelineEvent = {
          id: mockIncidents[idx].timeline.length + 1,
          status,
          notes,
          updatedBy,
          createdAt: new Date().toISOString(),
        };

        const updatedData: Partial<Incident> = {
          status,
          timeline: [...mockIncidents[idx].timeline, timelineEvent],
        };

        if (status === 'RESOLVED') {
          updatedData.resolvedAt = new Date().toISOString();
        }

        mockIncidents[idx] = { ...mockIncidents[idx], ...updatedData };
        return { data: mockIncidents[idx] };
      },
      invalidatesTags: ['Incident', 'IncidentStats'],
    }),

    resolveIncident: builder.mutation<Incident, { id: number; rootCause: string; correctiveAction: string; preventiveAction: string }>({
      queryFn: async ({ id, rootCause, correctiveAction, preventiveAction }) => {
        const idx = mockIncidents.findIndex((i) => i.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };

        mockIncidents[idx] = {
          ...mockIncidents[idx],
          rootCause,
          correctiveAction,
          preventiveAction,
          status: 'RESOLVED',
          resolvedAt: new Date().toISOString(),
        };
        return { data: mockIncidents[idx] };
      },
      invalidatesTags: ['Incident', 'IncidentStats'],
    }),

    deleteIncident: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockIncidents = mockIncidents.filter((i) => i.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['Incident', 'IncidentStats'],
    }),
  }),
});

export const {
  useGetIncidentStatsQuery,
  useGetIncidentsQuery,
  useCreateIncidentMutation,
  useUpdateIncidentStatusMutation,
  useResolveIncidentMutation,
  useDeleteIncidentMutation,
} = incidentApi;
