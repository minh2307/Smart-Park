import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { GuestLayout } from '../layouts/GuestLayout';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { GuestRoute } from '../routes/GuestRoute';
import { PageLoader } from '../components/PageLoader';
import { ErrorBoundary } from '../components/ErrorBoundary';

// ─── Lazy-loaded pages (code split per route) ────────────────────────────────
const HomePage        = lazy(() => import('../pages/Home').then((m) => ({ default: m.HomePage })));
const NotFoundPage    = lazy(() => import('../pages/404').then((m) => ({ default: m.NotFoundPage })));
const UnauthorizedPage= lazy(() => import('../pages/401').then((m) => ({ default: m.UnauthorizedPage })));
const ForbiddenPage   = lazy(() => import('../pages/403').then((m) => ({ default: m.ForbiddenPage })));
const ServerErrorPage = lazy(() => import('../pages/500').then((m) => ({ default: m.ServerErrorPage })));

// Auth
const LoginPage    = lazy(() => import('../features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })));

// Features
const BookingPage      = lazy(() => import('../features/booking').then((m) => ({ default: m.BookingPage })));
const CartPage         = lazy(() => import('../features/booking').then((m) => ({ default: m.CartPage })));
const TicketListPage   = lazy(() => import('../features/tickets').then((m) => ({ default: m.TicketListPage })));
const TicketDetailPage = lazy(() => import('../features/tickets').then((m) => ({ default: m.TicketDetailPage })));
const CheckoutPage     = lazy(() => import('../features/checkout').then((m) => ({ default: m.CheckoutPage })));
const PaymentResultPage= lazy(() => import('../features/checkout').then((m) => ({ default: m.PaymentResultPage })));
const MyTicketsPage    = lazy(() => import('../features/my-ticket').then((m) => ({ default: m.MyTicketsPage })));
const MyTicketDetailPage=lazy(() => import('../features/my-ticket').then((m) => ({ default: m.MyTicketDetailPage })));
const MembershipPage   = lazy(() => import('../features/membership').then((m) => ({ default: m.MembershipPage })));
const ProfilePage      = lazy(() => import('../features/profile').then((m) => ({ default: m.ProfilePage })));
const OrderListPage    = lazy(() => import('../features/orders').then((m) => ({ default: m.OrderListPage })));
const OrderDetailPage  = lazy(() => import('../features/orders').then((m) => ({ default: m.OrderDetailPage })));
const EngagementPage   = lazy(() => import('../features/engagement').then((m) => ({ default: m.EngagementPage })));

// ─── Suspense wrapper reused per route ───────────────────────────────────────
const withSuspense = (element: React.ReactNode) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>{element}</Suspense>
  </ErrorBoundary>
);

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      // ─── Guest Layout (public) ────────────────────────────────────────────
      {
        element: <GuestLayout />,
        children: [
          {
            index: true,
            element: withSuspense(<HomePage />),
          },
          {
            path: 'tickets',
            element: withSuspense(<TicketListPage />),
          },
          {
            path: 'tickets/:venueId/:ticketId',
            element: withSuspense(<TicketDetailPage />),
          },
          {
            path: 'cart',
            element: withSuspense(<CartPage />),
          },
          {
            path: 'checkout/payment-result',
            element: withSuspense(<PaymentResultPage />),
          },
        ],
      },

      // ─── Auth Layout (guest-only) ─────────────────────────────────────────
      {
        element: (
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        ),
        children: [
          {
            path: 'login',
            element: withSuspense(<LoginPage />),
          },
          {
            path: 'register',
            element: withSuspense(<RegisterPage />),
          },
        ],
      },

      // ─── Main Authenticated Layout ────────────────────────────────────────
      {
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'booking',
            element: withSuspense(<BookingPage />),
          },
          {
            path: 'checkout',
            element: withSuspense(<CheckoutPage />),
          },
          {
            path: 'wallet',
            element: withSuspense(<MyTicketsPage />),
          },
          {
            path: 'wallet/ticket/:ticketCode',
            element: withSuspense(<MyTicketDetailPage />),
          },
          {
            path: 'membership',
            element: withSuspense(<MembershipPage />),
          },
          {
            path: 'ai-assistant',
            element: withSuspense(<EngagementPage />),
          },
          {
            path: 'profile',
            element: withSuspense(<ProfilePage />),
          },
          {
            path: 'orders',
            element: withSuspense(<OrderListPage />),
          },
          {
            path: 'orders/:id',
            element: withSuspense(<OrderDetailPage />),
          },
        ],
      },

      // ─── Error Routes ─────────────────────────────────────────────────────
      {
        path: 'unauthorized',
        element: withSuspense(<UnauthorizedPage />),
      },
      {
        path: 'forbidden',
        element: withSuspense(<ForbiddenPage />),
      },
      {
        path: '500',
        element: withSuspense(<ServerErrorPage />),
      },
      {
        path: '*',
        element: withSuspense(<NotFoundPage />),
      },
    ],
  },
]);
