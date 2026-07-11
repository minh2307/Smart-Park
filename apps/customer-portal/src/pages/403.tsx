import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@shared/config';

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h1" gutterBottom color="error">
          403
        </Typography>
        <Typography variant="h4" gutterBottom>
          Truy cập bị từ chối
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Bạn không có quyền truy cập vào tài nguyên này.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate(ROUTES.HOME)}>
          Quay lại Trang chủ
        </Button>
      </Box>
    </Container>
  );
};
