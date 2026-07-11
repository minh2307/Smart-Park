import React from 'react';
import { Card, CardContent, Typography, Stack, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export const EmptyProfileState: React.FC = () => {
  return (
    <Card
      sx={{
        bgcolor: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 4,
        textAlign: 'center',
        py: 8,
        px: 4,
      }}
    >
      <CardContent>
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.05)',
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
          </Box>
          <Typography variant="h6" color="rgba(255,255,255,0.7)">
            Không tìm thấy hồ sơ cá nhân
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.5)">
            Vui lòng liên hệ bộ phận hỗ trợ khách hàng hoặc kiểm tra lại thông tin tài khoản đăng nhập của bạn.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
export default EmptyProfileState;
