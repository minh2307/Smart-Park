export type ValidationStatus = 'SUCCESS' | 'EXPIRED' | 'WRONG_LOCATION' | 'ALREADY_USED' | 'INVALID_CODE' | 'SUSPENDED';

export interface ValidationLog {
  id: number;
  ticketId: number | null;
  ticketCode: string;
  customerName: string;
  attractionId: number | null;
  attractionName: string | null;
  checkInTime: string;
  status: ValidationStatus;
  gateId: number;
  gateCode: string;
  operatorName: string;
  failureReason?: string;
  remainingUsage?: number;
}

export interface ValidationSummaryStats {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  wrongLocationScans: number;
  expiredScans: number;
  alreadyUsedScans: number;
}
