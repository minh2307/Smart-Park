import React, { useState, useCallback } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Divider,
  Avatar,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExploreIcon from '@mui/icons-material/Explore';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@shared/config';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '@shared/api';

interface DrawerNavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  color?: string;
}

const GUEST_DRAWER_ITEMS: DrawerNavItem[] = [
  { label: 'Công viên & Trò chơi', icon: <ExploreIcon />, to: '/tickets' },
];

const AUTH_DRAWER_ITEMS: DrawerNavItem[] = [
  { label: 'Công viên & Trò chơi', icon: <ExploreIcon />, to: '/tickets', color: '#2dd4bf' },
  { label: 'Đặt vé', icon: <ConfirmationNumberIcon />, to: ROUTES.BOOKING, color: '#34d399' },
  { label: 'Ví vé điện tử', icon: <AccountBalanceWalletIcon />, to: ROUTES.WALLET, color: '#38bdf8' },
  { label: 'Đơn hàng của tôi', icon: <ReceiptLongIcon />, to: ROUTES.ORDERS, color: '#94a3b8' },
  { label: 'Hỗ trợ AI', icon: <AutoAwesomeIcon />, to: ROUTES.CHATBOT, color: '#a78bfa' },
];

const getReadableColor = (color: string | undefined, isDark: boolean) => {
  if (isDark) {
    return color || '#2dd4bf';
  }
  switch (color) {
    case '#2dd4bf':
      return '#0d9488';
    case '#34d399':
      return '#059669';
    case '#38bdf8':
      return '#0288d1';
    case '#94a3b8':
      return '#475569';
    case '#a78bfa':
      return '#7c3aed';
    default:
      return '#0d9488';
  }
};

interface MobileDrawerProps {
  isAuthenticated: boolean;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = React.memo(({ isAuthenticated }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const items = isAuthenticated ? AUTH_DRAWER_ITEMS : GUEST_DRAWER_ITEMS;

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleNavigate = useCallback((to: string) => {
    navigate(to);
    handleClose();
  }, [navigate, handleClose]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    handleClose();
    navigate(ROUTES.LOGIN);
  }, [dispatch, handleClose, navigate]);

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'SP';

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label="Mở menu điều hướng"
        aria-expanded={open}
        aria-haspopup="dialog"
        sx={{
          color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.8)',
          borderRadius: '10px',
          '&:hover': { background: 'rgba(45,212,191,0.1)', color: '#2dd4bf' },
          '&:focus-visible': { outline: '2px solid #2dd4bf', outlineOffset: '2px' },
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        aria-label="Menu điều hướng di động"
        PaperProps={{
          sx: {
            width: 300,
            background: isDark ? 'rgba(10,18,32,0.97)' : 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: isDark ? '-12px 0 60px rgba(0,0,0,0.5)' : '-12px 0 60px rgba(0,0,0,0.08)',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 800,
              fontSize: '1.1rem',
              background: isDark
                ? 'linear-gradient(135deg, #fff 40%, #2dd4bf 100%)'
                : 'linear-gradient(135deg, #0f172a 40%, #0d9488 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Smart Park
          </Typography>
          <IconButton
            onClick={handleClose}
            aria-label="Đóng menu"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)',
              borderRadius: '8px',
              '&:hover': { color: isDark ? '#fff' : '#0f172a', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
              '&:focus-visible': { outline: '2px solid #2dd4bf' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* User info (authenticated only) */}
        {isAuthenticated && (
          <>
            <Box sx={{ px: 2.5, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                src={user?.avatarUrl ?? undefined}
                sx={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: '2px solid rgba(45,212,191,0.4)',
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: isDark ? '#fff' : '#0f172a' }}>
                  {user?.username ?? 'Khách hàng'}
                </Typography>
                {user?.email && (
                  <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.73rem', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.6)' }}>
                    {user.email}
                  </Typography>
                )}
              </Box>
            </Box>
            <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', mx: 2, mb: 1 }} />
          </>
        )}

        {/* Nav items */}
        <Box component="nav" aria-label="Điều hướng mobile" sx={{ px: 1.5, pt: 1 }}>
          {items.map((item, i) => {
            const itemColor = getReadableColor(item.color, isDark);
            return (
              <Box
                key={item.to}
                component={motion.div}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 28 }}
                onClick={() => handleNavigate(item.to)}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleNavigate(item.to); }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: 2,
                  py: 1.4,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  mb: 0.5,
                  color: itemColor,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  transition: 'background 0.15s, color 0.15s',
                  '&:hover': {
                    background: `${itemColor}14`,
                    color: itemColor,
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${itemColor}`,
                    outlineOffset: '-2px',
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.15rem',
                    color: `${itemColor}bb`,
                  },
                }}
              >
                {item.icon}
                {item.label}
              </Box>
            );
          })}
        </Box>

        {/* Authenticated footer actions */}
        {isAuthenticated && (
          <>
            <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', mx: 2, mt: 1, mb: 1 }} />
            <Box sx={{ px: 1.5, pb: 2 }}>
              {[
                { label: 'Hồ sơ cá nhân', icon: <AccountCircleIcon />, to: ROUTES.PROFILE },
              ].map((item) => (
                <Box
                  key={item.to}
                  onClick={() => handleNavigate(item.to)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 2,
                    px: 2, py: 1.2, borderRadius: '10px', cursor: 'pointer', mb: 0.5,
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)', fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.9rem', fontWeight: 500,
                    '&:hover': { background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', color: isDark ? '#fff' : '#0f172a' },
                  }}
                >
                  {item.icon}{item.label}
                </Box>
              ))}
              <Box
                onClick={handleLogout}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2,
                  px: 2, py: 1.2, borderRadius: '10px', cursor: 'pointer',
                  color: '#f87171', fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.9rem', fontWeight: 600,
                  '&:hover': { background: 'rgba(248,113,113,0.08)' },
                }}
              >
                <LogoutIcon sx={{ fontSize: '1.15rem !important', color: '#f87171 !important' }} />
                Đăng xuất
              </Box>
            </Box>
          </>
        )}

        {/* Guest login action */}
        {!isAuthenticated && (
          <Box sx={{ px: 2.5, pt: 2, pb: 3 }}>
            <Box
              component={motion.button}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigate('/login')}
              sx={{
                width: '100%',
                py: 1.4,
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: '#0f172a',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #0ea5e9 100%)',
                boxShadow: '0 4px 20px rgba(45,212,191,0.3)',
              }}
            >
              Đăng nhập
            </Box>
          </Box>
        )}
      </Drawer>
    </>
  );
});

MobileDrawer.displayName = 'MobileDrawer';
