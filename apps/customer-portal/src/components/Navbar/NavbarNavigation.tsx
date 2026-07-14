import React, { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@shared/config';

interface NavItem {
  label: string;
  to: string;
  color?: string;
}

interface NavbarNavigationProps {
  isAuthenticated: boolean;
}

const GUEST_ITEMS: NavItem[] = [
  { label: 'Công viên & Trò chơi', to: '/tickets' },
];

const AUTH_ITEMS: NavItem[] = [
  { label: 'Công viên & Trò chơi', to: '/tickets' },
  { label: 'Ví vé', to: ROUTES.WALLET, color: '#38bdf8' },
  { label: 'Đơn hàng', to: ROUTES.ORDERS, color: '#94a3b8' },
  { label: 'Hỗ trợ AI', to: ROUTES.CHATBOT, color: '#a78bfa' },
];

export const NavbarNavigation: React.FC<NavbarNavigationProps> = React.memo(({ isAuthenticated }) => {
  const items = useMemo(() => (isAuthenticated ? AUTH_ITEMS : GUEST_ITEMS), [isAuthenticated]);

  return (
    <Box
      component="nav"
      aria-label="Điều hướng chính"
      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
    >
      {items.map((item) => (
        <NavbarItem key={item.to} label={item.label} to={item.to} accentColor={item.color} />
      ))}
    </Box>
  );
});

NavbarNavigation.displayName = 'NavbarNavigation';

// ─── NavbarItem ──────────────────────────────────────────────────────────────

interface NavbarItemProps {
  label: string;
  to: string;
  accentColor?: string;
}

const getReadableColor = (color: string | undefined, isDark: boolean) => {
  if (isDark) {
    return color || '#2dd4bf';
  }
  switch (color) {
    case '#38bdf8':
      return '#0288d1';
    case '#94a3b8':
      return '#475569';
    case '#a78bfa':
      return '#7c3aed';
    case '#2dd4bf':
    default:
      return '#0d9488';
  }
};

export const NavbarItem: React.FC<NavbarItemProps> = React.memo(({ label, to, accentColor }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const color = getReadableColor(accentColor, isDark);

  return (
    <NavLink
      to={to}
      style={{ textDecoration: 'none' }}
      aria-label={label}
    >
      {({ isActive }) => (
        <Box
          component={motion.div}
          whileHover={{ y: -1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          sx={{
            position: 'relative',
            px: 1.5,
            py: 0.75,
            borderRadius: '8px',
            cursor: 'pointer',
            outline: 'none',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.9rem',
            fontWeight: isActive ? 700 : 500,
            color: isActive ? color : (isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)'),
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            transition: 'color 0.2s ease, background 0.2s ease',
            '&:hover': {
              color: color,
              background: `${color}14`,
            },
            '&:focus-visible': {
              outline: `2px solid ${color}`,
              outlineOffset: '2px',
            },
          }}
        >
          {label}
          {/* Animated active underline */}
          {isActive && (
            <Box
              component={motion.span}
              layoutId="navbar-active-indicator"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              sx={{
                position: 'absolute',
                bottom: 1,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: '2px',
                borderRadius: '1px',
                background: color,
                boxShadow: `0 0 8px ${color}88`,
              }}
            />
          )}
        </Box>
      )}
    </NavLink>
  );
});

NavbarItem.displayName = 'NavbarItem';
