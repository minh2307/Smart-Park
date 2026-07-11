/**
 * Report Template Definitions
 * Predefined templates for common report types
 */
import type { ReportCategory, ReportColumn } from '../types/index';

export interface ReportTemplateConfig {
  category: ReportCategory;
  label: string;
  description: string;
  defaultColumns: ReportColumn[];
}

const currencyCol = (key: string, label: string): ReportColumn => ({
  key,
  label,
  dataType: 'currency',
  visible: true,
  sortable: true,
  aggregatable: true,
});

const numberCol = (key: string, label: string): ReportColumn => ({
  key,
  label,
  dataType: 'number',
  visible: true,
  sortable: true,
  aggregatable: true,
});

const stringCol = (key: string, label: string): ReportColumn => ({
  key,
  label,
  dataType: 'string',
  visible: true,
  sortable: true,
});

const dateCol = (key: string, label: string): ReportColumn => ({
  key,
  label,
  dataType: 'date',
  visible: true,
  sortable: true,
});

const percentCol = (key: string, label: string): ReportColumn => ({
  key,
  label,
  dataType: 'percentage',
  visible: true,
  sortable: true,
  aggregatable: true,
});

export const REPORT_TEMPLATES: ReportTemplateConfig[] = [
  {
    category: 'revenue',
    label: 'Revenue Reports',
    description: 'Revenue analysis by venue, ticket type, and payment method',
    defaultColumns: [
      dateCol('date', 'Date'),
      stringCol('venue', 'Venue'),
      stringCol('source', 'Revenue Source'),
      currencyCol('amount', 'Amount'),
      currencyCol('tax', 'Tax'),
      currencyCol('net', 'Net Revenue'),
      percentCol('growth', 'Growth'),
    ],
  },
  {
    category: 'booking',
    label: 'Booking Reports',
    description: 'Booking volume, conversion rates, and cancellations',
    defaultColumns: [
      dateCol('createdAt', 'Date'),
      stringCol('customer', 'Customer'),
      stringCol('venue', 'Venue'),
      numberCol('ticketCount', 'Tickets'),
      currencyCol('totalAmount', 'Total'),
      stringCol('paymentMethod', 'Payment'),
      stringCol('status', 'Status'),
    ],
  },
  {
    category: 'ticket',
    label: 'Ticket Reports',
    description: 'Ticket sales, usage rates, and validation statistics',
    defaultColumns: [
      dateCol('soldDate', 'Sold Date'),
      stringCol('ticketType', 'Ticket Type'),
      stringCol('venue', 'Venue'),
      numberCol('quantity', 'Qty'),
      currencyCol('revenue', 'Revenue'),
      percentCol('usageRate', 'Usage Rate'),
      stringCol('status', 'Status'),
    ],
  },
  {
    category: 'customer',
    label: 'Customer Reports',
    description: 'Customer demographics, spending patterns, and retention',
    defaultColumns: [
      stringCol('fullName', 'Full Name'),
      stringCol('email', 'Email'),
      stringCol('membership', 'Membership'),
      numberCol('visitCount', 'Visits'),
      currencyCol('totalSpent', 'Total Spent'),
      dateCol('lastVisit', 'Last Visit'),
      percentCol('retentionScore', 'Retention'),
    ],
  },
  {
    category: 'membership',
    label: 'Membership Reports',
    description: 'Membership growth, tier distribution, and benefits usage',
    defaultColumns: [
      stringCol('memberName', 'Member'),
      stringCol('tier', 'Tier'),
      dateCol('joinDate', 'Join Date'),
      numberCol('points', 'Points'),
      currencyCol('spending', 'Spending'),
      percentCol('benefitsUsage', 'Benefits Used'),
      stringCol('status', 'Status'),
    ],
  },
  {
    category: 'ride',
    label: 'Ride Reports',
    description: 'Ride utilization, downtime, and maintenance statistics',
    defaultColumns: [
      stringCol('rideName', 'Ride'),
      numberCol('totalRiders', 'Total Riders'),
      percentCol('utilization', 'Utilization'),
      numberCol('avgWait', 'Avg Wait (min)'),
      numberCol('downtime', 'Downtime (hr)'),
      currencyCol('revenue', 'Revenue'),
      stringCol('status', 'Status'),
    ],
  },
  {
    category: 'parking',
    label: 'Parking Reports',
    description: 'Parking occupancy, revenue, and vehicle statistics',
    defaultColumns: [
      dateCol('date', 'Date'),
      stringCol('zone', 'Zone'),
      numberCol('vehicles', 'Vehicles'),
      percentCol('occupancy', 'Occupancy'),
      currencyCol('revenue', 'Revenue'),
      numberCol('avgDuration', 'Avg Duration (hr)'),
    ],
  },
  {
    category: 'retail',
    label: 'Retail Reports',
    description: 'Retail and merchandise sales performance',
    defaultColumns: [
      stringCol('shopName', 'Shop'),
      stringCol('product', 'Product'),
      stringCol('category', 'Category'),
      numberCol('unitsSold', 'Units Sold'),
      currencyCol('revenue', 'Revenue'),
      numberCol('stockLevel', 'Stock'),
    ],
  },
  {
    category: 'restaurant',
    label: 'Restaurant Reports',
    description: 'Food court and restaurant sales analysis',
    defaultColumns: [
      stringCol('restaurant', 'Restaurant'),
      stringCol('menuItem', 'Item'),
      numberCol('orderCount', 'Orders'),
      currencyCol('revenue', 'Revenue'),
      currencyCol('avgOrder', 'Avg Order'),
      percentCol('popularity', 'Popularity'),
    ],
  },
  {
    category: 'promotion',
    label: 'Promotion Reports',
    description: 'Campaign performance, coupon usage, and ROI analysis',
    defaultColumns: [
      stringCol('campaignName', 'Campaign'),
      stringCol('type', 'Type'),
      dateCol('startDate', 'Start'),
      dateCol('endDate', 'End'),
      numberCol('conversions', 'Conversions'),
      currencyCol('revenue', 'Revenue'),
      percentCol('roi', 'ROI'),
    ],
  },
  {
    category: 'payment',
    label: 'Payment Reports',
    description: 'Payment transaction history and method distribution',
    defaultColumns: [
      dateCol('transactionDate', 'Date'),
      stringCol('orderId', 'Order ID'),
      stringCol('customer', 'Customer'),
      stringCol('method', 'Method'),
      currencyCol('amount', 'Amount'),
      stringCol('status', 'Status'),
    ],
  },
  {
    category: 'refund',
    label: 'Refund Reports',
    description: 'Refund tracking and analysis',
    defaultColumns: [
      dateCol('refundDate', 'Date'),
      stringCol('orderId', 'Order ID'),
      stringCol('customer', 'Customer'),
      currencyCol('amount', 'Amount'),
      stringCol('reason', 'Reason'),
      stringCol('status', 'Status'),
    ],
  },
  {
    category: 'incident',
    label: 'Incident Reports',
    description: 'Incident tracking, severity, and resolution times',
    defaultColumns: [
      dateCol('reportedAt', 'Reported'),
      stringCol('title', 'Incident'),
      stringCol('severity', 'Severity'),
      stringCol('location', 'Location'),
      stringCol('assignedTo', 'Assigned'),
      stringCol('status', 'Status'),
      numberCol('resolutionHours', 'Resolution (hr)'),
    ],
  },
  {
    category: 'support',
    label: 'Support Reports',
    description: 'Support ticket volume and resolution statistics',
    defaultColumns: [
      dateCol('createdAt', 'Created'),
      stringCol('subject', 'Subject'),
      stringCol('priority', 'Priority'),
      stringCol('category', 'Category'),
      stringCol('assignedTo', 'Assigned'),
      stringCol('status', 'Status'),
      numberCol('resolutionHours', 'Resolution (hr)'),
    ],
  },
  {
    category: 'audit',
    label: 'Audit Reports',
    description: 'System audit trail and user activity logs',
    defaultColumns: [
      dateCol('timestamp', 'Timestamp'),
      stringCol('user', 'User'),
      stringCol('action', 'Action'),
      stringCol('resource', 'Resource'),
      stringCol('details', 'Details'),
      stringCol('ipAddress', 'IP Address'),
    ],
  },
  {
    category: 'inventory',
    label: 'Inventory Reports',
    description: 'Stock levels, turnover rates, and reorder alerts',
    defaultColumns: [
      stringCol('product', 'Product'),
      stringCol('category', 'Category'),
      numberCol('stockLevel', 'Stock'),
      numberCol('reorderPoint', 'Reorder Point'),
      numberCol('turnoverRate', 'Turnover Rate'),
      stringCol('supplier', 'Supplier'),
      stringCol('status', 'Status'),
    ],
  },
  {
    category: 'supplier',
    label: 'Supplier Reports',
    description: 'Supplier performance, delivery rates, and quality scores',
    defaultColumns: [
      stringCol('supplierName', 'Supplier'),
      numberCol('totalOrders', 'Orders'),
      percentCol('onTimeDelivery', 'On Time'),
      percentCol('qualityScore', 'Quality'),
      currencyCol('totalSpend', 'Total Spend'),
      stringCol('status', 'Status'),
    ],
  },
];

export const REPORT_PERIOD_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom Range' },
] as const;

export const EXPORT_FORMAT_OPTIONS = [
  { value: 'xlsx', label: 'Excel (.xlsx)', icon: 'table' },
  { value: 'csv', label: 'CSV', icon: 'text' },
  { value: 'pdf', label: 'PDF', icon: 'document' },
  { value: 'json', label: 'JSON', icon: 'code' },
] as const;
