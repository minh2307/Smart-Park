import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { SMSTemplate, SMSTemplateFilters } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockSMSTemplates: SMSTemplate[] = [
  {
    id: 1,
    templateName: 'SMS OTP Xác Minh Đăng Nhập',
    body: 'Ma OTP dang nhap GateOS cua ban la {{otpCode}}. Ma co hieu luc trong 2 phut. Khong chia se ma nay voi bat ky ai.',
    variables: ['otpCode'],
    category: 'OTP',
    version: 1,
    updatedAt: '2026-07-09T08:00:00Z',
    updatedBy: 'Hệ thống tự động',
  },
  {
    id: 2,
    templateName: 'Thông Báo Biến Động Số Dư Hội Viên',
    body: 'Tai khoan hoi vien {{memberId}} da thay doi {{points}} diem thuong. So du hien tai: {{balance}} diem. Tran trong.',
    variables: ['memberId', 'points', 'balance'],
    category: 'TRANSACTION',
    version: 1,
    updatedAt: '2026-07-09T10:15:00Z',
    updatedBy: 'Phạm Thị Thủy (Loyalty)',
  },
  {
    id: 3,
    templateName: 'SMS Khẩn Cấp Cảnh Báo An Toàn',
    body: '[Cảnh báo an toàn] Ban Quản lý GateOS thong bao: Toan bo cac tro choi outdoor se tam dung do gio bao lon. Quy khach vui long tim noi tru an an toan.',
    variables: [],
    category: 'ALERT',
    version: 2,
    updatedAt: '2026-07-09T16:20:00Z',
    updatedBy: 'Ban Quản Lý An Toàn',
  },
];

export const smsTemplateApi = createApi({
  reducerPath: 'smsTemplateApi',
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
  tagTypes: ['SMSTemplate'],
  endpoints: (builder) => ({
    getSMSTemplates: builder.query<{ content: SMSTemplate[]; totalElements: number; totalPages: number }, SMSTemplateFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockSMSTemplates];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter((t) => t.templateName.toLowerCase().includes(s) || t.body.toLowerCase().includes(s));
        }
        if (filters.category) {
          filtered = filtered.filter((t) => t.category === filters.category);
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
      providesTags: ['SMSTemplate'],
    }),

    createSMSTemplate: builder.mutation<SMSTemplate, Partial<SMSTemplate>>({
      queryFn: async (body) => {
        const newTemplate: SMSTemplate = {
          id: mockSMSTemplates.length + 1,
          templateName: body.templateName || 'Mẫu SMS mới',
          body: body.body || '',
          variables: body.variables || [],
          category: body.category || 'NOTIFICATION',
          version: 1,
          updatedAt: new Date().toISOString(),
          updatedBy: body.updatedBy || 'Quản trị viên',
        };
        mockSMSTemplates.push(newTemplate);
        return { data: newTemplate };
      },
      invalidatesTags: ['SMSTemplate'],
    }),

    updateSMSTemplate: builder.mutation<SMSTemplate, { id: number; data: Partial<SMSTemplate> }>({
      queryFn: async ({ id, data }) => {
        const idx = mockSMSTemplates.findIndex((t) => t.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockSMSTemplates[idx] = {
          ...mockSMSTemplates[idx],
          ...data,
          version: mockSMSTemplates[idx].version + 1,
          updatedAt: new Date().toISOString(),
        };
        return { data: mockSMSTemplates[idx] };
      },
      invalidatesTags: ['SMSTemplate'],
    }),

    deleteSMSTemplate: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockSMSTemplates = mockSMSTemplates.filter((t) => t.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['SMSTemplate'],
    }),
  }),
});

export const {
  useGetSMSTemplatesQuery,
  useCreateSMSTemplateMutation,
  useUpdateSMSTemplateMutation,
  useDeleteSMSTemplateMutation,
} = smsTemplateApi;
