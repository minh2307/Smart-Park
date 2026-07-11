import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { PushNotificationConfig, PushNotificationFilters } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockPushConfigs: PushNotificationConfig[] = [
  {
    id: 1,
    title: 'Khuyến mãi đặc biệt: Giảm 50% vé công viên nước',
    body: 'Duy nhất khung giờ vàng 12h - 14h hôm nay, nhận ngay ưu đãi cực sốc. Click nhận vé ngay!',
    imageUrl: 'https://picsum.photos/seed/waterpark/300/200',
    deepLink: '/promotions/waterpark-50',
    actionButtonText: 'Nhận Ngay',
    isSilent: false,
    topic: 'all-users',
    sentCount: 15400,
    clickCount: 2310,
    createdAt: '2026-07-09T08:00:00Z',
    sentAt: '2026-07-09T12:00:00Z',
  },
  {
    id: 2,
    title: 'Đồng bộ dữ liệu thiết bị ngoại vi',
    body: 'Silent sync packet for access gates',
    isSilent: true,
    targetGroup: 'staff-devices',
    sentCount: 45,
    clickCount: 0,
    createdAt: '2026-07-09T14:00:00Z',
    sentAt: '2026-07-09T14:00:05Z',
  },
  {
    id: 3,
    title: 'Chào mừng Hội viên VIP Diamond mới!',
    body: 'Cảm ơn quý khách đã đồng hành cùng SmartPark. Chúc mừng quý khách đã thăng hạng thẻ Kim Cương.',
    deepLink: '/memberships/vip',
    actionButtonText: 'Xem Đặc Quyền',
    isSilent: false,
    topic: 'vip-members',
    sentCount: 150,
    clickCount: 88,
    createdAt: '2026-07-09T15:30:00Z',
  },
];

export const pushApi = createApi({
  reducerPath: 'pushApi',
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
  tagTypes: ['PushNotification'],
  endpoints: (builder) => ({
    getPushNotifications: builder.query<{ content: PushNotificationConfig[]; totalElements: number; totalPages: number }, PushNotificationFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockPushConfigs];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter((p) => p.title.toLowerCase().includes(s) || p.body.toLowerCase().includes(s));
        }
        if (filters.topic) {
          filtered = filtered.filter((p) => p.topic === filters.topic);
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
      providesTags: ['PushNotification'],
    }),

    sendPushNotification: builder.mutation<PushNotificationConfig, Partial<PushNotificationConfig>>({
      queryFn: async (body) => {
        const newPush: PushNotificationConfig = {
          id: mockPushConfigs.length + 1,
          title: body.title || 'Thông báo đẩy',
          body: body.body || '',
          imageUrl: body.imageUrl,
          deepLink: body.deepLink,
          actionButtonText: body.actionButtonText,
          isSilent: body.isSilent || false,
          topic: body.topic,
          targetGroup: body.targetGroup,
          sentCount: Math.floor(50 + Math.random() * 500),
          clickCount: 0,
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString(),
        };
        mockPushConfigs.unshift(newPush);
        return { data: newPush };
      },
      invalidatesTags: ['PushNotification'],
    }),

    deletePushNotification: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockPushConfigs = mockPushConfigs.filter((p) => p.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['PushNotification'],
    }),
  }),
});

export const {
  useGetPushNotificationsQuery,
  useSendPushNotificationMutation,
  useDeletePushNotificationMutation,
} = pushApi;
