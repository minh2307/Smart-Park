export type VenueStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE' | 'CLOSED';

export interface Venue {
  id: number;
  name: string;
  venueCode: string;
  description?: string;
  address: string;
  city: string;
  provinceState?: string;
  country: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
  openingTime?: string;
  closingTime?: string;
  manager?: string;
  status: VenueStatus | number; // Support both backend enum 0/1 and UI statuses
  logoUrl?: string;
  coverImageUrl?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface VenueFilters {
  search?: string;
  status?: string;
  city?: string;
  country?: string;
  page?: number;
  size?: number;
}

export interface VenueListResponse {
  content: Venue[];
  totalElements: number;
  totalPages: number;
}
