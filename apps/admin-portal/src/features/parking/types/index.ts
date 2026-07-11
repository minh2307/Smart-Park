export type ParkingStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface ParkingArea {
  id: number;
  parkId: number;
  parkName?: string;
  name: string;
  code: string;
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  operatingHours: string;
  pricingPolicy: string;
  description?: string;
  status: ParkingStatus;
  createdAt: string;
}

export interface ParkingAreaFilters {
  search?: string;
  status?: ParkingStatus | '';
  page?: number;
  size?: number;
}

export interface ParkingAreaListResponse {
  content: ParkingArea[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ParkingDashboardStats {
  totalAreas: number;
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  reservedSpaces: number;
  disabledSpaces: number;
  parkingRevenue: number;
  currentVehicles: number;
  peakHours: { hour: string; count: number }[];
  durationStats: { range: string; count: number }[];
}
