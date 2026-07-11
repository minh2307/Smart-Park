export interface PointRules {
  upgradeThreshold: number;
  downgradeThreshold: number;
  expirationMonths: number;
  renewalPoints: number;
}

export interface BenefitConfig {
  ticketDiscount: number; // percentage
  foodDiscount: number; // percentage
  shopDiscount: number; // percentage
  parkingDiscount: number; // percentage
  lockerDiscount: number; // percentage
  priorityQueue: boolean;
  fastPass: boolean;
  birthdayGift: boolean;
  vipLoungeAccess: boolean;
  freeParking: boolean;
  freeLocker: boolean;
  earlyParkEntry: boolean;
}

export interface MembershipTier {
  id: number;
  name: string;
  code: string;
  discountPercentage: number;
  pointsMultiplier: number;
  minSpend: number;
  status: 'ACTIVE' | 'INACTIVE';
  benefitsCount: number;
  activeMembers: number;
  benefits: BenefitConfig;
  applicableTicketTypes: string[];
  applicableVenues: string[];
  applicableAttractions: string[];
  pointRules: PointRules;
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tierId: number;
  tierName: string;
  membershipCode: string;
  points: number;
  joinDate: string;
  expirationDate?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface MembershipFilters {
  page?: number;
  size?: number;
  search?: string;
  tier?: string;
  status?: string;
  minDiscount?: number;
  minPoints?: number;
}

export interface MembershipListResponse {
  content: Membership[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
