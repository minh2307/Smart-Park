import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Divider, useTheme, alpha } from '@mui/material';
import { ConfirmationNumber, CalendarToday } from '@mui/icons-material';
import { formatCurrency } from '@shared/utils';

interface CheckoutSummaryItem {
  ticketName: string;
  quantity: number;
  price: number;
  visitDate: string;
}

interface CheckoutSummaryProps {
  items: CheckoutSummaryItem[];
  subtotal: number;
  couponDiscount: number;
  membershipDiscount: number;
  finalTotal: number;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  items,
  subtotal,
  couponDiscount,
  membershipDiscount,
  finalTotal,
}) => {
  const theme = useTheme();

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden' }}>
      <Box sx={{ p: 2.5, backgroundColor: alpha(theme.palette.primary.main, 0.04), borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={800} fontFamily="Outfit, sans-serif" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ConfirmationNumber color="primary" />
          Thông tin vé đặt mua
        </Typography>
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {items.map((item, idx) => (
            <Box key={idx}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                <Typography variant="body1" fontWeight={700}>
                  {item.ticketName}
                </Typography>
                <Typography variant="body1" fontWeight={800}>
                  {formatCurrency(item.price * item.quantity)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ color: 'text.secondary' }}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarToday sx={{ fontSize: 14 }} />
                  Ngày: {item.visitDate}
                </Typography>
                <Typography variant="caption">
                  Số lượng: {item.quantity}
                </Typography>
              </Stack>
              {idx < items.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}

          <Divider sx={{ my: 1, borderWidth: 1.5 }} />

          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Tạm tính</Typography>
              <Typography variant="body2" fontWeight={600}>{formatCurrency(subtotal)}</Typography>
            </Stack>

            {couponDiscount > 0 && (
              <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
                <Typography variant="body2">Giảm giá Coupon</Typography>
                <Typography variant="body2" fontWeight={600}>-{formatCurrency(couponDiscount)}</Typography>
              </Stack>
            )}

            {membershipDiscount > 0 && (
              <Stack direction="row" justifyContent="space-between" sx={{ color: 'success.main' }}>
                <Typography variant="body2">Ưu đãi thành viên VIP</Typography>
                <Typography variant="body2" fontWeight={600}>-{formatCurrency(membershipDiscount)}</Typography>
              </Stack>
            )}

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={800} fontFamily="Outfit, sans-serif">Tổng tiền thanh toán</Typography>
              <Typography variant="h5" fontWeight={900} color="primary.main" fontFamily="Outfit, sans-serif">
                {formatCurrency(finalTotal)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
