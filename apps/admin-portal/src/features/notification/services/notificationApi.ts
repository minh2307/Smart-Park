import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import {
  NotificationItem,
  NotificationStats,
  NotificationFilters,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'Bảo trì định kỳ Trò chơi Đu quay khổng lồ',
    message: 'Hệ thống xin thông báo trò chơi Đu quay khổng lồ sẽ tạm ngưng phục vụ từ 13:00 đến 15:00 hôm nay để bảo trì định kỳ.',
    channel: 'IN_APP',
    priority: 'HIGH',
    recipientType: 'ALL_USERS',
    status: 'SENT',
    sentTime: '2026-07-09T08:00:00Z',
    createdBy: 'Trần Văn Hoàng (Admin)',
    deliveryCount: 1540,
    readCount: 1205,
  },
  {
    id: 2,
    title: 'Mã giảm giá 20% ẩm thực đêm cho hội viên VIP',
    message: 'Nhập mã VIPNIGHT20 giảm ngay 20% khi mua sắm tại khu ẩm thực F&B sau 19h tối nay. Chỉ áp dụng cho hội viên Gold/Platinum.',
    channel: 'PUSH',
    priority: 'NORMAL',
    recipientType: 'VIP_MEMBERS',
    status: 'SCHEDULED',
    scheduledTime: '2026-07-09T19:00:00Z',
    createdBy: 'Phạm Thị Thủy (Marketing)',
    deliveryCount: 0,
    readCount: 0,
  },
  {
    id: 3,
    title: 'Xác nhận đặt vé thành công #BK-9082',
    message: 'Cảm ơn quý khách đã đặt vé GateOS. Vé QR code của quý khách đã được gửi qua email. Xin cảm ơn.',
    channel: 'EMAIL',
    priority: 'NORMAL',
    recipientType: 'CUSTOMERS',
    status: 'SENT',
    sentTime: '2026-07-09T14:22:15Z',
    createdBy: 'Hệ Thống Tự Động',
    deliveryCount: 1,
    readCount: 1,
  },
  {
    id: 4,
    title: 'Thông báo khẩn cấp: Thay đổi lịch trình hoạt động do thời tiết',
    message: 'Do thời tiết mưa bão cực đoan, toàn bộ trò chơi ngoài trời sẽ đóng cửa sau 16:30. Quý khách vui lòng di chuyển vào khu nhà mái che.',
    channel: 'SMS',
    priority: 'EMERGENCY',
    recipientType: 'VISITORS',
    status: 'SENT',
    sentTime: '2026-07-09T16:15:00Z',
    createdBy: 'Ban Quản Lý An Toàn',
    deliveryCount: 840,
    readCount: 840,
  },
  {
    id: 5,
    title: 'Khảo sát chất lượng dịch vụ GateOS',
    message: 'Quý khách vui lòng dành 1 phút đánh giá trải nghiệm dịch vụ tại cổng kiểm soát. Đóng góp của quý khách giúp chúng tôi phục vụ tốt hơn.',
    channel: 'WEB',
    priority: 'LOW',
    recipientType: 'ALL_USERS',
    status: 'DRAFT',
    createdBy: 'Nguyễn Văn Minh (CSKH)',
    deliveryCount: 0,
    readCount: 0,
  },
];

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
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
  tagTypes: ['Notification', 'NotificationStats'],
  endpoints: (builder) => ({
    getNotificationStats: builder.query<NotificationStats, void>({
      queryFn: async () => {
        const total = mockNotifications.length;
        const unread = mockNotifications.filter((n) => n.status === 'SENT' && n.readCount < n.deliveryCount).length;
        const scheduled = mockNotifications.filter((n) => n.status === 'SCHEDULED').length;
        const failed = mockNotifications.filter((n) => n.status === 'FAILED').length;

        const stats: NotificationStats = {
          totalNotifications: total,
          unreadNotifications: unread,
          scheduledNotifications: scheduled,
          failedNotifications: failed,
          pushSuccessRate: 98.4,
          emailSuccessRate: 99.1,
          smsSuccessRate: 97.8,
          deliveryTrend: [
            { date: '03/07', sent: 120, failed: 2 },
            { date: '04/07', sent: 180, failed: 5 },
            { date: '05/07', sent: 240, failed: 1 },
            { date: '06/07', sent: 190, failed: 3 },
            { date: '07/07', sent: 310, failed: 4 },
            { date: '08/07', sent: 420, failed: 8 },
            { date: '09/07', sent: 380, failed: 2 },
          ],
        };
        return { data: stats };
      },
      providesTags: ['NotificationStats'],
    }),

    getNotifications: builder.query<{ content: NotificationItem[]; totalElements: number; totalPages: number }, NotificationFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockNotifications];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter((n) => n.title.toLowerCase().includes(s) || n.message.toLowerCase().includes(s));
        }
        if (filters.channel) {
          filtered = filtered.filter((n) => n.channel === filters.channel);
        }
        if (filters.priority) {
          filtered = filtered.filter((n) => n.priority === filters.priority);
        }
        if (filters.status) {
          filtered = filtered.filter((n) => n.status === filters.status);
        }
        if (filters.recipientType) {
          filtered = filtered.filter((n) => n.recipientType === filters.recipientType);
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
      providesTags: ['Notification'],
    }),

    createNotification: builder.mutation<NotificationItem, Partial<NotificationItem>>({
      queryFn: async (body) => {
        const newItem: NotificationItem = {
          id: mockNotifications.length + 1,
          title: body.title || 'Thông báo mới',
          message: body.message || '',
          channel: body.channel || 'IN_APP',
          priority: body.priority || 'NORMAL',
          recipientType: body.recipientType || 'ALL_USERS',
          status: body.status || 'DRAFT',
          scheduledTime: body.scheduledTime,
          sentTime: body.status === 'SENT' ? new Date().toISOString() : undefined,
          createdBy: body.createdBy || 'Quản trị viên',
          expirationTime: body.expirationTime,
          deepLink: body.deepLink,
          actionButtonText: body.actionButtonText,
          attachments: body.attachments,
          deliveryCount: body.status === 'SENT' ? 100 : 0,
          readCount: 0,
        };
        mockNotifications.unshift(newItem);
        return { data: newItem };
      },
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    updateNotification: builder.mutation<NotificationItem, { id: number; data: Partial<NotificationItem> }>({
      queryFn: async ({ id, data }) => {
        const idx = mockNotifications.findIndex((n) => n.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockNotifications[idx] = { ...mockNotifications[idx], ...data };
        return { data: mockNotifications[idx] };
      },
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),

    deleteNotification: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockNotifications = mockNotifications.filter((n) => n.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['Notification', 'NotificationStats'],
    }),
  }),
});

export const {
  useGetNotificationStatsQuery,
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
} = notificationApi;
