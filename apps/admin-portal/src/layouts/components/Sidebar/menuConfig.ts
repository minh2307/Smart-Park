import { IconType } from 'react-icons';
import {
  MdDashboard,
  MdConfirmationNumber,
  MdSettings,
  MdShoppingBag,
  MdPeople,
  MdBusiness,
  MdAssignmentInd,
  MdCategory,
  MdToys,
  MdCardMembership,
  MdStars,
  MdCampaign,
  MdLocalOffer,
  MdCardGiftcard,
  MdRedeem,
  MdSecurity,
  MdQrCodeScanner,
  MdLocalParking,
  MdInbox,
  MdFastfood,
  MdStorefront,
  MdPointOfSale,
  MdForum,
  MdWarning,
} from 'react-icons/md';

export interface MenuItem {
  title: string;
  icon: IconType;
  route?: string;
  allowedRoles?: string[];
  children?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
  {
    title: 'Executive Summary',
    icon: MdDashboard,
    route: '/admin/dashboard',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Analytics & BI',
    icon: MdDashboard,
    allowedRoles: ['ADMIN'],
    children: [
      {
        title: 'Revenue Analytics',
        icon: MdLocalOffer,
        route: '/admin/analytics/revenue',
      },
      {
        title: 'Customer Analytics',
        icon: MdPeople,
        route: '/admin/analytics/customer',
      },
      {
        title: 'Booking Analytics',
        icon: MdShoppingBag,
        route: '/admin/analytics/booking',
      },
      {
        title: 'Ticket Analytics',
        icon: MdConfirmationNumber,
        route: '/admin/analytics/ticket',
      },
      {
        title: 'Ride Analytics',
        icon: MdToys,
        route: '/admin/analytics/ride',
      },
      {
        title: 'Parking Analytics',
        icon: MdLocalParking,
        route: '/admin/analytics/parking',
      },
      {
        title: 'Retail & Food Analytics',
        icon: MdFastfood,
        route: '/admin/analytics/retail-food',
      },
      {
        title: 'Membership Analytics',
        icon: MdCardMembership,
        route: '/admin/analytics/membership',
      },
      {
        title: 'Promotion Analytics',
        icon: MdCampaign,
        route: '/admin/analytics/promotion',
      },
      {
        title: 'BI Analyzer',
        icon: MdStars,
        route: '/admin/analytics/bi',
      },
    ],
  },
  {
    title: 'Operations Pulsar',
    icon: MdWarning,
    route: '/admin/operational',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Reports Center',
    icon: MdInbox,
    route: '/admin/reports',
    allowedRoles: ['ADMIN'],
  },
  {
    title: 'Export Center',
    icon: MdRedeem,
    route: '/admin/exports',
    allowedRoles: ['ADMIN'],
  },
  {
    title: 'Users',
    icon: MdPeople,
    route: '/admin/users',
    allowedRoles: ['ADMIN'],
  },
  {
    title: 'Venues',
    icon: MdBusiness,
    route: '/admin/venues',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Access Control',
    icon: MdSecurity,
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
    children: [
      {
        title: 'Gates Management',
        icon: MdSettings,
        route: '/admin/gates',
      },
      {
        title: 'Validation Logs',
        icon: MdConfirmationNumber,
        route: '/admin/ticket-validation',
      },
      {
        title: 'Scanner Terminal',
        icon: MdQrCodeScanner,
        route: '/admin/scanner',
      },
    ],
  },
  {
    title: 'Tickets',
    icon: MdConfirmationNumber,
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
    children: [
      {
        title: 'Overview',
        icon: MdConfirmationNumber,
        route: '/admin/tickets/overview',
      },
      {
        title: 'Types',
        icon: MdSettings,
        route: '/admin/tickets/types',
        allowedRoles: ['ADMIN'],
      },
    ],
  },
  {
    title: 'Orders',
    icon: MdShoppingBag,
    route: '/admin/orders',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Customers',
    icon: MdPeople,
    route: '/admin/customers',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Memberships',
    icon: MdCardMembership,
    route: '/admin/memberships',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Loyalty Points',
    icon: MdStars,
    route: '/admin/loyalty',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Marketing',
    icon: MdLocalOffer,
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
    children: [
      {
        title: 'Campaigns',
        icon: MdCampaign,
        route: '/admin/campaigns',
      },
      {
        title: 'Promotions',
        icon: MdLocalOffer,
        route: '/admin/promotions',
      },
      {
        title: 'Coupons',
        icon: MdCardGiftcard,
        route: '/admin/coupons',
      },
      {
        title: 'Vouchers',
        icon: MdRedeem,
        route: '/admin/vouchers',
      },
    ],
  },
  {
    title: 'Visitors',
    icon: MdAssignmentInd,
    route: '/admin/visitors',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Rides',
    icon: MdToys,
    route: '/admin/rides',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Ride Categories',
    icon: MdCategory,
    route: '/admin/ride-categories',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Parking Lots',
    icon: MdLocalParking,
    route: '/admin/parking',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Smart Lockers',
    icon: MdInbox,
    route: '/admin/lockers',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Food Court (F&B)',
    icon: MdFastfood,
    route: '/admin/food-court',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Retail Shop',
    icon: MdStorefront,
    route: '/admin/retail',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'POS Terminal',
    icon: MdPointOfSale,
    route: '/admin/pos',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Communications',
    icon: MdCampaign,
    route: '/admin/notifications',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Customer Care',
    icon: MdForum,
    route: '/admin/support',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Safety & Incidents',
    icon: MdWarning,
    route: '/admin/incidents',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Settings',
    icon: MdSettings,
    route: '/admin/settings',
    allowedRoles: ['ADMIN'],
  },
];
