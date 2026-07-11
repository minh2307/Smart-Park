export type IncidentType =
  | 'RIDE_BREAKDOWN'
  | 'POWER_FAILURE'
  | 'MEDICAL_EMERGENCY'
  | 'LOST_CHILD'
  | 'LOST_PROPERTY'
  | 'SECURITY'
  | 'WEATHER'
  | 'PARKING'
  | 'PAYMENT'
  | 'NETWORK'
  | 'SYSTEM_ERROR'
  | 'OTHER';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentImpact = 'INDIVIDUAL' | 'VENUE' | 'PARK_WIDE';
export type IncidentStatus = 'REPORTED' | 'INVESTIGATING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface IncidentTimelineEvent {
  id: number;
  status: IncidentStatus;
  notes: string;
  updatedBy: string;
  createdAt: string;
}

export interface Incident {
  id: number;
  title: string;
  type: IncidentType;
  severity: IncidentSeverity;
  impact: IncidentImpact;
  location: string;
  venueId?: number;
  venueName?: string;
  rideId?: number;
  rideName?: string;
  status: IncidentStatus;
  reporterName: string;
  reporterContact: string;
  assigneeName?: string;
  description: string;
  attachments?: string[];
  timeline: IncidentTimelineEvent[];
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface IncidentFilters {
  search?: string;
  type?: IncidentType | '';
  severity?: IncidentSeverity | '';
  status?: IncidentStatus | '';
  venueId?: number | '';
  rideId?: number | '';
  page?: number;
  size?: number;
}

export interface IncidentStats {
  totalIncidents: number;
  activeIncidents: number;
  resolvedIncidents: number;
  averageResolutionTimeMinutes: number;
  incidentsByType: { type: string; count: number }[];
  incidentsBySeverity: { severity: string; count: number }[];
  monthlyTrend: { date: string; count: number }[];
}
