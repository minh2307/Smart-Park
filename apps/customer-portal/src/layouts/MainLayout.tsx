import { Outlet, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, Container, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useState } from 'react';
import { ROUTES } from '@shared/config';
import ExploreIcon from '@mui/icons-material/Explore';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ChatIcon from '@mui/icons-material/Chat';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export const MainLayout = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [navValue, setNavValue] = useState(0);

  const handleNavigation = (newValue: number) => {
    setNavValue(newValue);
    switch (newValue) {
      case 0:
        navigate(ROUTES.VENUES);
        break;
      case 1:
        navigate(ROUTES.BOOKING);
        break;
      case 2:
        navigate(ROUTES.WALLET);
        break;
      case 3:
        navigate(ROUTES.CHATBOT);
        break;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', pb: isMobile ? 7 : 0 }}>
      {/* Desktop Header */}
      {!isMobile && (
        <AppBar position="sticky" color="default" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
          <Toolbar component={Container} maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 'bold', color: 'primary.main', cursor: 'pointer' }}
              onClick={() => navigate(ROUTES.HOME)}
            >
              Smart Park
            </Typography>
            <Box>
              <Button color="inherit" onClick={() => navigate(ROUTES.VENUES)} sx={{ mr: 2 }}>
                Địa điểm
              </Button>
              <Button color="inherit" onClick={() => navigate(ROUTES.BOOKING)} sx={{ mr: 2 }}>
                Đặt vé
              </Button>
              <Button color="inherit" onClick={() => navigate(ROUTES.WALLET)} sx={{ mr: 2 }}>
                Ví vé
              </Button>
              <Button color="inherit" onClick={() => navigate(ROUTES.CHATBOT)} sx={{ mr: 2 }}>
                Hỗ trợ AI
              </Button>
              <Button variant="outlined" color="primary" onClick={() => navigate(ROUTES.PROFILE)}>
                Cá nhân
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      {/* Main Outlet */}
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
          <BottomNavigation
            showLabels
            value={navValue}
            onChange={(_, newValue) => handleNavigation(newValue)}
          >
            <BottomNavigationAction label="Khám phá" icon={<ExploreIcon />} />
            <BottomNavigationAction label="Đặt vé" icon={<ConfirmationNumberIcon />} />
            <BottomNavigationAction label="Ví vé" icon={<ConfirmationNumberIcon />} />
            <BottomNavigationAction label="Trợ lý AI" icon={<ChatIcon />} />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};
