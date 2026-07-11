export interface RideCategory {
  id: number;
  name: string;
  code: string; // Unique category code (e.g., CAT-COASTER)
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  rideCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RideCategoryFilters {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

export interface RideCategoryListResponse {
  content: RideCategory[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
