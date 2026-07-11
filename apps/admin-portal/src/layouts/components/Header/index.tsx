import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  MdNotifications,
  MdSearch,
  MdFullscreen,
  MdFullscreenExit,
  MdDarkMode,
  MdLightMode,
  MdMenu,
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import { toggleTheme } from '../../../theme/themeSlice';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { Breadcrumb } from '../Breadcrumb';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(20, 28, 46, 0.8)'
            : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, md: 3 }, minHeight: { xs: 56, md: 64 } }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            edge="start"
            onClick={onToggleSidebar}
            sx={{ display: { lg: 'none' } }}
          >
            <MdMenu size={20} />
          </IconButton>
          <Breadcrumb />
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <Tooltip title="Tìm kiếm">
            <IconButton color="inherit" size="small">
              <MdSearch size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title={themeMode === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}>
            <IconButton color="inherit" size="small" onClick={handleThemeToggle}>
              {themeMode === 'light' ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
            </IconButton>
          </Tooltip>

          <Tooltip title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}>
            <IconButton color="inherit" size="small" onClick={handleToggleFullscreen}>
              {isFullscreen ? <MdFullscreenExit size={20} /> : <MdFullscreen size={20} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Thông báo">
            <IconButton color="inherit" size="small">
              <Badge badgeContent={4} color="error">
                <MdNotifications size={20} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5 }} />

          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              px: 1,
              py: 0.5,
              borderRadius: 2.5,
              transition: 'background-color 0.15s ease',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
            role="button"
            aria-label="account menu"
            aria-haspopup="true"
            tabIndex={0}
          >
            <Avatar
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2.5,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                fontSize: '0.8125rem',
                fontWeight: 700,
              }}
            >
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
                {user?.role}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            slotProps={{
              paper: {
                sx: { minWidth: 200, mt: 1 },
              },
            }}
          >
            <Box px={2} py={1.5}>
              <Typography variant="subtitle2" fontWeight={700}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || user?.role}
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                navigate('/admin/profile');
              }}
            >
              Hồ sơ cá nhân
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                logout();
              }}
              sx={{ color: 'error.main' }}
            >
              Đăng xuất
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
