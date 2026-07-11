/**
 * Ride Analytics Types
 * Popularity, capacity, utilization, queue time, maintenance
 */

export interface RideAnalyticsData {
  ridePopularity: RidePopularityItem[];
  rideCapacity: RideCapacityItem[];
  rideUtilization: RideUtilizationItem[];
  averageQueueTime: number;
  averageWaitingTime: number;
  rideRevenue: RideRevenueItem[];
  rideDowntime: RideDowntimeItem[];
  maintenanceStats: MaintenanceStats;
  rideAvailability: RideAvailabilityItem[];
  peakHours: RidePeakHour[];
}

export interface RidePopularityItem {
  id: number;
  name: string;
  totalRiders: number;
  rating: number;
  trend: number;
}

export interface RideCapacityItem {
  id: number;
  name: string;
  maxCapacity: number;
  currentLoad: number;
  utilizationPercent: number;
}

export interface RideUtilizationItem {
  id: number;
  name: string;
  utilizationPercent: number;
  hoursActive: number;
  hoursTotal: number;
}

export interface RideRevenueItem {
  id: number;
  name: string;
  revenue: number;
  ticketsSold: number;
  averageRevenuePer: number;
}

export interface RideDowntimeItem {
  id: number;
  name: string;
  downtimeMinutes: number;
  reason: string;
  date: string;
}

export interface MaintenanceStats {
  scheduledCount: number;
  completedCount: number;
  pendingCount: number;
  averageResolutionHours: number;
  upcomingMaintenance: MaintenanceScheduleItem[];
}

export interface MaintenanceScheduleItem {
  rideId: number;
  rideName: string;
  scheduledDate: string;
  type: 'routine' | 'repair' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface RideAvailabilityItem {
  id: number;
  name: string;
  availabilityPercent: number;
  status: 'active' | 'maintenance' | 'closed';
}

export interface RidePeakHour {
  hour: number;
  averageRiders: number;
  averageWaitMinutes: number;
}
