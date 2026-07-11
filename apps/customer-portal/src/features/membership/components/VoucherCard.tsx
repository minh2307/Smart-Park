import React from 'react';
import { Card, CardContent, Typography, Stack, Chip, Divider, Box } from '@mui/material';
import type { Coupon } from '../types/membership.types';

interface VoucherCardProps {
  coupon: Coupon;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({ coupon }) => {
  return (
    <Card
      sx={{
        bgcolor: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: '#2dd4bf',
        },
      }}
    >
      <Box sx={{ position: 'absolute', top: '50%', left: -8, width: 16, height: 16, borderRadius: '50%', bgcolor: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.08)' }} />
      <Box sx={{ position: 'absolute', top: '50%', right: -8, width: 16, height: 16, borderRadius: '50%', bgcolor: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.08)' }} />

      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Chip label={`Giảm ${coupon.discountPercentage}%`} color="secondary" size="small" sx={{ fontWeight: 'bold', color: '#0f172a' }} />
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#2dd4bf' }}>
            {coupon.code}
          </Typography>
        </Stack>

        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {coupon.name}
        </Typography>
        {coupon.description && (
          <Typography variant="body2" color="rgba(255,255,255,0.5)" sx={{ mb: 2 }}>
            {coupon.description}
          </Typography>
        )}
        {coupon.minSpend && (
          <Typography variant="caption" display="block" color="rgba(255,255,255,0.4)">
            Đơn tối thiểu: {coupon.minSpend.toLocaleString('vi-VN')} VND
          </Typography>
        )}
      </CardContent>

      <Box sx={{ p: 3, pt: 0 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2, borderStyle: 'dashed' }} />
        <Typography variant="caption" color="rgba(255,255,255,0.4)">
          Hạn sử dụng: {coupon.endDate || 'Vô thời hạn'}
        </Typography>
      </Box>
    </Card>
  );
};
