/**
 * Ticket Analytics Types
 * Sales, usage rates, popular tickets, type comparison
 */

export interface TicketAnalyticsData {
  ticketSales: TicketSalesPoint[];
  ticketRevenue: number;
  totalTicketsSold: number;
  mostPopularTicket: TicketPopularity;
  leastPopularTicket: TicketPopularity;
  usageRate: number;
  expirationRate: number;
  validationSuccess: number;
  rideUsage: RideTicketUsage[];
  venueUsage: VenueTicketUsage[];
  ticketTypeComparison: TicketTypeCompare[];
}

export interface TicketSalesPoint {
  date: string;
  sold: number;
  revenue: number;
  validated: number;
}

export interface TicketPopularity {
  id: number;
  name: string;
  sold: number;
  revenue: number;
  trend: number;
}

export interface RideTicketUsage {
  rideId: number;
  rideName: string;
  usageCount: number;
  capacityPercentage: number;
}

export interface VenueTicketUsage {
  venueId: number;
  venueName: string;
  ticketsSold: number;
  revenue: number;
}

export interface TicketTypeCompare {
  id: number;
  name: string;
  price: number;
  sold: number;
  revenue: number;
  usageRate: number;
  returnRate: number;
}
