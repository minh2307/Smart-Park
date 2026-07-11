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
import { BookingPage } from '../pages/Booking';
import { TicketListPage, TicketDetailPage } from '../features/tickets';

// Temporary mock landing pages to satisfy routing map without business features
const LoginPage = () => <div>Đăng nhập</div>;
const RegisterPage = () => <div>Đăng ký</div>;
const VenuesPage = () => <div>Khám phá Công viên & Trò chơi</div>;
const WalletPage = () => <div>Ví vé điện tử cá nhân</div>;
const MembershipPage = () => <div>Loyalty & VIP Membership</div>;
const ChatbotPage = () => <div>Hỗ trợ Trợ lý AI Chatbot</div>;
const ProfilePage = () => <div>Hồ sơ cá nhân khách hàng</div>;

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
            path: 'wallet',
            element: <WalletPage />,
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

