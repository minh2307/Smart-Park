/**
 * Parking Analytics Types
 * Occupancy, revenue, duration, vehicle types, zone utilization
 */

export interface ParkingAnalyticsData {
  parkingOccupancy: ParkingOccupancy;
  parkingRevenue: number;
  averageParkingDuration: number;
  vehicleTypes: VehicleTypeItem[];
  peakHours: ParkingPeakHour[];
  parkingUtilization: number;
  zoneUtilization: ParkingZoneItem[];
  dailyTrend: ParkingDailyPoint[];
}

export interface ParkingOccupancy {
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  occupancyPercent: number;
}

export interface VehicleTypeItem {
  type: string;
  count: number;
  percentage: number;
}

export interface ParkingPeakHour {
  hour: number;
  occupancy: number;
  revenue: number;
}

export interface ParkingZoneItem {
  zoneId: string;
  zoneName: string;
  totalSpots: number;
  occupied: number;
  utilization: number;
}

export interface ParkingDailyPoint {
  date: string;
  vehicles: number;
  revenue: number;
  averageDuration: number;
}
