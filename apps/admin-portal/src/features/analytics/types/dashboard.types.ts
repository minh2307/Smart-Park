/**
 * Executive Dashboard Types
 * Covers KPI metrics, summary data, and real-time snapshot
 */

export interface KpiMetric {
  label: string;
  value: number;
  formattedValue: string;
  trend: TrendData;
  sparkline?: number[];
  compareValue?: number;
  compareFormattedValue?: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export interface TrendData {
  value: number;
  direction: 'up' | 'down' | 'flat';
  label?: string;
}

export interface DashboardSummary {
  totalRevenue: KpiMetric;
  revenueGrowth: KpiMetric;
  visitorsToday: KpiMetric;
  bookingsToday: KpiMetric;
  ticketsSold: KpiMetric;
  activeMemberships: KpiMetric;
  rideUtilization: KpiMetric;
  parkingUsage: KpiMetric;
  foodCourtRevenue: KpiMetric;
  retailRevenue: KpiMetric;
  refundRate: KpiMetric;
  customerSatisfaction: KpiMetric;
  netProfit: KpiMetric;
  operatingCost: KpiMetric;
  conversionRate: KpiMetric;
}

export interface DashboardFilters {
  startDate: string;
  endDate: string;
  venueId?: number;
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  compareWith?: 'previous_period' | 'previous_year' | 'none';
}

export interface DashboardWidgetConfig {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'status';
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  locked?: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidgetConfig[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface RevenueTrendData {
  series: TimeSeriesPoint[];
  total: number;
  growth: number;
}

export interface VisitorFlowData {
  hourly: { hour: number; count: number }[];
  totalToday: number;
  peakHour: number;
  averageStayMinutes: number;
}
