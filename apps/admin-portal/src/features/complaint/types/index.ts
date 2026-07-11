export type ComplaintPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type ComplaintSeverity = 'MINOR' | 'MODERATE' | 'MAJOR' | 'SEVERE';
export type ComplaintStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export interface Complaint {
  id: number;
  customerName: string;
  customerPhone: string;
  title: string;
  description: string;
  priority: ComplaintPriority;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  evidenceUrls?: string[];
  assignedStaff?: string;
  internalNotes?: string;
  isEscalated: boolean;
  escalationReason?: string;
  resolutionText?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface ComplaintFilters {
  search?: string;
  priority?: ComplaintPriority | '';
  severity?: ComplaintSeverity | '';
  status?: ComplaintStatus | '';
  isEscalated?: boolean | '';
  page?: number;
  size?: number;
}
