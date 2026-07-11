import { baseApi } from '../../../store/api/baseApi';

export interface Venue {
  id: number;
  name: string;
  code: string;
  address: string;
  description: string;
  maxCapacity: number;
  status: number; // 1 for ACTIVE, 0 for CLOSED
}

export interface Attraction {
  id: number;
  venueId: number;
  name: string;
  code: string;
  description: string;
  capacity: number;
  minHeight?: number;
  maxHeight?: number;
  durationSeconds?: number;
  status: string;
}

export interface TicketType {
  id: number;
  venueId: number;
  name: string;
  description: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  type: string;
  status: string;
}

export interface Promotion {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discountType: string;
  value: number;
  status: string;
}

export interface Feedback {
  id: number;
  customerName?: string;
  category: string;
  content: string;
  rating: number;
  status: string;
}

export interface RecommendedItem {
  id: number;
  title: string;
  category: string;
  image: string;
  matchScore: number;
  tags: string[];
}

export const homeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVenues: builder.query<Venue[], void>({
      query: () => ({
        url: '/venues',
        params: { size: 100 },
      }),
      transformResponse: (response: any) => response.data?.content ?? response.data ?? [],
      providesTags: ['Venues'],
    }),

    getVenueAttractions: builder.query<Attraction[], number>({
      query: (venueId) => ({
        url: `/venues/${venueId}/attractions`,
      }),
      transformResponse: (response: any) => response.data ?? [],
      providesTags: ['Attractions'],
    }),

    getVenueTicketTypes: builder.query<TicketType[], number>({
      query: (venueId) => ({
        url: `/venues/${venueId}/ticket-types`,
      }),
      transformResponse: (response: any) => response.data ?? [],
    }),

    getPromotions: builder.query<Promotion[], void>({
      query: () => ({
        url: '/promotions',
        params: { size: 100 },
      }),
      transformResponse: (response: any) => response.data?.content ?? response.data ?? [],
      providesTags: ['Promotions'],
    }),

    getFeedbacks: builder.query<Feedback[], void>({
      query: () => ({
        url: '/feedbacks',
        params: { size: 10 },
      }),
      transformResponse: (response: any) => {
        const list = response.data?.content ?? response.data ?? [];
        return list.map((f: any) => ({
          id: f.id,
          customerName: f.customer?.fullName ?? 'Khách hàng ẩn danh',
          category: f.category,
          content: f.content,
          rating: f.rating,
          status: f.status,
        }));
      },
      providesTags: ['Feedbacks'],
    }),

    getRecommendedAttractions: builder.query<RecommendedItem[], { category?: string }>({
      query: ({ category } = {}) => ({
        url: '/ai/recommendation/attractions',
        params: category ? { category } : undefined,
      }),
      transformResponse: (response: any) => response.data ?? [],
      providesTags: ['Recommendations'],
    }),

    getRecommendedTickets: builder.query<RecommendedItem[], void>({
      query: () => ({
        url: '/ai/recommendation/tickets',
      }),
      transformResponse: (response: any) => response.data ?? [],
    }),

    getRecommendedCombos: builder.query<RecommendedItem[], void>({
      query: () => ({
        url: '/ai/recommendation/combo',
      }),
      transformResponse: (response: any) => response.data ?? [],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVenuesQuery,
  useGetVenueAttractionsQuery,
  useGetVenueTicketTypesQuery,
  useGetPromotionsQuery,
  useGetFeedbacksQuery,
  useGetRecommendedAttractionsQuery,
  useGetRecommendedTicketsQuery,
  useGetRecommendedCombosQuery,
} = homeApi;
