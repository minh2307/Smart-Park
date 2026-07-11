import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Complaint, ComplaintFilters } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockComplaints: Complaint[] = [
  {
    id: 1,
    customerName: 'Trần Minh Quân',
    customerPhone: '0912345678',
    title: 'Sai lệch giá thanh toán vé cổng',
    description: 'Thanh toán tiền vé trực tuyến trừ tài khoản 200,000 VNĐ nhưng trên hóa đơn cổng hiển thị lỗi và trừ thêm tiền mặt tại quầy.',
    priority: 'HIGH',
    severity: 'MAJOR',
    status: 'INVESTIGATING',
    evidenceUrls: ['https://picsum.photos/seed/receipt/600/400'],
    assignedStaff: 'Nguyễn Văn Minh (CSKH)',
    internalNotes: 'Đang liên hệ với cổng thanh toán VNPay để rà soát đối soát tài chính ngày 09/07.',
    isEscalated: false,
    createdAt: '2026-07-09T09:30:00Z',
  },
  {
    id: 2,
    customerName: 'Lê Thị Diễm',
    customerPhone: '0988776655',
    title: 'Mất đồ cá nhân tại tủ Smart Locker',
    description: 'Tủ số 104 tự động mở khóa trong thời gian thuê làm tôi bị thất lạc một túi xách da bên trong có giấy tờ quan trọng.',
    priority: 'CRITICAL',
    severity: 'SEVERE',
    status: 'OPEN',
    assignedStaff: 'Trần Thanh Sơn (Security)',
    isEscalated: true,
    escalationReason: 'Thiệt hại vật chất lớn và có nguy cơ ảnh hưởng uy tín an ninh của khu vui chơi.',
    createdAt: '2026-07-09T14:10:00Z',
  },
  {
    id: 3,
    customerName: 'Vũ Văn Hùng',
    customerPhone: '0909998887',
    title: 'Thái độ nhân viên giữ xe thiếu chuẩn mực',
    description: 'Nhân viên bảo vệ bãi đỗ xe B có hành vi to tiếng, thái độ xô đẩy với khách khi hướng dẫn xếp xe hàng ngang.',
    priority: 'NORMAL',
    severity: 'MODERATE',
    status: 'RESOLVED',
    assignedStaff: 'Phạm Minh Tuyến',
    resolutionText: 'Đã nhắc nhở cảnh cáo nhân viên bảo vệ ca sáng bãi B và điều chuyển sang vị trí tuần tra vòng ngoài.',
    resolvedAt: '2026-07-09T16:00:00Z',
    isEscalated: false,
    createdAt: '2026-07-09T10:00:00Z',
  },
];

export const complaintApi = createApi({
  reducerPath: 'complaintApi',
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
  tagTypes: ['Complaint'],
  endpoints: (builder) => ({
    getComplaints: builder.query<{ content: Complaint[]; totalElements: number; totalPages: number }, ComplaintFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockComplaints];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.customerName.toLowerCase().includes(s) ||
              c.title.toLowerCase().includes(s) ||
              c.description.toLowerCase().includes(s)
          );
        }
        if (filters.priority) {
          filtered = filtered.filter((c) => c.priority === filters.priority);
        }
        if (filters.severity) {
          filtered = filtered.filter((c) => c.severity === filters.severity);
        }
        if (filters.status) {
          filtered = filtered.filter((c) => c.status === filters.status);
        }
        if (filters.isEscalated !== undefined && filters.isEscalated !== '') {
          filtered = filtered.filter((c) => c.isEscalated === filters.isEscalated);
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
      providesTags: ['Complaint'],
    }),

    createComplaint: builder.mutation<Complaint, Partial<Complaint>>({
      queryFn: async (body) => {
        const newComplaint: Complaint = {
          id: mockComplaints.length + 1,
          customerName: body.customerName || 'Khách hàng ẩn danh',
          customerPhone: body.customerPhone || 'N/A',
          title: body.title || 'Khiếu nại mới',
          description: body.description || '',
          priority: body.priority || 'NORMAL',
          severity: body.severity || 'MINOR',
          status: 'OPEN',
          evidenceUrls: body.evidenceUrls,
          assignedStaff: body.assignedStaff,
          internalNotes: body.internalNotes,
          isEscalated: body.isEscalated || false,
          createdAt: new Date().toISOString(),
        };
        mockComplaints.unshift(newComplaint);
        return { data: newComplaint };
      },
      invalidatesTags: ['Complaint'],
    }),

    updateComplaint: builder.mutation<Complaint, { id: number; data: Partial<Complaint> }>({
      queryFn: async ({ id, data }) => {
        const idx = mockComplaints.findIndex((c) => c.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockComplaints[idx] = { ...mockComplaints[idx], ...data };
        return { data: mockComplaints[idx] };
      },
      invalidatesTags: ['Complaint'],
    }),

    resolveComplaint: builder.mutation<Complaint, { id: number; resolutionText: string }>({
      queryFn: async ({ id, resolutionText }) => {
        const idx = mockComplaints.findIndex((c) => c.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockComplaints[idx] = {
          ...mockComplaints[idx],
          resolutionText,
          status: 'RESOLVED',
          resolvedAt: new Date().toISOString(),
        };
        return { data: mockComplaints[idx] };
      },
      invalidatesTags: ['Complaint'],
    }),

    deleteComplaint: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockComplaints = mockComplaints.filter((c) => c.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['Complaint'],
    }),
  }),
});

export const {
  useGetComplaintsQuery,
  useCreateComplaintMutation,
  useUpdateComplaintMutation,
  useResolveComplaintMutation,
  useDeleteComplaintMutation,
} = complaintApi;
