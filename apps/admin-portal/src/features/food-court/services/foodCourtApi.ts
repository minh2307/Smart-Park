import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import {
  Restaurant,
  MenuItem,
  FoodCourtDashboardStats,
  RestaurantFilters,
  MenuItemFilters,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// In-memory mock data matching features requirements
export let mockRestaurants: Restaurant[] = [
  {
    id: 1,
    restaurantCode: 'RES-PHO01',
    restaurantName: 'Phở Sen Hồ Tây',
    venueId: 1,
    venueName: 'Khu Ẩm Thực A',
    location: 'Gian số 101, Tầng 1',
    businessHours: '08:00 - 22:00',
    manager: 'Nguyễn Văn Hải',
    status: 'ACTIVE',
    revenue: 12450000,
    ordersCount: 245,
    queueLength: 3,
  },
  {
    id: 2,
    restaurantCode: 'RES-BBQ02',
    restaurantName: 'K-BBQ Express',
    venueId: 1,
    venueName: 'Khu Ẩm Thực A',
    location: 'Gian số 102, Tầng 1',
    businessHours: '10:00 - 22:00',
    manager: 'Trần Thị Mai',
    status: 'ACTIVE',
    revenue: 18900000,
    ordersCount: 310,
    queueLength: 5,
  },
  {
    id: 3,
    restaurantCode: 'RES-PIZ03',
    restaurantName: 'Pizza & Pasta Italian',
    venueId: 2,
    venueName: 'Khu Ẩm Thực B',
    location: 'Gian số 201, Tầng 2',
    businessHours: '09:00 - 21:30',
    manager: 'Lê Hoàng Long',
    status: 'ACTIVE',
    revenue: 9350000,
    ordersCount: 128,
    queueLength: 1,
  },
  {
    id: 4,
    restaurantCode: 'RES-BAK04',
    restaurantName: 'Paris Baguette Corner',
    venueId: 2,
    venueName: 'Khu Ẩm Thực B',
    location: 'Gian số 202, Tầng 2',
    businessHours: '07:30 - 21:00',
    manager: 'Phạm Minh Tuyến',
    status: 'MAINTENANCE',
    revenue: 4200000,
    ordersCount: 95,
    queueLength: 0,
  },
];

export let mockMenuItems: MenuItem[] = [
  {
    id: 1,
    restaurantId: 1,
    restaurantName: 'Phở Sen Hồ Tây',
    categoryName: 'Phở & Bún',
    itemName: 'Phở Bò Tái Lăn',
    image: 'https://picsum.photos/seed/phobo/300/200',
    description: 'Bánh phở tươi ngon kết hợp thịt bò tái lăn đậm vị, thơm lừng vị gừng tỏi.',
    price: 65000,
    discount: 5,
    preparationTime: 5,
    calories: 450,
    status: 'AVAILABLE',
  },
  {
    id: 2,
    restaurantId: 1,
    restaurantName: 'Phở Sen Hồ Tây',
    categoryName: 'Phở & Bún',
    itemName: 'Phở Gà Ta Lườn',
    image: 'https://picsum.photos/seed/phoga/300/200',
    description: 'Thịt gà ta giòn dai, nước dùng thanh ngọt tự nhiên.',
    price: 55000,
    discount: 0,
    preparationTime: 4,
    calories: 380,
    status: 'AVAILABLE',
  },
  {
    id: 3,
    restaurantId: 2,
    restaurantName: 'K-BBQ Express',
    categoryName: 'Nướng Hàn Quốc',
    itemName: 'Cơm Trộn Bò Bulgogi',
    image: 'https://picsum.photos/seed/bibimbap/300/200',
    description: 'Cơm trộn thố đá kèm rau củ tươi, trứng ốp và thịt bò sốt Hàn Quốc.',
    price: 89000,
    discount: 10,
    preparationTime: 12,
    calories: 620,
    status: 'AVAILABLE',
  },
  {
    id: 4,
    restaurantId: 2,
    restaurantName: 'K-BBQ Express',
    categoryName: 'Nướng Hàn Quốc',
    itemName: 'Ba Chỉ Bò Mỹ Nướng Sốt',
    image: 'https://picsum.photos/seed/bbqbeef/300/200',
    description: 'Ba chỉ bò cuộn nướng chín vàng đều cùng sốt chấm đặc trưng.',
    price: 139000,
    discount: 0,
    preparationTime: 15,
    calories: 780,
    status: 'AVAILABLE',
  },
  {
    id: 5,
    restaurantId: 3,
    restaurantName: 'Pizza & Pasta Italian',
    categoryName: 'Pizza & Mỳ Ý',
    itemName: 'Pizza Seafood Pesto',
    image: 'https://picsum.photos/seed/pizza/300/200',
    description: 'Pizza đế mỏng giòn, tôm mực tươi ngon cùng sốt pesto húng tây.',
    price: 185000,
    discount: 15,
    preparationTime: 18,
    calories: 890,
    status: 'AVAILABLE',
  },
  {
    id: 6,
    restaurantId: 3,
    restaurantName: 'Pizza & Pasta Italian',
    categoryName: 'Pizza & Mỳ Ý',
    itemName: 'Mỳ Ý Sốt Kem Carbonara',
    image: 'https://picsum.photos/seed/pasta/300/200',
    description: 'Sợi mỳ dẹt sốt kem béo ngậy kèm ba rọi xông khói áp chảo giòn tan.',
    price: 120000,
    discount: 0,
    preparationTime: 10,
    calories: 680,
    status: 'OUT_OF_STOCK',
  },
];

export const foodCourtApi = createApi({
  reducerPath: 'foodCourtApi',
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
  tagTypes: ['Restaurant', 'MenuItem', 'FoodCourtStats'],
  endpoints: (builder) => ({
    getFoodCourtStats: builder.query<FoodCourtDashboardStats, void>({
      queryFn: async () => {
        const totalRestaurants = mockRestaurants.length;
        const activeRestaurants = mockRestaurants.filter((r) => r.status === 'ACTIVE').length;
        const dailyRevenue = mockRestaurants.reduce((sum, r) => sum + r.revenue, 0);
        const ordersToday = mockRestaurants.reduce((sum, r) => sum + r.ordersCount, 0);
        const totalQueueLength = mockRestaurants.reduce((sum, r) => sum + r.queueLength, 0);

        const stats: FoodCourtDashboardStats = {
          totalRestaurants,
          activeRestaurants,
          dailyRevenue,
          ordersToday,
          bestSellingItems: [
            { name: 'Cơm Trộn Bò Bulgogi', salesCount: 152, revenue: 13528000 },
            { name: 'Phở Bò Tái Lăn', salesCount: 140, revenue: 9100000 },
            { name: 'Pizza Seafood Pesto', salesCount: 88, revenue: 16280000 },
          ],
          occupancyRate: 78.5,
          averageQueueLength: totalRestaurants > 0 ? Number((totalQueueLength / totalRestaurants).toFixed(1)) : 0,
          revenueTrend: [
            { date: '03/07', amount: 32000000 },
            { date: '04/07', amount: 41000000 },
            { date: '05/07', amount: 38000000 },
            { date: '06/07', amount: 29000000 },
            { date: '07/07', amount: 35000000 },
            { date: '08/07', amount: 48000000 },
            { date: '09/07', amount: dailyRevenue },
          ],
        };

        return { data: stats };
      },
      providesTags: ['FoodCourtStats'],
    }),

    getRestaurants: builder.query<{ content: Restaurant[]; totalElements: number; totalPages: number }, RestaurantFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockRestaurants];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (r) =>
              r.restaurantName.toLowerCase().includes(s) ||
              r.restaurantCode.toLowerCase().includes(s) ||
              r.manager.toLowerCase().includes(s)
          );
        }
        if (filters.status) {
          filtered = filtered.filter((r) => r.status === filters.status);
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
      providesTags: ['Restaurant'],
    }),

    createRestaurant: builder.mutation<Restaurant, Partial<Restaurant>>({
      queryFn: async (body) => {
        const newRes: Restaurant = {
          id: mockRestaurants.length + 1,
          restaurantCode: body.restaurantCode || `RES-${Math.floor(1000 + Math.random() * 9000)}`,
          restaurantName: body.restaurantName || 'Nhà hàng mới',
          venueId: body.venueId || 1,
          venueName: body.venueId === 2 ? 'Khu Ẩm Thực B' : 'Khu Ẩm Thực A',
          location: body.location || 'Gian số mới',
          businessHours: body.businessHours || '08:00 - 22:00',
          manager: body.manager || 'N/A',
          status: 'ACTIVE',
          revenue: 0,
          ordersCount: 0,
          queueLength: 0,
        };
        mockRestaurants.push(newRes);
        return { data: newRes };
      },
      invalidatesTags: ['Restaurant', 'FoodCourtStats'],
    }),

    updateRestaurant: builder.mutation<Restaurant, { id: number; data: Partial<Restaurant> }>({
      queryFn: async ({ id, data }) => {
        const idx = mockRestaurants.findIndex((r) => r.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockRestaurants[idx] = { ...mockRestaurants[idx], ...data };
        return { data: mockRestaurants[idx] };
      },
      invalidatesTags: ['Restaurant', 'FoodCourtStats'],
    }),

    deleteRestaurant: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockRestaurants = mockRestaurants.filter((r) => r.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['Restaurant', 'FoodCourtStats'],
    }),

    getMenuItems: builder.query<{ content: MenuItem[]; totalElements: number; totalPages: number }, MenuItemFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockMenuItems];
        if (filters.restaurantId) {
          filtered = filtered.filter((item) => item.restaurantId === filters.restaurantId);
        }
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.itemName.toLowerCase().includes(s) ||
              item.categoryName.toLowerCase().includes(s) ||
              item.description.toLowerCase().includes(s)
          );
        }
        if (filters.status) {
          filtered = filtered.filter((item) => item.status === filters.status);
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
      providesTags: ['MenuItem'],
    }),

    createMenuItem: builder.mutation<MenuItem, Partial<MenuItem>>({
      queryFn: async (body) => {
        const res = mockRestaurants.find((r) => r.id === body.restaurantId);
        const newItem: MenuItem = {
          id: mockMenuItems.length + 1,
          restaurantId: body.restaurantId || 1,
          restaurantName: res?.restaurantName || 'Phở Sen Hồ Tây',
          categoryName: body.categoryName || 'Món Ăn Kèm',
          itemName: body.itemName || 'Món mới',
          image: body.image || 'https://picsum.photos/seed/newitem/300/200',
          description: body.description || 'Mô tả món ăn mới thêm vào thực đơn.',
          price: body.price || 0,
          discount: body.discount || 0,
          preparationTime: body.preparationTime || 10,
          calories: body.calories || 250,
          status: 'AVAILABLE',
        };
        mockMenuItems.push(newItem);
        return { data: newItem };
      },
      invalidatesTags: ['MenuItem'],
    }),

    updateMenuItem: builder.mutation<MenuItem, { id: number; data: Partial<MenuItem> }>({
      queryFn: async ({ id, data }) => {
        const idx = mockMenuItems.findIndex((item) => item.id === id);
        if (idx === -1) return { error: { status: 404, statusText: 'Not Found', data: null } };
        mockMenuItems[idx] = { ...mockMenuItems[idx], ...data };
        return { data: mockMenuItems[idx] };
      },
      invalidatesTags: ['MenuItem'],
    }),

    deleteMenuItem: builder.mutation<{ success: boolean }, number>({
      queryFn: async (id) => {
        mockMenuItems = mockMenuItems.filter((item) => item.id !== id);
        return { data: { success: true } };
      },
      invalidatesTags: ['MenuItem'],
    }),
  }),
});

export const {
  useGetFoodCourtStatsQuery,
  useGetRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useGetMenuItemsQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
} = foodCourtApi;
