import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Campaign, CampaignFilters, CampaignListResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export let mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: 'Summer Splash 2026',
    code: 'SUMMER_SPLASH_26',
    description: 'Annual summer attraction discounts and ticket promotions.',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    budget: 50000,
    status: 'ACTIVE',
    targetAudience: 'Families, tourists, students',
    targetConversion: 12.5,
    totalRevenue: 145000,
    createdAt: '2026-05-15T08:00:00Z',
    updatedAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Halloween Haunt Fest',
    code: 'HALLOWEEN_26',
    description: 'Evening ticket packages and scary ride fast passes.',
    startDate: '2026-10-01',
    endDate: '2026-11-02',
    budget: 35000,
    status: 'DRAFT',
    targetAudience: 'Teens, young adults',
    targetConversion: 15.0,
    totalRevenue: 0,
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-07-01T09:00:00Z',
  },
  {
    id: 3,
    name: 'Spring Renewal VIP',
    code: 'SPRING_VIP_26',
    description: 'Targeted campaign to convert visitors to premium members.',
    startDate: '2026-03-01',
    endDate: '2026-05-15',
    budget: 20000,
    status: 'COMPLETED',
    targetAudience: 'Loyalty members, repeat guests',
    targetConversion: 8.4,
    totalRevenue: 68000,
    createdAt: '2026-02-10T12:00:00Z',
    updatedAt: '2026-05-16T17:00:00Z',
  },
  {
    id: 4,
    name: 'Weekend Rush Bonus',
    code: 'WEEKEND_RUSH',
    description: 'Increase Sunday gate ticket volumes through family packages.',
    startDate: '2026-07-04',
    endDate: '2026-09-27',
    budget: 15000,
    status: 'ACTIVE',
    targetAudience: 'Local residents',
    targetConversion: 9.8,
    totalRevenue: 34200,
    createdAt: '2026-06-20T14:00:00Z',
    updatedAt: '2026-07-04T08:00:00Z',
  },
];

export const campaignApi = createApi({
  reducerPath: 'campaignApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Campaign'],
  endpoints: (builder) => ({
    getCampaigns: builder.query<CampaignListResponse, CampaignFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockCampaigns];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.name.toLowerCase().includes(s) ||
              c.code.toLowerCase().includes(s) ||
              c.description.toLowerCase().includes(s)
          );
        }
        if (filters.status) {
          filtered = filtered.filter((c) => c.status === filters.status);
        }

        const size = filters.size || 10;
        const page = filters.page || 0;
        const offset = page * size;
        const content = filtered.slice(offset, offset + size);
        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size);

        return {
          data: {
            content,
            totalElements,
            totalPages,
            size,
            number: page,
          },
        };
      },
      providesTags: ['Campaign'],
    }),

    getCampaignById: builder.query<Campaign, number>({
      queryFn: async (id) => {
        const c = mockCampaigns.find((item) => item.id === id);
        if (!c) return { error: { status: 404, statusText: 'Campaign Not Found', data: null } };
        return { data: c };
      },
      providesTags: (_res, _err, id) => [{ type: 'Campaign', id }],
    }),

    createCampaign: builder.mutation<Campaign, Partial<Campaign>>({
      queryFn: async (body) => {
        const newC: Campaign = {
          id: mockCampaigns.length + 1,
          name: body.name || 'New Campaign',
          code: body.code || `CAMP-${Math.floor(1000 + Math.random() * 9000)}`,
          description: body.description || '',
          startDate: body.startDate || new Date().toISOString().split('T')[0],
          endDate: body.endDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          budget: body.budget || 0,
          status: body.status || 'DRAFT',
          targetAudience: body.targetAudience || 'All visitors',
          targetConversion: body.targetConversion || 0,
          totalRevenue: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockCampaigns.push(newC);
        return { data: newC };
      },
      invalidatesTags: ['Campaign'],
    }),

    updateCampaign: builder.mutation<Campaign, { id: number; body: Partial<Campaign> }>({
      queryFn: async ({ id, body }) => {
        const index = mockCampaigns.findIndex((item) => item.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Campaign Not Found', data: null } };
        const current = mockCampaigns[index];
        const updated: Campaign = {
          ...current,
          ...body,
          updatedAt: new Date().toISOString(),
        };
        mockCampaigns[index] = updated;
        return { data: updated };
      },
      invalidatesTags: (_res, _err, { id }) => ['Campaign', { type: 'Campaign', id }],
    }),

    deleteCampaign: builder.mutation<void, number>({
      queryFn: async (id) => {
        mockCampaigns = mockCampaigns.filter((item) => item.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ['Campaign'],
    }),
  }),
});

export const {
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} = campaignApi;
