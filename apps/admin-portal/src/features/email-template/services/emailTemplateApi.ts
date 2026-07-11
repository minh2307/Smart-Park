import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { EmailTemplate, EmailTemplateFilters } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockEmailTemplates: EmailTemplate[] = [
  {
    id: 1,
    templateName: 'Xác Nhận Đăng Ký Tài Khoản',
    subject: 'Chào mừng {{fullName}} đến với hệ thống GateOS!',
    bodyHtml: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #4f46e5;">Chào mừng quý khách!</h2>
      <p>Kính chào <strong>{{fullName}}</strong>,</p>
      <p>Tài khoản của bạn đã được khởi tạo thành công trên hệ thống quản lý GateOS với email <strong>{{email}}</strong>.</p>
      <p>Quý khách có thể sử dụng email này để đăng nhập và mua sắm dịch vụ trực tuyến.</p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #777;">Trân trọng,<br/>Đội ngũ SmartPark & GateOS.</p>
    </div>`,
    variables: ['fullName', 'email'],
    category: 'REGISTRATION',
    version: 1,
    updatedAt: '2026-07-09T08:00:00Z',
    updatedBy: 'Hệ thống tự động',
  },
  {
    id: 2,
    templateName: 'Xác Nhận Đặt Vé & Hóa Đơn',
    subject: 'Vé điện tử & Hóa đơn thanh toán đơn hàng {{bookingCode}}',
    bodyHtml: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #10b981;">Đặt Vé Thành Công!</h2>
      <p>Kính chào quý khách,</p>
      <p>Đơn hàng <strong>#{{bookingCode}}</strong> của quý khách đã được thanh toán thành công với số tiền <strong>{{amount}} VNĐ</strong>.</p>
      <p>Chi tiết vé QR code của quý khách:</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <strong>Tên khách hàng:</strong> {{customerName}}<br/>
        <strong>Số lượng vé:</strong> {{ticketCount}}<br/>
        <strong>Hạn sử dụng:</strong> {{expiryDate}}
      </div>
      <p>Quý khách vui lòng lưu lại mã QR đính kèm để quét tại cổng kiểm soát.</p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #777;">Cảm ơn quý khách đã tin dùng dịch vụ của GateOS.</p>
    </div>`,
    variables: ['bookingCode', 'amount', 'customerName', 'ticketCount', 'expiryDate'],
    category: 'BOOKING',
    version: 2,
    updatedAt: '2026-07-09T09:12:00Z',
    updatedBy: 'Nguyễn Hồng Nhung (Finance)',
  },
  {
    id: 3,
    templateName: 'Khôi Phục Mật Khẩu',
    subject: 'Yêu cầu khôi phục mật khẩu tài khoản GateOS',
    bodyHtml: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #ef4444;">Yêu Cầu Khôi Phục Mật Khẩu</h2>
      <p>Kính gửi quý khách,</p>
      <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu từ tài khoản của bạn. Vui lòng bấm vào liên kết dưới đây để thực hiện thiết lập lại:</p>
      <p style="margin: 20px 0;">
        <a href="{{resetLink}}" style="background: #4f46e5; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Đặt Lại Mật Khẩu</a>
      </p>
      <p>Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ bộ phận hỗ trợ kỹ thuật.</p>
      <hr style="border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #777;">Mã xác nhận bảo mật có hiệu lực trong vòng 15 phút.</p>
    </div>`,
    variables: ['resetLink'],
    category: 'SECURITY',
    version: 1,
    updatedAt: '2026-07-08T15:00:00Z',
    updatedBy: 'Đội ngũ kỹ thuật',
  },
];

export const emailTemplateApi = createApi({
  reducerPath: 'emailTemplateApi',
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
  tagTypes: ['EmailTemplate'],
  endpoints: (builder) => ({
    getEmailTemplates: builder.query<{ content: EmailTemplate[]; totalElements: number; totalPages: number }, EmailTemplateFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockEmailTemplates];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter((t) => t.templateName.toLowerCase().includes(s) || t.subject.toLowerCase().includes(s));
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
      providesTags: ['EmailTemplate'],
    }),

    createEmailTemplate: builder.mutation<EmailTemplate, Partial<EmailTemplate>>({
      queryFn: async (body) => {
        const newTemplate: EmailTemplate = {
          id: mockEmailTemplates.length + 1,
          templateName: body.templateName || 'Mẫu email mới',
          subject: body.subject || '',
          bodyHtml: body.bodyHtml || '',
          variables: body.variables || [],
          category: body.category || 'SYSTEM',
          version: 1,
          updatedAt: new Date().toISOString(),
          updatedBy: body.updatedBy || 'Quản trị viên',
        };
        mockEmailTemplates.push(newTemplate);
        return { data: newTemplate };
      },
      invalidatesTags: ['EmailTemplate'],
    }),

    updateEmailTemplate: builder.mutation<EmailTemplate, { id: number; data: Partial<EmailTemplate> }>({
      queryFn: async ({ id, data }) => {
        const idx = mockEmailTemplates.findIndex((t) => t.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockEmailTemplates[idx] = {
          ...mockEmailTemplates[idx],
          ...data,
          version: mockEmailTemplates[idx].version + 1,
          updatedAt: new Date().toISOString(),
        };
        return { data: mockEmailTemplates[idx] };
      },
      invalidatesTags: ['EmailTemplate'],
    }),

    deleteEmailTemplate: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockEmailTemplates = mockEmailTemplates.filter((t) => t.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['EmailTemplate'],
    }),
  }),
});

export const {
  useGetEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
} = emailTemplateApi;
