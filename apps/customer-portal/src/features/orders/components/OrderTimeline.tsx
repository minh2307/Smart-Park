import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { formatDate } from '@shared/utils';
import type { Order } from '../types/order.types';

interface OrderTimelineProps {
  order: Order;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const steps = [
    {
      title: 'Đơn hàng khởi tạo',
      description: 'Đơn hàng được tạo thành công trên hệ thống Smart Park.',
      date: formatDate(order.createdAt),
      active: true,
      completed: true,
      icon: <CheckCircleIcon sx={{ color: '#2dd4bf' }} />,
    },
    {
      title: 'Xác nhận thông tin',
      description: 'Thông tin đặt vé đã được đối soát và xác nhận.',
      date: order.status !== 'PENDING' ? formatDate(order.updatedAt) : '',
      active: order.status !== 'PENDING',
      completed: order.status !== 'PENDING',
      icon: order.status !== 'PENDING' ? (
        <CheckCircleIcon sx={{ color: '#2dd4bf' }} />
      ) : (
        <PendingIcon sx={{ color: '#f59e0b' }} />
      ),
    },
    {
      title: 'Thanh toán đơn hàng',
      description: order.status === 'PAID'
        ? 'Giao dịch thanh toán thành công qua cổng thanh toán.'
        : order.status === 'CANCELLED'
        ? 'Giao dịch đã hủy bỏ hoặc hết hạn.'
        : order.status === 'REFUNDED'
        ? 'Giao dịch đã được hoàn trả.'
        : 'Chờ thanh toán qua cổng VNPay/MoMo.',
      date: order.status === 'PAID' || order.status === 'REFUNDED' || order.status === 'CANCELLED' ? formatDate(order.updatedAt) : '',
      active: order.status === 'PAID' || order.status === 'REFUNDED' || order.status === 'CANCELLED',
      completed: order.status === 'PAID' || order.status === 'REFUNDED',
      failed: order.status === 'CANCELLED',
      icon: order.status === 'PAID' || order.status === 'REFUNDED' ? (
        <CheckCircleIcon sx={{ color: '#2dd4bf' }} />
      ) : order.status === 'CANCELLED' ? (
        <CancelIcon sx={{ color: '#ef4444' }} />
      ) : (
        <HourglassEmptyIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
      ),
    },
    {
      title: 'Nhận vé & Trải nghiệm',
      description: order.status === 'PAID' ? 'Vé đã kích hoạt và sẵn sàng check-in tại cổng chính.' : 'Chờ hoàn tất thanh toán.',
      date: '',
      active: order.status === 'PAID',
      completed: false,
      icon: order.status === 'PAID' ? (
        <CheckCircleIcon sx={{ color: 'rgba(45, 212, 191, 0.4)' }} />
      ) : (
        <HourglassEmptyIcon sx={{ color: 'rgba(255,255,255,0.1)' }} />
      ),
    },
  ];

  return (
    <Box sx={{ py: 2 }}>
      <Typography
        variant="h6"
        sx={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 800,
          mb: 3,
          color: '#ffffff',
        }}
      >
        Tiến trình đơn hàng
      </Typography>
      <Stack spacing={0}>
        {steps.map((step, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 3, position: 'relative' }}>
            {/* Visual Line */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 32,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: step.active
                    ? step.failed
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(45, 212, 191, 0.15)'
                    : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                {step.icon}
              </Box>
              {idx < steps.length - 1 && (
                <Box
                  sx={{
                    width: 2,
                    flexGrow: 1,
                    minHeight: 40,
                    bgcolor: step.completed
                      ? '#2dd4bf'
                      : 'rgba(255, 255, 255, 0.1)',
                    my: 1,
                    zIndex: 1,
                  }}
                />
              )}
            </Box>

            {/* Content */}
            <Box sx={{ pb: idx < steps.length - 1 ? 4 : 2, pt: 0.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontFamily: 'Outfit, sans-serif',
                  color: step.active
                    ? step.failed
                      ? '#ef4444'
                      : '#ffffff'
                    : 'rgba(255,255,255,0.4)',
                }}
              >
                {step.title}
              </Typography>
              {step.date && (
                <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" sx={{ display: 'block', mt: 0.2 }}>
                  {step.date}
                </Typography>
              )}
              <Typography
                variant="body2"
                color="rgba(255, 255, 255, 0.6)"
                sx={{ mt: 0.8, maxWidth: 350, fontSize: '0.85rem' }}
              >
                {step.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
