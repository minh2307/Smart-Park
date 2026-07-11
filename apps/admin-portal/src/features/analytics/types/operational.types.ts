/**
 * Operational Dashboard Types
 * Gate, ride, parking, locker, scanner, operator status
 * Incidents, support tickets, maintenance, weather
 */

export interface OperationalDashboardData {
  gateStatus: GateStatusItem[];
  rideStatus: RideStatusItem[];
  parkingStatus: ParkingStatusSummary;
  lockerStatus: LockerStatusSummary;
  scannerStatus: ScannerStatusItem[];
  operatorStatus: OperatorStatusItem[];
  incidents: IncidentItem[];
  supportTickets: SupportTicketSummary;
  maintenanceItems: MaintenanceItem[];
  weatherImpact: WeatherImpactData;
}

export interface GateStatusItem {
  id: number;
  name: string;
  status: 'open' | 'closed' | 'maintenance' | 'error';
  lastScan: string;
  scansToday: number;
}

export interface RideStatusItem {
  id: number;
  name: string;
  status: 'active' | 'maintenance' | 'closed' | 'error';
  currentLoad: number;
  maxCapacity: number;
  waitTimeMinutes: number;
  lastUpdated: string;
}

export interface ParkingStatusSummary {
  totalSpots: number;
  occupied: number;
  available: number;
  reserved: number;
  zoneBreakdown: { zone: string; occupied: number; total: number }[];
}

export interface LockerStatusSummary {
  totalLockers: number;
  inUse: number;
  available: number;
  maintenance: number;
}

export interface ScannerStatusItem {
  id: number;
  location: string;
  status: 'online' | 'offline' | 'error';
  lastActivity: string;
  scansToday: number;
}

export interface OperatorStatusItem {
  id: number;
  fullName: string;
  role: string;
  status: 'active' | 'break' | 'offline';
  assignedArea: string;
  shiftStart: string;
  shiftEnd: string;
}

export interface IncidentItem {
  id: number;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  location: string;
  reportedAt: string;
  assignedTo?: string;
}

export interface SupportTicketSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  averageResolutionHours: number;
}

export interface MaintenanceItem {
  id: number;
  targetName: string;
  targetType: 'ride' | 'gate' | 'locker' | 'scanner' | 'parking';
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
}

export interface WeatherImpactData {
  currentTemp: number;
  condition: string;
  visitorImpact: 'positive' | 'neutral' | 'negative';
  forecastHours: { hour: number; temp: number; condition: string }[];
}
