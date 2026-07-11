import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Feedback, FeedbackFilters } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockFeedbacks: Feedback[] = [
  {
    id: 1,
    customerName: 'Nguyễn Minh Anh',
    customerEmail: 'minhanh.nguyen@gmail.com',
    bookingCode: 'BK-1002',
    rating: 5,
    category: 'RIDE',
    content: 'Tàu lượn siêu tốc rất phê, nhân viên hướng dẫn nhiệt tình và thắt đai an toàn cẩn thận. Sẽ quay lại lần sau!',
    status: 'RESOLVED',
    assignedStaff: 'Lê Văn Tám',
    replyContent: 'Cảm ơn quý khách đã có phản hồi tích cực về trò chơi của chúng tôi!',
    repliedAt: '2026-07-09T09:00:00Z',
    createdAt: '2026-07-09T08:30:00Z',
  },
  {
    id: 2,
    customerName: 'Trần Hoàng Long',
    customerEmail: 'longth.tran@hotmail.com',
    bookingCode: 'BK-9982',
    rating: 3,
    category: 'RESTAURANT',
    content: 'Phở Sen Hồ Tây nước dùng ngon nhưng xếp hàng lâu quá, khu ăn uống hơi đông đúc vào giờ trưa.',
    status: 'PENDING',
    createdAt: '2026-07-09T11:45:00Z',
  },
  {
    id: 3,
    customerName: 'Lê Thị Mai',
    customerEmail: 'mailt.le@yahoo.com',
    rating: 2,
    category: 'PARKING',
    content: 'Chỉ dẫn đỗ xe thông minh chưa cập nhật đúng trạng thái slot trống, tôi chạy lòng vòng 15 phút mới tìm được chỗ đỗ.',
    status: 'REPLIED',
    assignedStaff: 'Nguyễn Văn Hải',
    replyContent: 'Rất tiếc về trải nghiệm bất tiện của chị. Chúng tôi đang kiểm tra lại cảm biến slot đỗ xe khu A để khắc phục ngay.',
    repliedAt: '2026-07-09T14:30:00Z',
    createdAt: '2026-07-09T13:00:00Z',
  },
  {
    id: 4,
    customerName: 'Hoàng Văn Cường',
    customerEmail: 'cuonghv.dev@gmail.com',
    bookingCode: 'BK-5401',
    rating: 4,
    category: 'APPLICATION',
    content: 'App đặt vé nhanh, UI mượt mà. Tuy nhiên cần thêm tính năng lưu thông tin thẻ để không phải nhập lại mỗi lần mua.',
    status: 'PENDING',
    createdAt: '2026-07-09T15:00:00Z',
  },
];

export const feedbackApi = createApi({
  reducerPath: 'feedbackApi',
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
  tagTypes: ['Feedback'],
  endpoints: (builder) => ({
    getFeedbacks: builder.query<{ content: Feedback[]; totalElements: number; totalPages: number }, FeedbackFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockFeedbacks];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (f) =>
              f.customerName.toLowerCase().includes(s) ||
              f.content.toLowerCase().includes(s) ||
              f.customerEmail.toLowerCase().includes(s)
          );
        }
        if (filters.category) {
          filtered = filtered.filter((f) => f.category === filters.category);
        }
        if (filters.status) {
          filtered = filtered.filter((f) => f.status === filters.status);
        }
        if (filters.rating) {
          filtered = filtered.filter((f) => f.rating === filters.rating);
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
      providesTags: ['Feedback'],
    }),

    replyToFeedback: builder.mutation<Feedback, { id: number; replyContent: string; staffName: string }>({
      queryFn: async ({ id, replyContent, staffName }) => {
        const idx = mockFeedbacks.findIndex((f) => f.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockFeedbacks[idx] = {
          ...mockFeedbacks[idx],
          replyContent,
          assignedStaff: staffName,
          status: 'REPLIED',
          repliedAt: new Date().toISOString(),
        };
        return { data: mockFeedbacks[idx] };
      },
      invalidatesTags: ['Feedback'],
    }),

    resolveFeedback: builder.mutation<Feedback, number>({
      queryFn: async (id) => {
        const idx = mockFeedbacks.findIndex((f) => f.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockFeedbacks[idx] = {
          ...mockFeedbacks[idx],
          status: 'RESOLVED',
        };
        return { data: mockFeedbacks[idx] };
      },
      invalidatesTags: ['Feedback'],
    }),

    deleteFeedback: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockFeedbacks = mockFeedbacks.filter((f) => f.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['Feedback'],
    }),
  }),
});

export const {
  useGetFeedbacksQuery,
  useReplyToFeedbackMutation,
  useResolveFeedbackMutation,
  useDeleteFeedbackMutation,
} = feedbackApi;
