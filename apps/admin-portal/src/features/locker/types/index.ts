export type LockerStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'MAINTENANCE'
  | 'LOCKED'
  | 'OUT_OF_SERVICE'
  | 'CLEANING'
  | 'DISABLED';

export type LockerSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'FAMILY' | 'VIP';

export interface Locker {
  id: number;
  zoneId: number;
  zoneName?: string;
  lockerCode: string;
  size: LockerSize;
  status: LockerStatus;
  location?: string;
  rentalStatus?: string;
  createdAt: string;
}

export interface LockerFilters {
  search?: string;
  status?: LockerStatus | '';
  size?: LockerSize | '';
  page?: number;
  sizeCount?: number;
}

export interface LockerListResponse {
  content: Locker[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface LockerRental {
  id: number;
  lockerId: number;
  lockerCode: string;
  customerId: number;
  customerName: string;
  bookingCode?: string;
  startTime: string;
  endTime?: string;
  durationHours?: number;
  amountPaid?: number;
  depositAmount: number;
  penaltyAmount?: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface LockerRentalFilters {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface LockerRentalListResponse {
  content: LockerRental[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface LockerDashboardStats {
  totalLockers: number;
  availableCount: number;
  occupiedCount: number;
  reservedCount: number;
  outOfServiceCount: number;
  revenue: number;
  rentalCount: number;
  usageRate: number;
}
