import React, { useState, useCallback } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Menu,
  Typography,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@shared/config';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '@shared/api';

interface MenuItemConfig {
  label: string;
  icon: React.ReactNode;
  route?: string;
  action?: () => void;
  color?: string;
}

export const UserAvatar: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'SP';

  const handleOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback(() => setAnchorEl(null), []);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    handleClose();
    navigate(ROUTES.LOGIN);
  }, [dispatch, handleClose, navigate]);

  const navigateTo = useCallback((route: string) => {
    navigate(route);
    handleClose();
  }, [navigate, handleClose]);

  const menuItems: MenuItemConfig[] = [
    { label: 'Hồ sơ cá nhân', icon: <AccountCircleIcon fontSize="small" />, route: ROUTES.PROFILE },
    { label: 'Đơn hàng của tôi', icon: <ReceiptLongIcon fontSize="small" />, route: ROUTES.ORDERS },
    { label: 'Ví vé điện tử', icon: <AccountBalanceWalletIcon fontSize="small" />, route: ROUTES.WALLET },
  ];

  return (
    <>
      <Tooltip title="Tài khoản" arrow placement="bottom">
        <Box
          component={motion.div}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <IconButton
            onClick={handleOpen}
            aria-label="Menu tài khoản"
            aria-haspopup="menu"
            aria-expanded={open}
            sx={{
              p: 0.4,
              borderRadius: '12px',
              '&:focus-visible': {
                outline: '2px solid #2dd4bf',
                outlineOffset: '2px',
              },
            }}
          >
            <Avatar
              src={user?.avatarUrl ?? undefined}
              alt={user?.username ?? 'Khách hàng'}
              sx={{
                width: 34,
                height: 34,
                bgcolor: 'transparent',
                background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                fontSize: '0.8rem',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                border: '2px solid rgba(45,212,191,0.5)',
                boxShadow: open ? '0 0 0 3px rgba(45,212,191,0.2)' : 'none',
                transition: 'box-shadow 0.2s ease',
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Box>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        role="menu"
        aria-label="Menu người dùng"
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        TransitionComponent={undefined}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 220,
              borderRadius: '14px',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
              background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: isDark
                ? '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(45,212,191,0.1)'
                : '0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(13,148,136,0.1)',
              overflow: 'visible',
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: -6,
                right: 18,
                width: 12,
                height: 12,
                background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                borderBottom: 'none',
                borderRight: 'none',
                transform: 'rotate(45deg)',
              },
            },
          },
        }}
      >
        {/* User info header */}
        <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
          <Typography
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: isDark ? '#fff' : '#0f172a',
              lineHeight: 1.2,
            }}
          >
            {user?.username ?? 'Khách hàng'}
          </Typography>
          {user?.email && (
            <Typography
              sx={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.78rem',
                color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.6)',
                mt: 0.3,
              }}
            >
              {user.email}
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', mx: 1 }} />

        {/* Navigation items */}
        {menuItems.map((item) => (
          <UserMenuItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            onClick={() => item.route && navigateTo(item.route)}
          />
        ))}

        <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', mx: 1, my: 0.5 }} />

        {/* Logout */}
        <UserMenuItem
          label="Đăng xuất"
          icon={<LogoutIcon fontSize="small" />}
          onClick={handleLogout}
          color="#f87171"
        />
        <Box sx={{ pb: 0.5 }} />
      </Menu>
    </>
  );
});

UserAvatar.displayName = 'UserAvatar';

// ─── Sub-component ────────────────────────────────────────────────────────────

interface UserMenuItemProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

const UserMenuItem: React.FC<UserMenuItemProps> = ({ label, icon, onClick, color }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      component={motion.div}
      whileHover={{ x: 3 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onClick={onClick}
      role="menuitem"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2.5,
        py: 1.1,
        cursor: 'pointer',
        color: color ?? (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.8)'),
        fontFamily: 'Outfit, sans-serif',
        fontSize: '0.88rem',
        fontWeight: 500,
        transition: 'background 0.15s, color 0.15s',
        outline: 'none',
        '&:hover': {
          background: color ? 'rgba(248,113,113,0.08)' : 'rgba(45,212,191,0.07)',
          color: color ?? '#2dd4bf',
        },
        '&:focus-visible': {
          background: color ? 'rgba(248,113,113,0.08)' : 'rgba(45,212,191,0.07)',
          outline: `1px solid ${color ?? '#2dd4bf'}`,
          outlineOffset: '-2px',
          borderRadius: '6px',
        },
        '& .MuiSvgIcon-root': {
          color: color ?? (isDark ? 'rgba(255,255,255,0.45)' : 'rgba(15,23,42,0.45)'),
          transition: 'color 0.15s',
        },
        '&:hover .MuiSvgIcon-root': {
          color: color ?? '#2dd4bf',
        },
      }}
    >
      {icon}
      {label}
    </Box>
  );
};
