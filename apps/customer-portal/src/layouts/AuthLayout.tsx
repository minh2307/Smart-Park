import { Outlet } from 'react-router-dom';
import { Box, Paper, Typography } from '@mui/material';

export const AuthLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      {/* Branding Column - Hidden on mobile */}
      <Box
        sx={{
          flex: { xs: 0, sm: 4, md: 7 },
          display: { xs: 'none', sm: 'flex' },
          backgroundImage: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#ffffff',
          p: 4,
        }}
      >
        <Box sx={{ maxWidth: 450, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Smart Park
          </Typography>
          <Typography variant="h5">
            Cổng thông tin khách hàng thông minh. Quản lý vé điện tử, đặt dịch vụ và tích lũy điểm thưởng thành viên dễ dàng.
          </Typography>
        </Box>
      </Box>

      {/* Auth Form Column */}
      <Box
        component={Paper}
        elevation={6}
        sx={{
          flex: { xs: 12, sm: 8, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderRadius: 0,
        }}
      >
        <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
