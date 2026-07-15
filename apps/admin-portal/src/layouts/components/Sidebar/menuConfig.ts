import { IconType } from 'react-icons';
import {
  MdDashboard,
  MdConfirmationNumber,
  MdSettings,
  MdShoppingBag,
  MdPeople,
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
import { AppRole } from '../../../features/auth/types';

export interface MenuItem {
  title: string;
  icon: IconType;
  route?: string;
  allowedRoles?: AppRole[];
  children?: MenuItem[];
}

export const menuConfig: MenuItem[] = [
  {
    title: 'Tổng quan điều hành',
    icon: MdDashboard,
    route: '/admin/dashboard',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF', 'OPERATIONS_STAFF'],
  },
  {
    title: 'Phân tích & BI',
    icon: MdDashboard,
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER'],
    children: [
      {
        title: 'Phân tích doanh thu',
        icon: MdLocalOffer,
        route: '/admin/analytics/revenue',
      },
      {
        title: 'Phân tích khách hàng',
        icon: MdPeople,
        route: '/admin/analytics/customer',
      },
      {
        title: 'Phân tích đặt vé',
        icon: MdShoppingBag,
        route: '/admin/analytics/booking',
      },
      {
        title: 'Phân tích vé',
        icon: MdConfirmationNumber,
        route: '/admin/analytics/ticket',
      },
      {
        title: 'Phân tích trò chơi',
        icon: MdToys,
        route: '/admin/analytics/ride',
      },
      {
        title: 'Phân tích bãi đỗ xe',
        icon: MdLocalParking,
        route: '/admin/analytics/parking',
      },
      {
        title: 'Phân tích bán lẻ & ẩm thực',
        icon: MdFastfood,
        route: '/admin/analytics/retail-food',
      },
      {
        title: 'Phân tích thành viên',
        icon: MdCardMembership,
        route: '/admin/analytics/membership',
      },
      {
        title: 'Phân tích khuyến mãi',
        icon: MdCampaign,
        route: '/admin/analytics/promotion',
      },
      {
        title: 'Trình phân tích BI',
        icon: MdStars,
        route: '/admin/analytics/bi',
      },
    ],
  },
  {
    title: 'Bảng vận hành hệ thống',
    icon: MdWarning,
    route: '/admin/operational',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER'],
  },
  {
    title: 'Trung tâm báo cáo',
    icon: MdInbox,
    route: '/admin/reports',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER'],
  },
  {
    title: 'Trung tâm xuất dữ liệu',
    icon: MdRedeem,
    route: '/admin/exports',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER'],
  },
  {
    title: 'Người dùng',
    icon: MdPeople,
    route: '/admin/users',
    allowedRoles: ['SYSTEM_ADMIN'],
  },

  {
    title: 'Kiểm soát ra vào',
    icon: MdSecurity,
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF'],
    children: [
      {
        title: 'Quản lý cổng',
        icon: MdSettings,
        route: '/admin/gates',
      },
      {
        title: 'Lịch sử kiểm soát vé',
        icon: MdConfirmationNumber,
        route: '/admin/ticket-validation',
      },
      {
        title: 'Thiết bị quét mã QR',
        icon: MdQrCodeScanner,
        route: '/admin/scanner',
      },
    ],
  },
  {
    title: 'Quản lý vé',
    icon: MdConfirmationNumber,
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF'],
    children: [
      {
        title: 'Tổng quan',
        icon: MdConfirmationNumber,
        route: '/admin/tickets/overview',
      },
      {
        title: 'Loại vé',
        icon: MdSettings,
        route: '/admin/tickets/types',
        allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER'],
      },
    ],
  },
  {
    title: 'Đơn hàng',
    icon: MdShoppingBag,
    route: '/admin/orders',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF'],
  },
  {
    title: 'Khách hàng',
    icon: MdPeople,
    route: '/admin/customers',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF'],
  },
  {
    title: 'Thành viên',
    icon: MdCardMembership,
    route: '/admin/memberships',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF'],
  },
  {
    title: 'Điểm tích lũy',
    icon: MdStars,
    route: '/admin/loyalty',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF'],
  },
  {
    title: 'Khách hàng & Khuyến mãi',
    icon: MdLocalOffer,
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF'],
    children: [
      {
        title: 'Chiến dịch',
        icon: MdCampaign,
        route: '/admin/campaigns',
      },
      {
        title: 'Khuyến mãi',
        icon: MdLocalOffer,
        route: '/admin/promotions',
      },
      {
        title: 'Mã giảm giá',
        icon: MdCardGiftcard,
        route: '/admin/coupons',
      },
      {
        title: 'Thẻ quà tặng',
        icon: MdRedeem,
        route: '/admin/vouchers',
      },
    ],
  },
  {
    title: 'Khách vãng lai',
    icon: MdAssignmentInd,
    route: '/admin/visitors',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF', 'OPERATIONS_STAFF'],
  },
  {
    title: 'Trò chơi',
    icon: MdToys,
    route: '/admin/rides',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF'],
  },
  {
    title: 'Danh mục trò chơi',
    icon: MdCategory,
    route: '/admin/ride-categories',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF'],
  },
  {
    title: 'Bãi đỗ xe',
    icon: MdLocalParking,
    route: '/admin/parking',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF'],
  },
  {
    title: 'Tủ đồ thông minh',
    icon: MdInbox,
    route: '/admin/lockers',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF'],
  },
  {
    title: 'Khu ẩm thực',
    icon: MdFastfood,
    route: '/admin/food-court',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF'],
  },
  {
    title: 'Cửa hàng bán lẻ',
    icon: MdStorefront,
    route: '/admin/retail',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF'],
  },
  {
    title: 'Quầy bán vé POS',
    icon: MdPointOfSale,
    route: '/admin/pos',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF'],
  },
  {
    title: 'Thông báo',
    icon: MdCampaign,
    route: '/admin/notifications',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF', 'OPERATIONS_STAFF'],
  },
  {
    title: 'Hỗ trợ khách hàng',
    icon: MdForum,
    route: '/admin/support',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF', 'OPERATIONS_STAFF'],
  },
  {
    title: 'Sự cố & An toàn',
    icon: MdWarning,
    route: '/admin/incidents',
    allowedRoles: ['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF'],
  },
  {
    title: 'Cài đặt hệ thống',
    icon: MdSettings,
    route: '/admin/settings',
    allowedRoles: ['SYSTEM_ADMIN'],
  },
];
