import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@shared/config';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h1" gutterBottom color="primary">
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Không tìm thấy trang yêu cầu
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Trang bạn đang truy cập không tồn tại hoặc đã bị di chuyển.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate(ROUTES.HOME)}>
          Quay lại Trang chủ
        </Button>
      </Box>
    </Container>
  );
};
