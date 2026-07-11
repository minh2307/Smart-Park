// Aligned with OpenAPI TicketType schema
export interface TicketType {
  id: number;
  venueId: number;
  name: string;
  price: number;
  // UI-enriched fields (sourced from seed data / SRS business logic)
  description?: string;
  imageUrl?: string;
  category?: TicketCategory;
  benefits?: string[];
  durationDays?: number;
  ageMin?: number;
  ageMax?: number;
  isPopular?: boolean;
  isPromotion?: boolean;
  discountPercent?: number;
  availableCount?: number;
}

export type TicketCategory = 'STANDARD' | 'COMBO' | 'VIP' | 'FAMILY' | 'SEASONAL';

export interface TicketFilters {
  search: string;
  category: TicketCategory | 'ALL';
  priceMin: number;
  priceMax: number;
  sortBy: 'price_asc' | 'price_desc' | 'name_asc' | 'popular';
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  status: 0 | 1;
}

export interface CompareTicket {
  ticketId: number;
}
