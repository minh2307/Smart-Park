import { createApi } from '@reduxjs/toolkit/query/react';
import { fetchBaseQuery } from '../../../core/services/fetchBaseQuery';
import { Membership, MembershipTier, MembershipFilters, MembershipListResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Seed mock membership tiers
export let mockMembershipTiers: MembershipTier[] = [
  {
    id: 1,
    name: 'Bronze Base',
    code: 'BRONZE',
    discountPercentage: 0,
    pointsMultiplier: 1.0,
    minSpend: 0,
    status: 'ACTIVE',
    benefitsCount: 2,
    activeMembers: 142,
    benefits: {
      ticketDiscount: 0,
      foodDiscount: 0,
      shopDiscount: 5,
      parkingDiscount: 0,
      lockerDiscount: 0,
      priorityQueue: false,
      fastPass: false,
      birthdayGift: true,
      vipLoungeAccess: false,
      freeParking: false,
      freeLocker: false,
      earlyParkEntry: false,
    },
    applicableTicketTypes: ['Standard Admission', 'Kids Pass'],
    applicableVenues: ['Adventure Park', 'Fantasy Land'],
    applicableAttractions: ['Colossus Coaster', 'Carousel of Fun'],
    pointRules: {
      upgradeThreshold: 500,
      downgradeThreshold: 0,
      expirationMonths: 12,
      renewalPoints: 100,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Silver Rewards',
    code: 'SILVER',
    discountPercentage: 5.00,
    pointsMultiplier: 1.15,
    minSpend: 500,
    status: 'ACTIVE',
    benefitsCount: 5,
    activeMembers: 98,
    benefits: {
      ticketDiscount: 5,
      foodDiscount: 5,
      shopDiscount: 10,
      parkingDiscount: 20,
      lockerDiscount: 20,
      priorityQueue: false,
      fastPass: false,
      birthdayGift: true,
      vipLoungeAccess: false,
      freeParking: false,
      freeLocker: false,
      earlyParkEntry: true,
    },
    applicableTicketTypes: ['Standard Admission', 'VIP Pass', 'Kids Pass'],
    applicableVenues: ['Adventure Park', 'Fantasy Land', 'Water World'],
    applicableAttractions: ['Colossus Coaster', 'Carousel of Fun', 'Whirlwind Slide'],
    pointRules: {
      upgradeThreshold: 1500,
      downgradeThreshold: 450,
      expirationMonths: 18,
      renewalPoints: 200,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Gold Elite',
    code: 'GOLD',
    discountPercentage: 10.00,
    pointsMultiplier: 1.30,
    minSpend: 1500,
    status: 'ACTIVE',
    benefitsCount: 8,
    activeMembers: 54,
    benefits: {
      ticketDiscount: 10,
      foodDiscount: 10,
      shopDiscount: 12,
      parkingDiscount: 50,
      lockerDiscount: 50,
      priorityQueue: true,
      fastPass: false,
      birthdayGift: true,
      vipLoungeAccess: false,
      freeParking: false,
      freeLocker: false,
      earlyParkEntry: true,
    },
    applicableTicketTypes: ['Standard Admission', 'VIP Pass', 'Annual Membership', 'Kids Pass'],
    applicableVenues: ['Adventure Park', 'Fantasy Land', 'Water World', 'Science Discovery'],
    applicableAttractions: ['Colossus Coaster', 'Carousel of Fun', 'Whirlwind Slide', 'Drop of Terror'],
    pointRules: {
      upgradeThreshold: 4000,
      downgradeThreshold: 1400,
      expirationMonths: 24,
      renewalPoints: 400,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'Platinum Prestige',
    code: 'PLATINUM',
    discountPercentage: 15.00,
    pointsMultiplier: 1.50,
    minSpend: 4000,
    status: 'ACTIVE',
    benefitsCount: 12,
    activeMembers: 21,
    benefits: {
      ticketDiscount: 15,
      foodDiscount: 15,
      shopDiscount: 15,
      parkingDiscount: 100,
      lockerDiscount: 100,
      priorityQueue: true,
      fastPass: true,
      birthdayGift: true,
      vipLoungeAccess: true,
      freeParking: true,
      freeLocker: true,
      earlyParkEntry: true,
    },
    applicableTicketTypes: ['Standard Admission', 'VIP Pass', 'Annual Membership', 'Express Pass', 'Kids Pass'],
    applicableVenues: ['Adventure Park', 'Fantasy Land', 'Water World', 'Science Discovery', 'VR Center'],
    applicableAttractions: ['Colossus Coaster', 'Carousel of Fun', 'Whirlwind Slide', 'Drop of Terror', 'Hyperion Rollercoaster'],
    pointRules: {
      upgradeThreshold: 10000,
      downgradeThreshold: 3800,
      expirationMonths: 36,
      renewalPoints: 800,
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

// Seed mock memberships
export let mockMemberships: Membership[] = [
  {
    id: 1,
    customerId: 1,
    customerName: 'Emily Davis',
    customerEmail: 'emily.davis@gmail.com',
    customerPhone: '+1 415-555-2671',
    tierId: 3,
    tierName: 'Gold Elite',
    membershipCode: 'MEM-EMILY-7829',
    points: 1250,
    joinDate: '2026-01-15',
    expirationDate: '2027-01-15',
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-07-01T10:15:00Z',
  },
  {
    id: 2,
    customerId: 2,
    customerName: 'Liam Nguyen',
    customerEmail: 'liam.nguyen@yahoo.com',
    customerPhone: '+84 908-123-456',
    tierId: 4,
    tierName: 'Platinum Prestige',
    membershipCode: 'MEM-LIAM-9081',
    points: 4200,
    joinDate: '2026-02-10',
    expirationDate: '2027-02-10',
    status: 'ACTIVE',
    createdAt: '2026-02-10T14:22:00Z',
    updatedAt: '2026-06-28T09:40:00Z',
  },
  {
    id: 3,
    customerId: 3,
    customerName: 'Sophia Martinez',
    customerEmail: 'sophia.m@outlook.com',
    customerPhone: '+1 212-555-8930',
    tierId: 1,
    tierName: 'Bronze Base',
    membershipCode: 'MEM-SOPHIA-1212',
    points: 120,
    joinDate: '2026-03-05',
    expirationDate: '2026-09-05',
    status: 'ACTIVE',
    createdAt: '2026-03-05T09:15:00Z',
    updatedAt: '2026-07-05T16:30:00Z',
  },
  {
    id: 4,
    customerId: 4,
    customerName: 'Marcus Aurelius',
    customerEmail: 'marcus.aurelius@philosophy.org',
    customerPhone: '+39 06-555-1234',
    tierId: 2,
    tierName: 'Silver Rewards',
    membershipCode: 'MEM-MARCUS-0426',
    points: 850,
    joinDate: '2026-04-01',
    expirationDate: '2027-04-01',
    status: 'ACTIVE',
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-07-02T11:00:00Z',
  },
];

export const membershipApi = createApi({
  reducerPath: 'membershipApi',
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
  tagTypes: ['Membership', 'MembershipTier'],
  endpoints: (builder) => ({
    getMembershipTiers: builder.query<MembershipTier[], void>({
      queryFn: async () => {
        return { data: mockMembershipTiers };
      },
      providesTags: ['MembershipTier'],
    }),

    getMembershipTierById: builder.query<MembershipTier, number>({
      queryFn: async (id) => {
        const tier = mockMembershipTiers.find((t) => t.id === id);
        if (!tier) return { error: { status: 404, statusText: 'Tier Not Found', data: null } };
        return { data: tier };
      },
      providesTags: (_res, _err, id) => [{ type: 'MembershipTier', id }],
    }),

    createMembershipTier: builder.mutation<MembershipTier, Partial<MembershipTier>>({
      queryFn: async (body) => {
        const newTier: MembershipTier = {
          id: mockMembershipTiers.length + 1,
          name: body.name || 'New Tier',
          code: body.code || 'NEW_TIER',
          discountPercentage: body.discountPercentage || 0,
          pointsMultiplier: body.pointsMultiplier || 1.0,
          minSpend: body.minSpend || 0,
          status: body.status || 'ACTIVE',
          benefitsCount: Object.values(body.benefits || {}).filter(Boolean).length,
          activeMembers: 0,
          benefits: body.benefits || {
            ticketDiscount: 0,
            foodDiscount: 0,
            shopDiscount: 0,
            parkingDiscount: 0,
            lockerDiscount: 0,
            priorityQueue: false,
            fastPass: false,
            birthdayGift: false,
            vipLoungeAccess: false,
            freeParking: false,
            freeLocker: false,
            earlyParkEntry: false,
          },
          applicableTicketTypes: body.applicableTicketTypes || [],
          applicableVenues: body.applicableVenues || [],
          applicableAttractions: body.applicableAttractions || [],
          pointRules: body.pointRules || {
            upgradeThreshold: 1000,
            downgradeThreshold: 0,
            expirationMonths: 12,
            renewalPoints: 100,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockMembershipTiers.push(newTier);
        return { data: newTier };
      },
      invalidatesTags: ['MembershipTier'],
    }),

    updateMembershipTier: builder.mutation<MembershipTier, { id: number; body: Partial<MembershipTier> }>({
      queryFn: async ({ id, body }) => {
        const index = mockMembershipTiers.findIndex((t) => t.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Tier Not Found', data: null } };
        
        const current = mockMembershipTiers[index];
        const updated: MembershipTier = {
          ...current,
          ...body,
          benefits: {
            ...current.benefits,
            ...body.benefits,
          },
          pointRules: {
            ...current.pointRules,
            ...body.pointRules,
          },
          updatedAt: new Date().toISOString(),
        };
        updated.benefitsCount = Object.values(updated.benefits).filter(v => v === true || (typeof v === 'number' && v > 0)).length;
        mockMembershipTiers[index] = updated;
        return { data: updated };
      },
      invalidatesTags: (_res, _err, { id }) => ['MembershipTier', { type: 'MembershipTier', id }],
    }),

    deleteMembershipTier: builder.mutation<void, number>({
      queryFn: async (id) => {
        mockMembershipTiers = mockMembershipTiers.filter((t) => t.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ['MembershipTier'],
    }),

    getMemberships: builder.query<MembershipListResponse, MembershipFilters>({
      queryFn: async (filters) => {
        let filtered = [...mockMemberships];
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (m) =>
              m.customerName.toLowerCase().includes(s) ||
              m.membershipCode.toLowerCase().includes(s) ||
              m.customerEmail.toLowerCase().includes(s)
          );
        }
        if (filters.tier) {
          filtered = filtered.filter((m) => m.tierName.toLowerCase() === filters.tier?.toLowerCase());
        }
        if (filters.status) {
          filtered = filtered.filter((m) => m.status === filters.status);
        }
        if (filters.minPoints) {
          filtered = filtered.filter((m) => m.points >= (filters.minPoints ?? 0));
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
      providesTags: ['Membership'],
    }),

    getMembershipById: builder.query<Membership, number>({
      queryFn: async (id) => {
        const mem = mockMemberships.find((m) => m.id === id);
        if (!mem) return { error: { status: 404, statusText: 'Membership Not Found', data: null } };
        return { data: mem };
      },
      providesTags: (_res, _err, id) => [{ type: 'Membership', id }],
    }),

    createMembership: builder.mutation<Membership, Partial<Membership>>({
      queryFn: async (body) => {
        const targetTier = mockMembershipTiers.find((t) => t.id === body.tierId) || mockMembershipTiers[0];
        const newMem: Membership = {
          id: mockMemberships.length + 1,
          customerId: body.customerId || 1,
          customerName: body.customerName || 'John Doe',
          customerEmail: body.customerEmail || 'john.doe@example.com',
          customerPhone: body.customerPhone || '+1 555-555-5555',
          tierId: targetTier.id,
          tierName: targetTier.name,
          membershipCode: body.membershipCode || `MEM-${(body.customerName || 'DOE').substring(0,4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
          points: body.points || 0,
          joinDate: body.joinDate || new Date().toISOString().split('T')[0],
          expirationDate: body.expirationDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: body.status || 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockMemberships.push(newMem);
        // increment tier count
        targetTier.activeMembers += 1;
        return { data: newMem };
      },
      invalidatesTags: ['Membership'],
    }),

    updateMembership: builder.mutation<Membership, { id: number; body: Partial<Membership> }>({
      queryFn: async ({ id, body }) => {
        const index = mockMemberships.findIndex((m) => m.id === id);
        if (index === -1) return { error: { status: 404, statusText: 'Membership Not Found', data: null } };

        const current = mockMemberships[index];
        let tierName = current.tierName;
        let tierId = current.tierId;
        if (body.tierId && body.tierId !== current.tierId) {
          const targetTier = mockMembershipTiers.find((t) => t.id === body.tierId);
          if (targetTier) {
            tierName = targetTier.name;
            tierId = targetTier.id;
            // update counts
            const prevTier = mockMembershipTiers.find((t) => t.id === current.tierId);
            if (prevTier) prevTier.activeMembers = Math.max(0, prevTier.activeMembers - 1);
            targetTier.activeMembers += 1;
          }
        }

        const updated: Membership = {
          ...current,
          ...body,
          tierId,
          tierName,
          updatedAt: new Date().toISOString(),
        };
        mockMemberships[index] = updated;
        return { data: updated };
      },
      invalidatesTags: (_res, _err, { id }) => ['Membership', { type: 'Membership', id }],
    }),

    deleteMembership: builder.mutation<void, number>({
      queryFn: async (id) => {
        const mem = mockMemberships.find((m) => m.id === id);
        if (mem) {
          const tier = mockMembershipTiers.find((t) => t.id === mem.tierId);
          if (tier) tier.activeMembers = Math.max(0, tier.activeMembers - 1);
        }
        mockMemberships = mockMemberships.filter((m) => m.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ['Membership'],
    }),
  }),
});

export const {
  useGetMembershipTiersQuery,
  useGetMembershipTierByIdQuery,
  useCreateMembershipTierMutation,
  useUpdateMembershipTierMutation,
  useDeleteMembershipTierMutation,
  useGetMembershipsQuery,
  useGetMembershipByIdQuery,
  useCreateMembershipMutation,
  useUpdateMembershipMutation,
  useDeleteMembershipMutation,
} = membershipApi;
