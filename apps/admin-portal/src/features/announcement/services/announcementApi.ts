import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Announcement, AnnouncementFilters } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Khai trương Khu Ẩm Thực F&B Phố Cổ mới',
    content: 'GateOS xin hân hạnh giới thiệu khu phố ẩm thực mang đậm kiến trúc Hà Nội xưa với hơn 30 gian hàng truyền thống phong phú.',
    status: 'PUBLISHED',
    isPinned: true,
    targetAudience: 'ALL_USERS',
    venueId: 1,
    venueName: 'K khu ẩm thực A',
    publishTime: '2026-07-08T09:00:00Z',
    bannerImage: 'https://picsum.photos/seed/foodcourt/1200/400',
    createdBy: 'Nguyễn Văn Minh (Admin)',
    createdAt: '2026-07-08T08:30:00Z',
  },
  {
    id: 2,
    title: 'Thông báo: Tạm dừng hoạt động Đu Quay Cao Tốc từ ngày 10/07',
    content: 'Đu quay cao tốc sẽ tạm dừng phục vụ để kiểm tra an toàn hệ thống phanh thủy lực định kỳ. Dự kiến mở cửa lại vào ngày 12/07.',
    status: 'PUBLISHED',
    isPinned: false,
    targetAudience: 'VISITORS',
    rideId: 2,
    rideName: 'Tàu lượn siêu tốc',
    publishTime: '2026-07-09T08:00:00Z',
    bannerImage: 'https://picsum.photos/seed/maintenance/1200/400',
    createdBy: 'Ban Kỹ Thuật An Toàn',
    createdAt: '2026-07-09T07:45:00Z',
  },
  {
    id: 3,
    title: 'Sự kiện Đón Mùa Hè Rực Rỡ cùng Đêm Nhạc EDM',
    content: 'Đăng ký vé tham gia sự kiện đại nhạc hội EDM ngoài trời diễn ra vào 20:00 thứ Bảy tuần này tại Quảng trường Trung tâm.',
    status: 'DRAFT',
    isPinned: false,
    targetAudience: 'MEMBERS',
    publishTime: '2026-07-12T20:00:00Z',
    bannerImage: 'https://picsum.photos/seed/edm/1200/400',
    createdBy: 'Phòng Truyền Thông',
    createdAt: '2026-07-09T10:00:00Z',
  },
];

export const announcementApi = createApi({
  reducerPath: 'announcementApi',
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
  tagTypes: ['Announcement'],
  endpoints: (builder) => ({
    getAnnouncements: builder.query<{ content: Announcement[]; totalElements: number; totalPages: number }, AnnouncementFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockAnnouncements];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter((a) => a.title.toLowerCase().includes(s) || a.content.toLowerCase().includes(s));
        }
        if (filters.status) {
          filtered = filtered.filter((a) => a.status === filters.status);
        }
        if (filters.venueId) {
          filtered = filtered.filter((a) => a.venueId === filters.venueId);
        }
        if (filters.rideId) {
          filtered = filtered.filter((a) => a.rideId === filters.rideId);
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
      providesTags: ['Announcement'],
    }),

    createAnnouncement: builder.mutation<Announcement, Partial<Announcement>>({
      queryFn: async (body) => {
        const newAnn: Announcement = {
          id: mockAnnouncements.length + 1,
          title: body.title || 'Thông báo mới',
          content: body.content || '',
          status: body.status || 'DRAFT',
          isPinned: body.isPinned || false,
          targetAudience: body.targetAudience || 'ALL_USERS',
          venueId: body.venueId,
          venueName: body.venueName,
          rideId: body.rideId,
          rideName: body.rideName,
          publishTime: body.publishTime || new Date().toISOString(),
          expirationTime: body.expirationTime,
          bannerImage: body.bannerImage || 'https://picsum.photos/seed/ann/1200/400',
          attachments: body.attachments,
          createdBy: body.createdBy || 'Quản trị viên',
          createdAt: new Date().toISOString(),
        };
        mockAnnouncements.unshift(newAnn);
        return { data: newAnn };
      },
      invalidatesTags: ['Announcement'],
    }),

    updateAnnouncement: builder.mutation<Announcement, { id: number; data: Partial<Announcement> }>({
      queryFn: async ({ id, data }) => {
        const idx = mockAnnouncements.findIndex((a) => a.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockAnnouncements[idx] = { ...mockAnnouncements[idx], ...data };
        return { data: mockAnnouncements[idx] };
      },
      invalidatesTags: ['Announcement'],
    }),

    deleteAnnouncement: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockAnnouncements = mockAnnouncements.filter((a) => a.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['Announcement'],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = announcementApi;
