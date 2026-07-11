/**
 * Booking Analytics Types
 * Booking trends, conversion, cancellation, peak hours
 */

export interface BookingAnalyticsData {
  bookingsPerDay: TimeSeriesBooking[];
  bookingsPerHour: HourlyBooking[];
  bookingConversion: ConversionFunnel;
  cancellationRate: number;
  refundRate: number;
  bookingSources: DistributionEntry[];
  peakBookingTime: { hour: number; dayOfWeek: number; count: number }[];
  averageBookingValue: number;
  averageTicketsPerBooking: number;
  statusDistribution: DistributionEntry[];
  totalBookings: number;
  totalRevenue: number;
}

export interface TimeSeriesBooking {
  date: string;
  count: number;
  revenue: number;
}

export interface HourlyBooking {
  hour: number;
  count: number;
  averageValue: number;
}

export interface ConversionFunnel {
  visitorsToBooking: number;
  bookingToPayment: number;
  paymentToCompleted: number;
  overallConversion: number;
  stages: FunnelStage[];
}

export interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  dropOff: number;
}

export interface DistributionEntry {
  label: string;
  value: number;
  percentage: number;
}
