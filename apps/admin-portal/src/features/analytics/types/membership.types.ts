/**
 * Membership Analytics Types
 * Growth, upgrades/downgrades, points, benefits, tier distribution
 */

export interface MembershipAnalyticsData {
  membershipGrowth: MembershipGrowthPoint[];
  membershipUpgrade: number;
  membershipDowngrade: number;
  pointsEarned: number;
  pointsRedeemed: number;
  benefitsUsage: BenefitsUsageItem[];
  tierDistribution: TierDistributionItem[];
  revenueContribution: MembershipRevenueItem[];
  totalActiveMembers: number;
  averagePointsBalance: number;
}

export interface MembershipGrowthPoint {
  date: string;
  newMembers: number;
  totalMembers: number;
  upgrades: number;
  downgrades: number;
  churned: number;
}

export interface BenefitsUsageItem {
  benefitName: string;
  usageCount: number;
  usageRate: number;
  totalAvailable: number;
}

export interface TierDistributionItem {
  tier: string;
  count: number;
  percentage: number;
  avgSpending: number;
  color: string;
}

export interface MembershipRevenueItem {
  tier: string;
  revenue: number;
  percentage: number;
  membersCount: number;
}
