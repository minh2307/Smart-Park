import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { KBArticle, KBArticleFilters } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockArticles: KBArticle[] = [
  {
    id: 1,
    title: 'Hướng dẫn hoàn tiền vé khi gặp sự cố thời tiết',
    content: 'Khi công viên nước hoặc các trò chơi cảm giác mạnh đóng cửa do giông bão, lốc xoáy hoặc điều kiện bất khả kháng:\n1. Khách hàng vui lòng mang vé QR code đến quầy dịch vụ khách hàng (CSKH) gần nhất.\n2. Xuất trình thẻ hội viên hoặc tài khoản GateOS đã dùng để thanh toán.\n3. Tiền hoàn trả sẽ được chuyển vào ví điểm loyalty hoặc tài khoản ngân hàng liên kết trong vòng 48 giờ.',
    category: 'REFUNDS',
    tags: ['hoàn tiền', 'thời tiết', 'chính sách', 'hủy vé'],
    status: 'PUBLISHED',
    version: 1,
    viewCount: 154,
    helpfulCount: 42,
    updatedAt: '2026-07-09T08:00:00Z',
    updatedBy: 'Nguyễn Văn Minh (CSKH)',
  },
  {
    id: 2,
    title: 'Các điều kiện và quyền lợi của Thẻ Hội Viên Diamond',
    content: 'Thẻ Diamond là hạng thẻ cao cấp nhất của GateOS SmartPark. Đặc quyền Diamond bao gồm:\n- Lối đi ưu tiên riêng tại tất cả các trò chơi (Express Lane).\n- Miễn phí giữ xe thông minh trọn năm.\n- Tích lũy 10% điểm loyalty trên mọi giao dịch mua vé, ăn uống và retail.\n- Tặng voucher sinh nhật trị giá 1.000.000đ.',
    category: 'MEMBERSHIPS',
    tags: ['hội viên', 'diamond', 'đặc quyền', 'diamond card'],
    status: 'PUBLISHED',
    version: 2,
    viewCount: 320,
    helpfulCount: 105,
    updatedAt: '2026-07-09T10:30:00Z',
    updatedBy: 'Phạm Thị Thủy (Loyalty)',
  },
  {
    id: 3,
    title: 'Quy trình xử lý khi phát hiện tài sản thất lạc',
    content: 'Nhân viên và khách hàng khi phát hiện tài sản vô chủ tại bãi đỗ xe hoặc khu vực trò chơi:\n1. Báo ngay cho đội bảo vệ tuần tra hoặc CSKH gần nhất.\n2. Lập biên bản niêm phong tài sản có chữ ký chứng kiến.\n3. Chuyển tài sản vào kho Lost & Found tại cổng chính và đăng thông tin lên mục Thất lạc tài sản của GateOS.',
    category: 'SAFETY',
    tags: ['thất lạc', 'lost found', 'an ninh', 'tài sản'],
    status: 'DRAFT',
    version: 1,
    viewCount: 0,
    helpfulCount: 0,
    updatedAt: '2026-07-09T14:00:00Z',
    updatedBy: 'Trần Thanh Sơn (Security)',
  },
];

export const knowledgeBaseApi = createApi({
  reducerPath: 'knowledgeBaseApi',
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
  tagTypes: ['KBArticle'],
  endpoints: (builder) => ({
    getArticles: builder.query<{ content: KBArticle[]; totalElements: number; totalPages: number }, KBArticleFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockArticles];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (a) =>
              a.title.toLowerCase().includes(s) ||
              a.content.toLowerCase().includes(s) ||
              a.tags.some((t) => t.toLowerCase().includes(s))
          );
        }
        if (filters.category) {
          filtered = filtered.filter((a) => a.category === filters.category);
        }
        if (filters.status) {
          filtered = filtered.filter((a) => a.status === filters.status);
        }
        if (filters.tag) {
          filtered = filtered.filter((a) => a.tags.includes(filters.tag!));
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
      providesTags: ['KBArticle'],
    }),

    createArticle: builder.mutation<KBArticle, Partial<KBArticle>>({
      queryFn: async (body) => {
        const newArticle: KBArticle = {
          id: mockArticles.length + 1,
          title: body.title || 'Bài viết mới',
          content: body.content || '',
          category: body.category || 'GENERAL',
          tags: body.tags || [],
          status: body.status || 'DRAFT',
          version: 1,
          viewCount: 0,
          helpfulCount: 0,
          attachments: body.attachments,
          relatedArticleIds: body.relatedArticleIds,
          updatedAt: new Date().toISOString(),
          updatedBy: body.updatedBy || 'Quản trị viên',
        };
        mockArticles.unshift(newArticle);
        return { data: newArticle };
      },
      invalidatesTags: ['KBArticle'],
    }),

    updateArticle: builder.mutation<KBArticle, { id: number; data: Partial<KBArticle> }>({
      queryFn: async ({ id, data }) => {
        const idx = mockArticles.findIndex((a) => a.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockArticles[idx] = {
          ...mockArticles[idx],
          ...data,
          version: mockArticles[idx].version + 1,
          updatedAt: new Date().toISOString(),
        };
        return { data: mockArticles[idx] };
      },
      invalidatesTags: ['KBArticle'],
    }),

    markArticleHelpful: builder.mutation<KBArticle, number>({
      queryFn: async (id) => {
        const idx = mockArticles.findIndex((a) => a.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockArticles[idx].helpfulCount += 1;
        return { data: mockArticles[idx] };
      },
      invalidatesTags: ['KBArticle'],
    }),

    deleteArticle: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockArticles = mockArticles.filter((a) => a.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['KBArticle'],
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useMarkArticleHelpfulMutation,
  useDeleteArticleMutation,
} = knowledgeBaseApi;
