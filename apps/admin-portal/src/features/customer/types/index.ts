export interface MembershipTier {
  id: number;
  name: string;
  code: string;
  discountPercentage: number;
  pointsMultiplier: number;
  minSpend: number;
}

export interface CustomerMembership {
  id: number;
  membershipCode: string;
  points: number;
  joinDate: string;
  expirationDate?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  tier: MembershipTier;
}

export interface CustomerStats {
  totalOrders: number;
  totalTickets: number;
  totalSpending: number;
}

export interface Customer {
  id: number;
  userId?: number;
  fullName: string;
  email: string;
  phone: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  membership?: CustomerMembership;
  stats?: CustomerStats;
}

export interface CustomerFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  membershipTier?: string;
  minSpending?: number;
}

export interface CustomerListResponse {
  content: Customer[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CustomerActivityLog {
  id: number;
  action: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
}
