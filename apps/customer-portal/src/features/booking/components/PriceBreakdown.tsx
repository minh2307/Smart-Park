import React from 'react';
import { Box, Stack, Typography, Divider, useTheme, alpha } from '@mui/material';
import { formatCurrency } from '@shared/utils';

interface PriceBreakdownProps {
  subtotal: number;
  couponDiscount: number;
  membershipDiscount: number;
  finalTotal: number;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  subtotal,
  couponDiscount,
  membershipDiscount,
  finalTotal,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 2.5, backgroundColor: alpha(theme.palette.background.default, 0.5), borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2" fontWeight={700} fontFamily="Outfit, sans-serif" sx={{ mb: 2 }}>
        Chi tiết thanh toán
      </Typography>

      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Tạm tính
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {formatCurrency(subtotal)}
          </Typography>
        </Stack>

        {couponDiscount > 0 && (
          <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
            <Typography variant="body2">
              Giảm giá Coupon
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              -{formatCurrency(couponDiscount)}
            </Typography>
          </Stack>
        )}

        {membershipDiscount > 0 && (
          <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
            <Typography variant="body2">
              Giảm giá Thành viên
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              -{formatCurrency(membershipDiscount)}
            </Typography>
          </Stack>
        )}

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={700} fontFamily="Outfit, sans-serif">
            Tổng cộng
          </Typography>
          <Typography variant="h5" fontWeight={800} color="primary.main" fontFamily="Outfit, sans-serif">
            {formatCurrency(finalTotal)}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};
