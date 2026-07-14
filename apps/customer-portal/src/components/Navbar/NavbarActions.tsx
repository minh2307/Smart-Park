import React, { useCallback } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectCartCount } from '../../features/booking/store/bookingSelectors';
import { NotificationBell } from './NotificationBell';
import { UserAvatar } from './UserAvatar';
import { toggleTheme } from '@shared/api';

interface NavbarActionsProps {
  isAuthenticated: boolean;
}

export const NavbarActions: React.FC<NavbarActionsProps> = React.memo(({ isAuthenticated }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const themeMode = useAppSelector((state) => state.theme.mode);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleCart = useCallback(() => navigate('/cart'), [navigate]);
  const handleToggleTheme = useCallback(() => dispatch(toggleTheme()), [dispatch]);

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
      role="group"
      aria-label="Hành động điều hướng"
    >
      {/* Shopping Cart - always visible */}
      <Tooltip title="Giỏ hàng" arrow placement="bottom">
        <Box
          component={motion.div}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <IconButton
            onClick={handleCart}
            aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}
            size="medium"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.8)',
              borderRadius: '10px',
              transition: 'color 0.2s, background 0.2s',
              '&:hover': {
                color: '#2dd4bf',
                background: 'rgba(45,212,191,0.1)',
              },
              '&:focus-visible': {
                outline: '2px solid #2dd4bf',
                outlineOffset: '2px',
              },
            }}
          >
            <Badge
              badgeContent={cartCount}
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.65rem',
                  height: 16,
                  minWidth: 16,
                  fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif',
                },
              }}
            >
              <ShoppingCartIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Box>
      </Tooltip>

      {/* Theme toggle - always visible */}
      <Tooltip
        title={themeMode === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
        arrow
        placement="bottom"
      >
        <Box
          component={motion.div}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <IconButton
            onClick={handleToggleTheme}
            aria-label={themeMode === 'dark' ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
            size="medium"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.8)',
              borderRadius: '10px',
              transition: 'color 0.2s, background 0.2s',
              '&:hover': {
                color: '#f59e0b',
                background: 'rgba(245,158,11,0.1)',
              },
              '&:focus-visible': {
                outline: '2px solid #f59e0b',
                outlineOffset: '2px',
              },
            }}
          >
            {themeMode === 'dark'
              ? <LightModeIcon fontSize="small" />
              : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Tooltip>

      {/* Authenticated-only actions */}
      {isAuthenticated && (
        <>
          <NotificationBell />
          <UserAvatar />
        </>
      )}

      {/* Guest login button */}
      {!isAuthenticated && (
        <Box
          component={motion.button}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          onClick={() => navigate('/login')}
          aria-label="Đăng nhập vào Smart Park"
          sx={{
            ml: 1,
            px: 2.5,
            py: 0.85,
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: '0.88rem',
            letterSpacing: '-0.01em',
            color: '#0f172a',
            background: 'linear-gradient(135deg, #2dd4bf 0%, #0ea5e9 100%)',
            boxShadow: '0 2px 12px rgba(45,212,191,0.35)',
            transition: 'box-shadow 0.2s ease',
            '&:hover': {
              boxShadow: '0 4px 20px rgba(45,212,191,0.5)',
            },
            '&:focus-visible': {
              outline: '2px solid #2dd4bf',
              outlineOffset: '3px',
            },
          }}
        >
          Đăng nhập
        </Box>
      )}
    </Box>
  );
});

NavbarActions.displayName = 'NavbarActions';
