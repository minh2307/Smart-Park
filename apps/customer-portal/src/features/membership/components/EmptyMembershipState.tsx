import React from 'react';
import { Card, CardContent, Typography, Button, Box, Stack } from '@mui/material';
import LoyaltyIcon from '@mui/icons-material/Loyalty';

interface EmptyMembershipStateProps {
  onActivate: () => void;
}

export const EmptyMembershipState: React.FC<EmptyMembershipStateProps> = ({ onActivate }) => {
  return (
    <Card
      sx={{
        bgcolor: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 4,
        textAlign: 'center',
        py: 6,
        px: 4,
      }}
    >
      <CardContent>
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'rgba(45, 212, 191, 0.1)',
            }}
          >
            <LoyaltyIcon sx={{ fontSize: 40, color: '#2dd4bf' }} />
          </Box>

          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Chương Trình Thành Viên Smart Park
            </Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.6)" sx={{ maxWidth: 500 }}>
              Đăng ký chương trình hội viên ngay hôm nay để nhận tích lũy điểm thưởng từ mọi giao dịch mua vé, ưu đãi giảm giá hạng thẻ và hàng ngàn voucher hấp dẫn.
            </Typography>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            onClick={onActivate}
            sx={{
              bgcolor: '#2dd4bf',
              color: '#0f172a',
              fontWeight: 'bold',
              px: 4,
              py: 1.2,
              borderRadius: 3,
              '&:hover': {
                bgcolor: '#14b8a6',
              },
            }}
          >
            Kích Hoạt Thẻ Thành Viên
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
export default EmptyMembershipState;
