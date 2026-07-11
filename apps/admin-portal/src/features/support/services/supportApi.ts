import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { SupportTicket, SupportStats, SupportTicketFilters } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockSupportTickets: SupportTicket[] = [
  {
    id: 1,
    ticketCode: 'SUP-1001',
    customerName: 'Hoàng Lâm Duy',
    customerEmail: 'lamduy.h@gmail.com',
    customerPhone: '0977888999',
    subject: 'Yêu cầu hoàn trả tiền vé do trời mưa',
    category: 'TICKET_REFUND',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assigneeName: 'Nguyễn Văn Minh (CSKH)',
    description: 'Tôi đã đặt mua 4 vé công viên nước ngày hôm nay nhưng do trời mưa giông bão to công viên nước đóng cửa. Tôi muốn xin hoàn tiền.',
    messages: [
      {
        id: 1,
        senderName: 'Hoàng Lâm Duy',
        senderRole: 'CUSTOMER',
        messageText: 'Chào Admin, vé của tôi mã số BK-4091 trị giá 800.000đ mua sáng nay. Xin hoàn tiền vì công viên đóng cửa nước bão.',
        createdAt: '2026-07-09T10:00:00Z',
      },
      {
        id: 2,
        senderName: 'Nguyễn Văn Minh',
        senderRole: 'STAFF',
        messageText: 'Chào anh Duy, chúng tôi đã ghi nhận trường hợp này. Quy chế công viên ghi rõ hoàn tiền 100% trong trường hợp bão thiên tai bất khả kháng. Bộ phận kế toán đang xử lý và hoàn trả trong vòng 2-3 ngày làm việc.',
        createdAt: '2026-07-09T10:30:00Z',
      },
    ],
    slaDeadline: '2026-07-09T14:00:00Z',
    slaStatus: 'WARNING',
    createdAt: '2026-07-09T10:00:00Z',
  },
  {
    id: 2,
    ticketCode: 'SUP-1002',
    customerName: 'Nguyễn Bích Phương',
    customerEmail: 'bichphuong.music@gmail.com',
    subject: 'Lỗi kích hoạt điểm thẻ thành viên Diamond',
    category: 'MEMBERSHIP',
    priority: 'NORMAL',
    status: 'OPEN',
    description: 'Tôi vừa nâng cấp thẻ Diamond tại quầy lễ tân trưa nay, tuy nhiên khi đăng nhập app điện thoại số dư điểm loyalty vẫn hiển thị hạng Gold cũ.',
    messages: [
      {
        id: 1,
        senderName: 'Nguyễn Bích Phương',
        senderRole: 'CUSTOMER',
        messageText: 'Thẻ cứng của tôi đã đổi sang màu kim cương nhưng trên hệ thống di động tài khoản vẫn chưa cập nhật quyền lợi Diamond.',
        createdAt: '2026-07-09T15:20:00Z',
      },
    ],
    slaDeadline: '2026-07-10T15:20:00Z',
    slaStatus: 'MET',
    createdAt: '2026-07-09T15:20:00Z',
  },
];

