/**
 * Analytics Types - Barrel Export
 * Re-exports all analytics-related type definitions
 */

export * from './dashboard.types';
export * from './revenue.types';
export * from './customer.types';
export * from './booking.types';
export * from './ticket.types';
export * from './ride.types';
export * from './parking.types';
export * from './retail.types';
export * from './membership.types';
export * from './promotion.types';
export * from './operational.types';

/**
 * Shared Report & Export Types
 */

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  columns: ReportColumn[];
  filters: ReportFilter[];
  groupBy?: string[];
  sortBy?: { field: string; direction: 'asc' | 'desc' }[];
  aggregations?: ReportAggregation[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isSystem: boolean;
}

export type ReportCategory =
  | 'revenue'
  | 'booking'
  | 'ticket'
  | 'customer'
  | 'membership'
  | 'ride'
  | 'parking'
  | 'retail'
  | 'restaurant'
  | 'promotion'
  | 'payment'
  | 'refund'
  | 'audit'
  | 'security'
  | 'incident'
  | 'support'
  | 'inventory'
  | 'supplier'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

export interface ReportColumn {
  key: string;
  label: string;
  dataType: 'string' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean';
  visible: boolean;
  width?: number;
  sortable?: boolean;
  aggregatable?: boolean;
}

export interface ReportFilter {
  field: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multi-select' | 'date-range';
  options?: { label: string; value: string }[];
  value?: string | number | string[];
}

export interface ReportAggregation {
  field: string;
  function: 'sum' | 'avg' | 'min' | 'max' | 'count';
  label: string;
}

export interface ReportGenerateRequest {
  templateId?: string;
  category: ReportCategory;
  columns: string[];
  filters: Record<string, unknown>;
  groupBy?: string[];
  sortBy?: { field: string; direction: 'asc' | 'desc' }[];
  startDate: string;
  endDate: string;
  format: ExportFormat;
}

export type ExportFormat = 'xlsx' | 'csv' | 'pdf' | 'json';

export interface ExportJob {
  id: string;
  reportName: string;
  format: ExportFormat;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileUrl?: string;
  fileSize?: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface ScheduledExport {
  id: string;
  reportName: string;
  templateId: string;
  format: ExportFormat;
  schedule: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  lastRun?: string;
  nextRun: string;
  enabled: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}
