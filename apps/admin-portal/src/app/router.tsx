import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthGuard } from '../core/guards/AuthGuard';
import { RoleGuard } from '../core/guards/RoleGuard';
import { UnauthorizedPage } from '../pages/401';
import { ForbiddenPage } from '../pages/403';
import { NotFoundPage } from '../pages/404';
import { ServerErrorPage } from '../pages/500';

// Lazy Dynamic Imports
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })));

// User
const UserListPage = lazy(() => import('../features/user/pages/UserListPage').then(m => ({ default: m.UserListPage })));
const UserDetailsPage = lazy(() => import('../features/user/pages/UserDetailsPage').then(m => ({ default: m.UserDetailsPage })));
const ProfilePage = lazy(() => import('../features/user/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

// Venue
const VenueListPage = lazy(() => import('../features/venue/pages/VenueListPage').then(m => ({ default: m.VenueListPage })));
const VenueDetailsPage = lazy(() => import('../features/venue/pages/VenueDetailsPage').then(m => ({ default: m.VenueDetailsPage })));

// Ticket
const TicketOverviewPage = lazy(() => import('../features/ticket/pages/TicketOverviewPage').then(m => ({ default: m.TicketOverviewPage })));

// Booking
const BookingListPage = lazy(() => import('../features/booking/pages/BookingListPage').then(m => ({ default: m.BookingListPage })));

// Customer / Visitor
const CustomerListPage = lazy(() => import('../features/customer/pages/CustomerListPage').then(m => ({ default: m.CustomerListPage })));
const VisitorListPage = lazy(() => import('../features/visitor/pages/VisitorListPage').then(m => ({ default: m.VisitorListPage })));

// Ride / Ride Category
const RideListPage = lazy(() => import('../features/ride/pages/RideListPage').then(m => ({ default: m.RideListPage })));
const RideCategoryListPage = lazy(() => import('../features/ride-category/pages/RideCategoryListPage').then(m => ({ default: m.RideCategoryListPage })));

// Membership / Loyalty
const MembershipListPage = lazy(() => import('../features/membership/pages/MembershipListPage').then(m => ({ default: m.MembershipListPage })));
const LoyaltyDashboardPage = lazy(() => import('../features/loyalty/pages/LoyaltyDashboardPage').then(m => ({ default: m.LoyaltyDashboardPage })));

// Campaigns / Promotions / Coupons / Vouchers
const CampaignListPage = lazy(() => import('../features/campaign/pages/CampaignListPage').then(m => ({ default: m.CampaignListPage })));
const PromotionListPage = lazy(() => import('../features/promotion/pages/PromotionListPage').then(m => ({ default: m.PromotionListPage })));
const CouponListPage = lazy(() => import('../features/coupon/pages/CouponListPage').then(m => ({ default: m.CouponListPage })));
const VoucherListPage = lazy(() => import('../features/voucher/pages/VoucherListPage').then(m => ({ default: m.VoucherListPage })));

// Gates / Validation / Scanner
const GateListPage = lazy(() => import('../features/gate/pages/GateListPage').then(m => ({ default: m.GateListPage })));
const ValidationDashboardPage = lazy(() => import('../features/ticket-validation/pages/ValidationDashboardPage').then(m => ({ default: m.ValidationDashboardPage })));
const ScannerTerminalPage = lazy(() => import('../features/scanner/pages/ScannerTerminalPage').then(m => ({ default: m.ScannerTerminalPage })));

// Parking / Lockers
const ParkingListPage = lazy(() => import('../features/parking/pages/ParkingListPage').then(m => ({ default: m.ParkingListPage })));
const LockerListPage = lazy(() => import('../features/locker/pages/LockerListPage').then(m => ({ default: m.LockerListPage })));

// Food Court / Retail / POS
const FoodCourtListPage = lazy(() => import('../features/food-court/pages/FoodCourtListPage').then(m => ({ default: m.FoodCourtListPage })));
const RetailListPage = lazy(() => import('../features/retail/pages/RetailListPage').then(m => ({ default: m.RetailListPage })));
const POSScreen = lazy(() => import('../features/pos/components/POSScreen').then(m => ({ default: m.POSScreen })));

// Notifications / Support / Incident
const NotificationPage = lazy(() => import('../features/notification/pages/NotificationPage').then(m => ({ default: m.NotificationPage })));
const SupportPage = lazy(() => import('../features/support/pages/SupportPage').then(m => ({ default: m.SupportPage })));
const IncidentPage = lazy(() => import('../features/incident/pages/IncidentPage').then(m => ({ default: m.IncidentPage })));

// Analytics & Dashboards
const ExecutiveDashboardPage = lazy(() => import('../features/analytics/pages/ExecutiveDashboardPage').then(m => ({ default: m.ExecutiveDashboardPage })));
const RevenueAnalyticsPage = lazy(() => import('../features/analytics/pages/RevenueAnalyticsPage').then(m => ({ default: m.RevenueAnalyticsPage })));
const CustomerAnalyticsPage = lazy(() => import('../features/analytics/pages/CustomerAnalyticsPage').then(m => ({ default: m.CustomerAnalyticsPage })));
const BookingAnalyticsPage = lazy(() => import('../features/analytics/pages/BookingAnalyticsPage').then(m => ({ default: m.BookingAnalyticsPage })));
const TicketAnalyticsPage = lazy(() => import('../features/analytics/pages/TicketAnalyticsPage').then(m => ({ default: m.TicketAnalyticsPage })));
const RideAnalyticsPage = lazy(() => import('../features/analytics/pages/RideAnalyticsPage').then(m => ({ default: m.RideAnalyticsPage })));
const ParkingAnalyticsPage = lazy(() => import('../features/analytics/pages/ParkingAnalyticsPage').then(m => ({ default: m.ParkingAnalyticsPage })));
const RetailFoodAnalyticsPage = lazy(() => import('../features/analytics/pages/RetailFoodAnalyticsPage').then(m => ({ default: m.RetailFoodAnalyticsPage })));
const MembershipAnalyticsPage = lazy(() => import('../features/analytics/pages/MembershipAnalyticsPage').then(m => ({ default: m.MembershipAnalyticsPage })));
const PromotionAnalyticsPage = lazy(() => import('../features/analytics/pages/PromotionAnalyticsPage').then(m => ({ default: m.PromotionAnalyticsPage })));
const BusinessIntelligencePage = lazy(() => import('../features/analytics/pages/BusinessIntelligencePage').then(m => ({ default: m.BusinessIntelligencePage })));
const OperationalDashboardPage = lazy(() => import('../features/analytics/pages/OperationalDashboardPage').then(m => ({ default: m.OperationalDashboardPage })));
const ReportsPage = lazy(() => import('../features/analytics/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const ExportPage = lazy(() => import('../features/analytics/pages/ExportPage').then(m => ({ default: m.ExportPage })));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
        ],
      },
      {
        path: 'admin',
        element: (
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        ),
        children: [
          {
            path: 'dashboard',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <ExecutiveDashboardPage />
              </RoleGuard>
            ),
          },
          {
            path: 'analytics',
            children: [
              {
                path: 'executive',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <ExecutiveDashboardPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'revenue',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <RevenueAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'customer',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <CustomerAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'booking',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <BookingAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'ticket',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <TicketAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'ride',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <RideAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'parking',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <ParkingAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'retail-food',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <RetailFoodAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'membership',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <MembershipAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'promotion',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <PromotionAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'bi',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <BusinessIntelligencePage />
                  </RoleGuard>
                ),
              },
            ],
          },
          {
            path: 'users',
            children: [
              {
                index: true,
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <UserListPage />
                  </RoleGuard>
                ),
              },
              {
                path: ':id',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <UserDetailsPage />
                  </RoleGuard>
                ),
              },
            ],
          },
          {
            path: 'venues',
            children: [
              {
                index: true,
                element: (
                  <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                    <VenueListPage />
                  </RoleGuard>
                ),
              },
              {
                path: ':id',
                element: (
                  <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                    <VenueDetailsPage />
                  </RoleGuard>
                ),
              },
            ],
          },
          {
            path: 'tickets',
            children: [
              {
                path: 'overview',
                element: (
                  <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                    <TicketOverviewPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'types',
                element: (
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <div style={{ padding: '1rem' }}>Configure Ticket Types & Pricing Matrix</div>
                  </RoleGuard>
                ),
              },
            ],
          },
          {
            path: 'orders',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <BookingListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'customers',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <CustomerListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'memberships',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <MembershipListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'loyalty',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <LoyaltyDashboardPage />
              </RoleGuard>
            ),
          },
          {
            path: 'campaigns',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <CampaignListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'promotions',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <PromotionListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'coupons',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <CouponListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'vouchers',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <VoucherListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'visitors',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <VisitorListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'rides',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <RideListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'ride-categories',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <RideCategoryListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'gates',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <GateListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'ticket-validation',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <ValidationDashboardPage />
              </RoleGuard>
            ),
          },
          {
            path: 'scanner',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <ScannerTerminalPage />
              </RoleGuard>
            ),
          },
          {
            path: 'parking',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <ParkingListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'lockers',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <LockerListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'food-court',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <FoodCourtListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'retail',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <RetailListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'pos',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <POSScreen />
              </RoleGuard>
            ),
          },
          {
            path: 'notifications',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <NotificationPage />
              </RoleGuard>
            ),
          },
          {
            path: 'support',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <SupportPage />
              </RoleGuard>
            ),
          },
          {
            path: 'incidents',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <IncidentPage />
              </RoleGuard>
            ),
          },
          {
            path: 'operational',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <OperationalDashboardPage />
              </RoleGuard>
            ),
          },
          {
            path: 'reports',
            element: (
              <RoleGuard allowedRoles={['ADMIN']}>
                <ReportsPage />
              </RoleGuard>
            ),
          },
          {
            path: 'exports',
            element: (
              <RoleGuard allowedRoles={['ADMIN']}>
                <ExportPage />
              </RoleGuard>
            ),
          },
          {
            path: 'profile',
            element: (
              <RoleGuard allowedRoles={['ADMIN', 'NHAN_VIEN']}>
                <ProfilePage />
              </RoleGuard>
            ),
          },
          {
            path: 'settings',
            element: (
              <RoleGuard allowedRoles={['ADMIN']}>
                <div style={{ padding: '1rem' }}>Global System Configurations & Backup Policies</div>
              </RoleGuard>
            ),
          },
        ],
      },
      {
        path: '401',
        element: <UnauthorizedPage />,
      },
      {
        path: '403',
        element: <ForbiddenPage />,
      },
      {
        path: '500',
        element: <ServerErrorPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
