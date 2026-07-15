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
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF', 'OPERATIONS_STAFF']}>
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
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                    <ExecutiveDashboardPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'revenue',
                element: (
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                    <RevenueAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'customer',
                element: (
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                    <CustomerAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'booking',
                element: (
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                    <BookingAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'ticket',
                element: (
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                    <TicketAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'ride',
                element: (
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                    <RideAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'parking',
                element: (
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                    <ParkingAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'retail-food',
                element: (
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                    <RetailFoodAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'membership',
                element: (
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                    <MembershipAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'promotion',
                element: (
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                    <PromotionAnalyticsPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'bi',
                element: (
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
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
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN']}>
                    <UserListPage />
                  </RoleGuard>
                ),
              },
              {
                path: ':id',
                element: (
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN']}>
                    <UserDetailsPage />
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
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF']}>
                    <TicketOverviewPage />
                  </RoleGuard>
                ),
              },
              {
                path: 'types',
                element: (
                  <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                    <div style={{ padding: '1rem' }}>Configure Ticket Types & Pricing Matrix</div>
                  </RoleGuard>
                ),
              },
            ],
          },
          {
            path: 'orders',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF']}>
                <BookingListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'customers',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF']}>
                <CustomerListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'memberships',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF']}>
                <MembershipListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'loyalty',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF']}>
                <LoyaltyDashboardPage />
              </RoleGuard>
            ),
          },
          {
            path: 'campaigns',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF']}>
                <CampaignListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'promotions',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF']}>
                <PromotionListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'coupons',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF']}>
                <CouponListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'vouchers',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF']}>
                <VoucherListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'visitors',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF', 'OPERATIONS_STAFF']}>
                <VisitorListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'rides',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF']}>
                <RideListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'ride-categories',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF']}>
                <RideCategoryListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'gates',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF']}>
                <GateListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'ticket-validation',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF']}>
                <ValidationDashboardPage />
              </RoleGuard>
            ),
          },
          {
            path: 'scanner',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF']}>
                <ScannerTerminalPage />
              </RoleGuard>
            ),
          },
          {
            path: 'parking',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF']}>
                <ParkingListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'lockers',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF']}>
                <LockerListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'food-court',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF']}>
                <FoodCourtListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'retail',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF']}>
                <RetailListPage />
              </RoleGuard>
            ),
          },
          {
            path: 'pos',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF']}>
                <POSScreen />
              </RoleGuard>
            ),
          },
          {
            path: 'notifications',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF', 'OPERATIONS_STAFF']}>
                <NotificationPage />
              </RoleGuard>
            ),
          },
          {
            path: 'support',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF', 'OPERATIONS_STAFF']}>
                <SupportPage />
              </RoleGuard>
            ),
          },
          {
            path: 'incidents',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'OPERATIONS_STAFF']}>
                <IncidentPage />
              </RoleGuard>
            ),
          },
          {
            path: 'operational',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                <OperationalDashboardPage />
              </RoleGuard>
            ),
          },
          {
            path: 'reports',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                <ReportsPage />
              </RoleGuard>
            ),
          },
          {
            path: 'exports',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER']}>
                <ExportPage />
              </RoleGuard>
            ),
          },
          {
            path: 'profile',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN', 'PARK_MANAGER', 'SALES_STAFF', 'OPERATIONS_STAFF']}>
                <ProfilePage />
              </RoleGuard>
            ),
          },
          {
            path: 'settings',
            element: (
              <RoleGuard allowedRoles={['SYSTEM_ADMIN']}>
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
