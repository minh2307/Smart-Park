/**
 * KPI Card Definitions
 * Static configuration for all Executive Dashboard KPI cards
 */
import {
  MdAttachMoney,
  MdTrendingUp,
  MdPeople,
  MdBookmarkBorder,
  MdConfirmationNumber,
  MdCardMembership,
  MdAttractions,
  MdLocalParking,
  MdRestaurant,
  MdStorefront,
  MdMoneyOff,
  MdSentimentSatisfied,
  MdAccountBalance,
  MdBuildCircle,
  MdSwapHoriz,
} from 'react-icons/md';
import type { IconType } from 'react-icons';

export interface KpiDefinition {
  key: string;
  label: string;
  icon: IconType;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  format: 'currency' | 'number' | 'percentage';
  description: string;
  gridSize: { xs: number; sm: number; md: number; lg: number };
}

export const KPI_DEFINITIONS: KpiDefinition[] = [
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: MdAttachMoney,
    color: 'primary',
    format: 'currency',
    description: 'Total revenue across all venues and channels',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'revenueGrowth',
    label: 'Revenue Growth',
    icon: MdTrendingUp,
    color: 'success',
    format: 'percentage',
    description: 'Revenue growth compared to previous period',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'visitorsToday',
    label: 'Visitors Today',
    icon: MdPeople,
    color: 'info',
    format: 'number',
    description: 'Total visitors entering the park today',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'bookingsToday',
    label: 'Bookings Today',
    icon: MdBookmarkBorder,
    color: 'primary',
    format: 'number',
    description: 'New bookings created today',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'ticketsSold',
    label: 'Tickets Sold',
    icon: MdConfirmationNumber,
    color: 'success',
    format: 'number',
    description: 'Total tickets sold in selected period',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'activeMemberships',
    label: 'Active Memberships',
    icon: MdCardMembership,
    color: 'primary',
    format: 'number',
    description: 'Currently active membership accounts',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'rideUtilization',
    label: 'Ride Utilization',
    icon: MdAttractions,
    color: 'info',
    format: 'percentage',
    description: 'Average ride capacity utilization',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'parkingUsage',
    label: 'Parking Usage',
    icon: MdLocalParking,
    color: 'warning',
    format: 'percentage',
    description: 'Current parking lot occupancy',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'foodCourtRevenue',
    label: 'Food Court Revenue',
    icon: MdRestaurant,
    color: 'success',
    format: 'currency',
    description: 'Food court and restaurant revenue',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'retailRevenue',
    label: 'Retail Revenue',
    icon: MdStorefront,
    color: 'primary',
    format: 'currency',
    description: 'Retail shop and merchandise revenue',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'refundRate',
    label: 'Refund Rate',
    icon: MdMoneyOff,
    color: 'error',
    format: 'percentage',
    description: 'Percentage of orders refunded',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'customerSatisfaction',
    label: 'Customer Satisfaction',
    icon: MdSentimentSatisfied,
    color: 'success',
    format: 'percentage',
    description: 'Average customer satisfaction score',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'netProfit',
    label: 'Net Profit',
    icon: MdAccountBalance,
    color: 'success',
    format: 'currency',
    description: 'Net profit after all expenses',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'operatingCost',
    label: 'Operating Cost',
    icon: MdBuildCircle,
    color: 'warning',
    format: 'currency',
    description: 'Total operating expenses',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
  {
    key: 'conversionRate',
    label: 'Conversion Rate',
    icon: MdSwapHoriz,
    color: 'info',
    format: 'percentage',
    description: 'Visitor to booking conversion rate',
    gridSize: { xs: 12, sm: 6, md: 4, lg: 3 },
  },
];
