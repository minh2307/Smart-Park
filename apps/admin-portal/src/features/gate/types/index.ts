export interface DeviceInfo {
  ipAddress: string;
  macAddress: string;
  firmwareVersion: string;
}

export interface ScannerConfig {
  autoScan: boolean;
  continuousScan: boolean;
  beepSound: boolean;
  flashLight: boolean;
}

export interface OperatingHours {
  open: string;
  close: string;
}

export type GateType = 'ENTRY' | 'EXIT' | 'RIDE' | 'VIP';

export type GateStatus = 'OPEN' | 'CLOSED' | 'BUSY' | 'MAINTENANCE' | 'OFFLINE' | 'EMERGENCY' | 'DISABLED';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'ERROR';

export interface Gate {
  id: number;
  code: string;
  name: string;
  type: GateType;
  assignedVenueId: number;
  assignedVenueName: string;
  assignedZoneId: number | null;
  assignedZoneName: string | null;
  assignedAttractionId: number | null;
  assignedAttractionName: string | null;
  status: GateStatus;
  deviceStatus: DeviceStatus;
  currentOperator: string | null;
  deviceInfo: DeviceInfo;
  scannerConfig: ScannerConfig;
  operatingHours: OperatingHours;
  createdAt: string;
  updatedAt: string;
}

export interface GateFilters {
  page?: number;
  size?: number;
  search?: string;
  type?: GateType;
  status?: GateStatus;
  venueId?: number;
}

export interface GateListResponse {
  content: Gate[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
