import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@shared/config';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h1" gutterBottom color="error">
          401
        </Typography>
        <Typography variant="h4" gutterBottom>
          Yêu cầu đăng nhập
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Vui lòng đăng nhập tài khoản khách hàng để truy cập trang này.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate(ROUTES.LOGIN)}>
          Đăng nhập ngay
        </Button>
      </Box>
    </Container>
  );
};
