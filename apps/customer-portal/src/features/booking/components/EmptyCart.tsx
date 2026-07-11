import React from 'react';
import { Box, Typography, Button, useTheme, alpha } from '@mui/material';
import { ShoppingCartOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const EmptyCart: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 4,
        borderRadius: 5,
        backgroundColor: alpha(theme.palette.background.default, 0.4),
        border: '1px dashed',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          p: 3,
          borderRadius: '50%',
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          color: 'primary.main',
          mb: 3,
        }}
      >
        <ShoppingCartOutlined sx={{ fontSize: 64 }} />
      </Box>

      <Typography
        variant="h5"
        fontWeight={800}
        fontFamily="Outfit, sans-serif"
        sx={{ mb: 1, color: 'text.primary' }}
      >
        Giỏ hàng của bạn đang trống
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 360 }}>
        Khám phá các loại vé tham quan, combo gia đình và dịch vụ VIP tại Smart Park để lên lịch trình ngay.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => navigate('/tickets')}
        sx={{ fontWeight: 700, borderRadius: 3, px: 4 }}
      >
        Mua vé ngay
      </Button>
    </Box>
  );
};
