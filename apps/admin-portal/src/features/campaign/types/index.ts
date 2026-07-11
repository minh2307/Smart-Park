export interface Campaign {
  id: number;
  name: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  targetAudience: string;
  targetConversion: number; // percentage
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignFilters {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface CampaignListResponse {
  content: Campaign[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
