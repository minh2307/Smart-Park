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
    title: 'Tổng quan điều hành',
    icon: MdDashboard,
    route: '/admin/dashboard',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Phân tích & BI',
    icon: MdDashboard,
    allowedRoles: ['ADMIN'],
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
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Trung tâm báo cáo',
    icon: MdInbox,
    route: '/admin/reports',
    allowedRoles: ['ADMIN'],
  },
  {
    title: 'Trung tâm xuất dữ liệu',
    icon: MdRedeem,
    route: '/admin/exports',
    allowedRoles: ['ADMIN'],
  },
  {
    title: 'Người dùng',
    icon: MdPeople,
    route: '/admin/users',
    allowedRoles: ['ADMIN'],
  },
  {
    title: 'Địa điểm',
    icon: MdBusiness,
    route: '/admin/venues',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Kiểm soát ra vào',
    icon: MdSecurity,
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
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
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
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
        allowedRoles: ['ADMIN'],
      },
    ],
  },
  {
    title: 'Đơn hàng',
    icon: MdShoppingBag,
    route: '/admin/orders',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Khách hàng',
    icon: MdPeople,
    route: '/admin/customers',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Thành viên',
    icon: MdCardMembership,
    route: '/admin/memberships',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Điểm tích lũy',
    icon: MdStars,
    route: '/admin/loyalty',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Khách hàng & Khuyến mãi',
    icon: MdLocalOffer,
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
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
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Trò chơi',
    icon: MdToys,
    route: '/admin/rides',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Danh mục trò chơi',
    icon: MdCategory,
    route: '/admin/ride-categories',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Bãi đỗ xe',
    icon: MdLocalParking,
    route: '/admin/parking',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Tủ đồ thông minh',
    icon: MdInbox,
    route: '/admin/lockers',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Khu ẩm thực',
    icon: MdFastfood,
    route: '/admin/food-court',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Cửa hàng bán lẻ',
    icon: MdStorefront,
    route: '/admin/retail',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Quầy bán vé POS',
    icon: MdPointOfSale,
    route: '/admin/pos',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Thông báo',
    icon: MdCampaign,
    route: '/admin/notifications',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Hỗ trợ khách hàng',
    icon: MdForum,
    route: '/admin/support',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Sự cố & An toàn',
    icon: MdWarning,
    route: '/admin/incidents',
    allowedRoles: ['ADMIN', 'NHAN_VIEN'],
  },
  {
    title: 'Cài đặt hệ thống',
    icon: MdSettings,
    route: '/admin/settings',
    allowedRoles: ['ADMIN'],
  },
];
