import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, Container, Badge, IconButton } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@shared/config';
import { useAppSelector } from '../store/hooks';
import { selectCartCount } from '../features/booking/store/bookingSelectors';

export const GuestLayout = () => {
  const navigate = useNavigate();
  const cartCount = useAppSelector(selectCartCount);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button color="inherit" onClick={() => navigate(ROUTES.VENUES)} sx={{ mr: 2 }}>
              Công viên & Trò chơi
            </Button>
            
            <IconButton color="inherit" onClick={() => navigate('/cart')} sx={{ mr: 2 }}>
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            <Button variant="contained" color="primary" onClick={() => navigate(ROUTES.LOGIN)}>
              Đăng nhập
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
