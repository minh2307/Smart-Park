import { baseApi } from '../../../store/api/baseApi';
import type { Notification, Feedback, Incident, Zone, Park, FAQ, ContactInfo } from '../types/engagement.types';

export interface PaginatedResponse<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty: boolean;
}

export const engagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Notifications Endpoints
    getNotifications: builder.query<PaginatedResponse<Notification>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 50 } = {}) => ({
        url: '/notifications',
        method: 'GET',
        params: { page, size },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Notifications' as const, id })),
              { type: 'Notifications' as const, id: 'LIST' },
            ]
          : [{ type: 'Notifications' as const, id: 'LIST' }],
    }),
    createNotification: builder.mutation<Notification, Partial<Notification>>({
      query: (notification) => ({
        url: '/notifications',
        method: 'POST',
        data: notification,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'Notifications' as const, id: 'LIST' }],
    }),

    // Feedbacks Endpoints
    getFeedbacks: builder.query<PaginatedResponse<Feedback>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 50 } = {}) => ({
        url: '/feedbacks',
        method: 'GET',
        params: { page, size },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Feedbacks' as const, id })),
              { type: 'Feedbacks' as const, id: 'LIST' },
            ]
          : [{ type: 'Feedbacks' as const, id: 'LIST' }],
    }),
    submitFeedback: builder.mutation<Feedback, Feedback>({
      query: (feedback) => ({
        url: '/feedbacks',
        method: 'POST',
        data: feedback,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'Feedbacks' as const, id: 'LIST' }],
    }),

    // Incidents (Support Tickets) Endpoints
    getIncidents: builder.query<PaginatedResponse<Incident>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 50 } = {}) => ({
        url: '/incidents',
        method: 'GET',
        params: { page, size },
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Incidents' as const, id })),
              { type: 'Incidents' as const, id: 'LIST' },
            ]
          : [{ type: 'Incidents' as const, id: 'LIST' }],
    }),
    submitIncident: builder.mutation<Incident, Incident>({
      query: (incident) => ({
        url: '/incidents',
        method: 'POST',
        data: incident,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'Incidents' as const, id: 'LIST' }],
    }),

    // Parks and Zones
    getParks: builder.query<PaginatedResponse<Park>, void>({
      query: () => ({
        url: '/parks',
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
      providesTags: [{ type: 'Parks' as const, id: 'LIST' }],
    }),
    getZonesByPark: builder.query<Zone[], number>({
      query: (parkId) => ({
        url: `/parks/${parkId}/zones`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, parkId) => [{ type: 'Zones' as const, id: parkId }],
    }),

    // Static FAQs Center via queryFn (simulates API cache & state)
    getFAQs: builder.query<FAQ[], void>({
      queryFn: () => {
        const faqs: FAQ[] = [
          {
            id: 1,
            category: 'Vé & Đặt vé',
            question: 'Tôi có thể đổi ngày sử dụng vé sau khi thanh toán không?',
            answer: 'Được hỗ trợ thay đổi ngày sử dụng vé 1 lần trước 24 giờ kể từ thời điểm mở cửa của ngày ghi trên vé. Vui lòng liên hệ Hotline hỗ trợ hoặc trực tiếp tại quầy CSKH của Smart Park để thực hiện.',
          },
          {
            id: 2,
            category: 'Vé & Đặt vé',
            question: 'Vé giữ chỗ (Booking) có thời gian thanh toán tối đa là bao lâu?',
            answer: 'Khi bạn thực hiện đặt giữ vé nhưng chưa thanh toán, hệ thống sẽ bảo lưu trạng thái đặt chỗ trong vòng 15 phút. Quá thời hạn này, vé sẽ được giải phóng lại giỏ hàng chung.',
          },
          {
            id: 3,
            category: 'Hoạt động & Trò chơi',
            question: 'Làm thế nào để biết thông tin bảo trì của các trò chơi?',
            answer: 'Thông tin bảo trì của các trò chơi hoặc khu vực cụ thể sẽ được cập nhật trực tiếp tại mục "Khám phá" và gửi thông báo qua Notification Center đến người dùng. Bạn cũng có thể xem trạng thái trực tiếp của trò chơi trước khi mua vé.',
          },
          {
            id: 4,
            category: 'Quy định & An toàn',
            question: 'Trẻ em dưới bao nhiêu mét được miễn phí vé vào cổng?',
            answer: 'Trẻ em có chiều cao dưới 1.0m sẽ được miễn phí vé vào cổng chung. Đối với các trò chơi cảm giác mạnh, quy định an toàn chiều cao riêng sẽ được áp dụng trực tiếp tại mỗi cổng trò chơi.',
          },
          {
            id: 5,
            category: 'Thành viên & Ưu đãi',
            question: 'Tôi được tích lũy điểm thưởng như thế nào?',
            answer: 'Với mỗi giao dịch mua vé hoặc sử dụng dịch vụ ăn uống, bán lẻ thành công qua Smart Park, bạn sẽ tích lũy được 1% giá trị giao dịch dưới dạng Điểm thưởng thành viên. Điểm thưởng này có thể quy đổi sang Voucher mua sắm.',
          },
          {
            id: 6,
            category: 'Hỗ trợ kỹ thuật',
            question: 'Nếu giao dịch thanh toán bị trừ tiền nhưng chưa nhận được mã vé?',
            answer: 'Hệ thống cần từ 1-3 phút để xác nhận giao dịch từ ngân hàng. Nếu sau 5 phút bạn vẫn chưa thấy vé xuất hiện trong "Ví vé", vui lòng chụp biên lai giao dịch và gửi yêu cầu Hỗ trợ (Tạo Ticket) hoặc gọi Hotline 1900-8888 để được giải quyết ngay lập tức.',
          },
        ];
        return { data: faqs };
      },
    }),

    // Static Contact Info via queryFn
    getContactInfo: builder.query<ContactInfo, void>({
      queryFn: () => {
        const contact: ContactInfo = {
          hotline: '1900-8888',
          email: 'support@smartpark.com',
          address: 'Khu công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội, Việt Nam',
          openingHours: '08:00 - 22:00 hàng ngày (kể cả Lễ, Tết)',
          socials: {
            facebook: 'https://facebook.com/smartpark',
            youtube: 'https://youtube.com/smartpark',
            tiktok: 'https://tiktok.com/@smartpark',
          },
        };
        return { data: contact };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useGetFeedbacksQuery,
  useSubmitFeedbackMutation,
  useGetIncidentsQuery,
  useSubmitIncidentMutation,
  useGetParksQuery,
  useGetZonesByParkQuery,
  useGetFAQsQuery,
  useGetContactInfoQuery,
} = engagementApi;