export const supportApi = createApi({
  reducerPath: 'supportApi',
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
  tagTypes: ['SupportTicket', 'SupportStats'],
  endpoints: (builder) => ({
    getSupportStats: builder.query<SupportStats, void>({
      queryFn: async () => {
        const total = mockSupportTickets.length;
        const open = mockSupportTickets.filter((t) => t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length;
        const resolved = mockSupportTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

        const stats: SupportStats = {
          totalTickets: total,
          openTickets: open,
          resolvedTickets: resolved,
          slaComplianceRate: 94.6,
          customerSatisfactionScore: 4.7,
          averageResponseTimeMinutes: 12.4,
          averageResolutionTimeMinutes: 45.8,
          ticketsByCategory: [
            { category: 'TICKET_REFUND', count: 18 },
            { category: 'MEMBERSHIP', count: 10 },
            { category: 'LOST_FOUND', count: 5 },
            { category: 'FACILITY', count: 3 },
            { category: 'COMPLAINT', count: 7 },
            { category: 'OTHER', count: 4 },
          ],
          ticketsByStatus: [
            { status: 'OPEN', count: 5 },
            { status: 'IN_PROGRESS', count: 8 },
            { status: 'RESOLVED', count: 28 },
            { status: 'CLOSED', count: 14 },
          ],
        };
        return { data: stats };
      },
      providesTags: ['SupportStats'],
    }),

    getSupportTickets: builder.query<{ content: SupportTicket[]; totalElements: number; totalPages: number }, SupportTicketFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockSupportTickets];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (t) =>
              t.ticketCode.toLowerCase().includes(s) ||
              t.subject.toLowerCase().includes(s) ||
              t.customerName.toLowerCase().includes(s) ||
              t.customerEmail.toLowerCase().includes(s)
          );
        }
        if (filters.category) {
          filtered = filtered.filter((t) => t.category === filters.category);
        }
        if (filters.priority) {
          filtered = filtered.filter((t) => t.priority === filters.priority);
        }
        if (filters.status) {
          filtered = filtered.filter((t) => t.status === filters.status);
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
      providesTags: ['SupportTicket'],
    }),

    createSupportTicket: builder.mutation<SupportTicket, Partial<SupportTicket>>({
      queryFn: async (body) => {
        const ticketCode = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
        const slaHours = body.priority === 'HIGH' || body.priority === 'URGENT' ? 4 : 24;
        const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

        const newTicket: SupportTicket = {
          id: mockSupportTickets.length + 1,
          ticketCode,
          customerName: body.customerName || 'Khách hàng',
          customerEmail: body.customerEmail || 'cskh@gateos.vn',
          customerPhone: body.customerPhone,
          subject: body.subject || 'Hỗ trợ khách hàng',
          category: body.category || 'OTHER',
          priority: body.priority || 'NORMAL',
          status: 'OPEN',
          assigneeName: body.assigneeName,
          description: body.description || '',
          messages: [
            {
              id: 1,
              senderName: body.customerName || 'Khách hàng',
              senderRole: 'CUSTOMER',
              messageText: body.description || '',
              createdAt: new Date().toISOString(),
            },
          ],
          slaDeadline,
          slaStatus: 'MET',
          createdAt: new Date().toISOString(),
        };
        mockSupportTickets.unshift(newTicket);
        return { data: newTicket };
      },
      invalidatesTags: ['SupportTicket', 'SupportStats'],
    }),

    assignSupportTicket: builder.mutation<SupportTicket, { id: number; assigneeName: string }>({
      queryFn: async ({ id, assigneeName }) => {
        const idx = mockSupportTickets.findIndex((t) => t.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockSupportTickets[idx] = {
          ...mockSupportTickets[idx],
          assigneeName,
          status: 'ASSIGNED',
        };
        return { data: mockSupportTickets[idx] };
      },
      invalidatesTags: ['SupportTicket', 'SupportStats'],
    }),

    addSupportMessage: builder.mutation<SupportTicket, { id: number; messageText: string; senderName: string; senderRole: 'CUSTOMER' | 'STAFF' | 'SYSTEM' }>({
      queryFn: async ({ id, messageText, senderName, senderRole }) => {
        const idx = mockSupportTickets.findIndex((t) => t.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };

        const newMessage = {
          id: mockSupportTickets[idx].messages.length + 1,
          senderName,
          senderRole,
          messageText,
          createdAt: new Date().toISOString(),
        };

        const updatedMessages = [...mockSupportTickets[idx].messages, newMessage];
        const status = senderRole === 'STAFF' ? 'IN_PROGRESS' : 'WAITING_CUSTOMER';

        mockSupportTickets[idx] = {
          ...mockSupportTickets[idx],
          messages: updatedMessages,
          status,
        };
        return { data: mockSupportTickets[idx] };
      },
      invalidatesTags: ['SupportTicket'],
    }),

    resolveSupportTicket: builder.mutation<SupportTicket, number>({
      queryFn: async (id) => {
        const idx = mockSupportTickets.findIndex((t) => t.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockSupportTickets[idx] = {
          ...mockSupportTickets[idx],
          status: 'RESOLVED',
          resolvedAt: new Date().toISOString(),
        };
        return { data: mockSupportTickets[idx] };
      },
      invalidatesTags: ['SupportTicket', 'SupportStats'],
    }),

    deleteSupportTicket: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockSupportTickets = mockSupportTickets.filter((t) => t.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['SupportTicket', 'SupportStats'],
    }),
  }),
});

export const {
  useGetSupportStatsQuery,
  useGetSupportTicketsQuery,
  useCreateSupportTicketMutation,
  useAssignSupportTicketMutation,
  useAddSupportMessageMutation,
  useResolveSupportTicketMutation,
  useDeleteSupportTicketMutation,
} = supportApi;
