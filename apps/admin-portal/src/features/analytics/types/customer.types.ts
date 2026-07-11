/**
 * Customer Analytics Types
 * Demographics, retention, lifetime value, segmentation
 */

export interface CustomerAnalyticsData {
  newCustomers: number;
  returningCustomers: number;
  vipCustomers: number;
  totalCustomers: number;
  customerGrowth: CustomerGrowthPoint[];
  ageDistribution: DistributionItem[];
  genderDistribution: DistributionItem[];
  nationalityDistribution: DistributionItem[];
  membershipDistribution: DistributionItem[];
  visitFrequency: VisitFrequencyBucket[];
  lifetimeValue: LTVData;
  averageSpending: number;
  retentionRate: number;
  churnRate: number;
  topCustomers: TopCustomer[];
}

export interface CustomerGrowthPoint {
  date: string;
  newCustomers: number;
  totalCustomers: number;
  churnedCustomers: number;
}

export interface DistributionItem {
  label: string;
  value: number;
  percentage: number;
}

export interface VisitFrequencyBucket {
  label: string;
  count: number;
  percentage: number;
}

export interface LTVData {
  average: number;
  median: number;
  distribution: { range: string; count: number }[];
  bySegment: { segment: string; ltv: number }[];
}

export interface TopCustomer {
  id: number;
  fullName: string;
  email: string;
  totalSpent: number;
  visitCount: number;
  membershipTier: string;
  lastVisit: string;
}

export interface RetentionCohort {
  cohortMonth: string;
  totalUsers: number;
  retentionByMonth: number[];
}
