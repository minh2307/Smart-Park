import React from 'react';
import { Box, Typography, Divider, Stack } from '@mui/material';
import { formatCurrency } from '@shared/utils';
import type { Order } from '../types/order.types';

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  return (
    <Box
      sx={{
        bgcolor: 'rgba(30, 41, 59, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        p: 3,
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff', mb: 2 }}>
        Tổng kết thanh toán
      </Typography>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
            Tạm tính
          </Typography>
          <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
            {formatCurrency(order.subtotal)}
          </Typography>
        </Stack>

        {order.discountAmount > 0 && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
              Giảm giá khuyến mãi
            </Typography>
            <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 700 }}>
              -{formatCurrency(order.discountAmount)}
            </Typography>
          </Stack>
        )}

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
            Thuế VAT (10%)
          </Typography>
          <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
            {formatCurrency(order.taxAmount)}
          </Typography>
        </Stack>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', my: 1 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff' }}>
            Tổng số tiền
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              color: '#2dd4bf',
            }}
          >
            {formatCurrency(order.totalAmount)}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};
