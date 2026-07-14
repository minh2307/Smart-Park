/**
 * NotificationBell.tsx
 *
 * Re-exports the existing NotificationBadge from the engagement feature module.
 * This provides a stable Navbar-scoped import path while keeping the implementation
 * in its canonical location (features/engagement/components/NotificationBadge.tsx).
 */
export { NotificationBadge as NotificationBell } from '../../features/engagement';
