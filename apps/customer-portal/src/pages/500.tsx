import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@shared/config';

export const ServerErrorPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h1" gutterBottom color="warning">
          500
        </Typography>
        <Typography variant="h4" gutterBottom>
          Lỗi máy chủ nội bộ
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Hệ thống gặp sự cố ngoài ý muốn. Vui lòng thử lại sau.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate(ROUTES.HOME)}>
          Quay lại Trang chủ
        </Button>
      </Box>
    </Container>
  );
};
