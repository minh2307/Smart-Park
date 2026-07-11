export type RideOperatingStatus =
  | 'OPERATING'
  | 'CLOSED'
  | 'MAINTENANCE'
  | 'TEMPORARILY_CLOSED'
  | 'EMERGENCY_STOP'
  | 'RESERVED';

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';

export interface RideRestrictions {
  minHeight?: number; // cm
  maxHeight?: number; // cm
  minAge?: number;
  maxAge?: number;
  minWeight?: number; // kg
  maxWeight?: number; // kg
  healthWarning?: boolean;
  pregnancyRestriction?: boolean;
  accessibilityFriendly?: boolean;
  safetyNotes?: string;
}

export interface RideMaintenance {
  id: number;
  technicianName: string;
  scheduledDate: string;
  completionDate?: string;
  status: MaintenanceStatus;
  description: string;
  notes?: string;
  cost?: number;
}

export interface RideSchedule {
  id: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  operatorName: string;
  status: string;
}

export interface Ride {
  id: number;
  name: string;
  code: string;
  description?: string;
  capacity: number; // people per hour/cycle
  durationSeconds?: number;
  status: RideOperatingStatus;
  
  // Relations/Hierarchy
  venueId: number;
  venueName?: string;
  zoneId: number;
  zoneName?: string;
  rideCategoryId?: number;
  categoryName?: string;

  // Realtime Stats
  queueTimeMinutes: number;
  popularityScore: number; // 0-100
  revenueContribution?: number; // monthly sum

  // Media
  images: string[];
  coverImage?: string;

  // Restrictions & Operations
  restrictions: RideRestrictions;
  operatingHours: {
    open: string; // e.g. "09:00"
    close: string; // e.g. "21:00"
  };

  // History & schedules
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  assignedTechnician?: string;
  maintenanceStatus?: MaintenanceStatus;

  createdAt: string;
  updatedAt: string;
}

export interface RideFilters {
  page?: number;
  size?: number;
  search?: string;
  rideCategoryId?: string | number;
  venueId?: string | number;
  zoneId?: string | number;
  status?: string;
  maintenanceStatus?: string;
}

export interface RideListResponse {
  content: Ride[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
