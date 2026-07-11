import { createBrowserRouter } from 'react-router-dom';
import { GuestLayout } from '../layouts/GuestLayout';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { GuestRoute } from '../routes/GuestRoute';
import { NotFoundPage } from '../pages/404';
import { UnauthorizedPage } from '../pages/401';
import { ForbiddenPage } from '../pages/403';
import { ServerErrorPage } from '../pages/500';

import { HomePage } from '../pages/Home';
import { BookingPage, CartPage } from '../features/booking';
import { TicketListPage, TicketDetailPage } from '../features/tickets';
import { CheckoutPage, PaymentResultPage } from '../features/checkout';
import { MyTicketsPage, MyTicketDetailPage } from '../features/my-ticket';
import { MembershipPage } from '../features/membership';
import { ProfilePage } from '../features/profile';

// Temporary mock landing pages to satisfy routing map without business features
const LoginPage = () => <div>Đăng nhập</div>;
const RegisterPage = () => <div>Đăng ký</div>;
const VenuesPage = () => <div>Khám phá Công viên & Trò chơi</div>;
const ChatbotPage = () => <div>Hỗ trợ Trợ lý AI Chatbot</div>;

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      // Guest Layout Pages
      {
        element: <GuestLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'venues',
            element: <VenuesPage />,
          },
          // ─── Ticket Module ────────────────────────────
          {
            path: 'tickets',
            element: <TicketListPage />,
          },
          {
            path: 'tickets/:venueId/:ticketId',
            element: <TicketDetailPage />,
          },
          {
            path: 'cart',
            element: <CartPage />,
          },
          {
            path: 'checkout/payment-result',
            element: <PaymentResultPage />,
          },
        ],
      },
      // Auth Layout Pages
      {
        element: (
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        ),
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
        ],
      },
      // Main Authenticated Layout Pages
      {
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'booking',
            element: <BookingPage />,
          },
          {
            path: 'checkout',
            element: <CheckoutPage />,
          },
          {
            path: 'wallet',
            element: <MyTicketsPage />,
          },
          {
            path: 'wallet/ticket/:ticketCode',
            element: <MyTicketDetailPage />,
          },
          {
            path: 'membership',
            element: <MembershipPage />,
          },
          {
            path: 'ai-assistant',
            element: <ChatbotPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
      // Error Page Routes
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
      {
        path: 'forbidden',
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

