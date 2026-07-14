import { Outlet } from 'react-router-dom';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { ROUTES } from '@shared/config';
import ExploreIcon from '@mui/icons-material/Explore';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChatIcon from '@mui/icons-material/Chat';
import { Navbar } from '../components/Navbar';

/**
 * MainLayout - wraps authenticated routes (/booking, /wallet, /orders, etc.)
 *
 * Uses the unified Navbar which auto-renders the authenticated variant.
 * On mobile, adds a bottom nav bar for thumb-friendly navigation.
 * Auth state is NOT owned here - it lives in Redux (state.auth).
 */
export const MainLayout = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [navValue, setNavValue] = useState(0);

  const handleNavigation = (newValue: number) => {
    setNavValue(newValue);
    switch (newValue) {
      case 0: navigate(ROUTES.VENUES); break;
      case 1: navigate(ROUTES.BOOKING); break;
      case 2: navigate(ROUTES.WALLET); break;
      case 3: navigate(ROUTES.CHATBOT); break;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: isMobile ? '56px' : 0,
      }}
    >
      <Navbar />

      <Box
        component="main"
        id="main-content"
        sx={{ flexGrow: 1, pt: { xs: '60px', md: '68px' } }}
      >
        <Outlet />
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (() => {
        const isDark = theme.palette.mode === 'dark';
        return (
          <Paper
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1050,
              borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
              background: isDark ? 'rgba(10,18,32,0.97)' : 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            elevation={0}
            component="nav"
            aria-label="Điều hướng mobile"
          >
            <BottomNavigation
              showLabels
              value={navValue}
              onChange={(_, newValue) => handleNavigation(newValue)}
              sx={{
                background: 'transparent',
                '& .MuiBottomNavigationAction-root': {
                  color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary',
                  minWidth: 0,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                },
                '& .MuiBottomNavigationAction-root.Mui-selected': {
                  color: isDark ? '#2dd4bf' : 'primary.main',
                },
                '& .MuiBottomNavigationAction-label': {
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                },
              }}
            >
              <BottomNavigationAction
                label="Khám phá"
                icon={<ExploreIcon fontSize="small" />}
                aria-label="Khám phá công viên"
              />
              <BottomNavigationAction
                label="Đặt vé"
                icon={<ConfirmationNumberIcon fontSize="small" />}
                aria-label="Đặt vé"
              />
              <BottomNavigationAction
                label="Ví vé"
                icon={<AccountBalanceWalletIcon fontSize="small" />}
                aria-label="Ví vé điện tử"
              />
              <BottomNavigationAction
                label="Trợ lý AI"
                icon={<ChatIcon fontSize="small" />}
                aria-label="Hỗ trợ AI"
              />
            </BottomNavigation>
          </Paper>
        );
      })()}
    </Box>
  );
};
