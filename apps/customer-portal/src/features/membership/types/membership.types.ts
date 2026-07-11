export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';

export interface MembershipTier {
  id: number;
  name: string;
  code: string;
  discountPercentage: number;
  pointsMultiplier: number;
  minSpend: number;
}

export interface Membership {
  id: number;
  membershipCode: string;
  points: number;
  joinDate: string; // YYYY-MM-DD
  expirationDate?: string | null;
  status: MembershipStatus;
  tier: MembershipTier;
  customer?: {
    id: number;
    fullName: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface PointHistory {
  id: number;
  membershipId?: number;
  orderId?: number | null;
  pointsEarned: number;
  pointsRedeemed: number;
  reason: string;
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountPercentage: number;
  minSpend?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'EXHAUSTED' | 'EXPIRED' | 'DISABLED';
}

export interface MembershipState {
  activeTab: 'DASHBOARD' | 'TIERS' | 'HISTORY' | 'VOUCHERS';
  loading: boolean;
  error: string | null;
}
