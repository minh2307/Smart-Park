import React from 'react';
import { Card, Typography, Box, Stack, useTheme } from '@mui/material';
import StarsIcon from '@mui/icons-material/Stars';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

interface UpgradeBannerProps {
  nextTierName: string;
  requiredPoints: number;
}

export const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ nextTierName, requiredPoints }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        bgcolor: 'rgba(45, 212, 191, 0.1)',
        border: '1px solid rgba(45, 212, 191, 0.2)',
        borderRadius: 3,
        p: 2.5,
        mt: 3,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'rgba(45, 212, 191, 0.2)',
          }}
        >
          <ArrowUpwardIcon sx={{ color: '#2dd4bf' }} />
        </Box>
        <Stack spacing={0.5}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2dd4bf' }}>
            Cơ hội thăng hạng: {nextTierName}
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            Bạn chỉ còn cách hạng thẻ mới <strong>{requiredPoints} điểm tích lũy</strong>. Mua sắm dịch vụ ngay hôm nay để nhận thêm nhiều đặc quyền!
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};
