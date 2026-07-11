import React from 'react';
import { Chip, useTheme } from '@mui/material';

export interface OrderStatusChipProps {
  status: string;
  type?: 'order' | 'booking' | 'payment' | 'refund';
}

export const OrderStatusChip: React.FC<OrderStatusChipProps> = ({ status, type = 'order' }) => {
  const theme = useTheme();

  const getStyle = () => {
    const s = status.toUpperCase();

    // Success states
    if (s === 'SUCCESS' || s === 'PAID' || s === 'APPROVED' || s === 'COMPLETED' || s === 'CONFIRMED') {
      return {
        label: s === 'PAID' ? 'Đã thanh toán' : s === 'CONFIRMED' ? 'Đã xác nhận' : s === 'COMPLETED' ? 'Hoàn tất' : s === 'APPROVED' ? 'Được duyệt' : 'Thành công',
        bgcolor: 'rgba(45, 212, 191, 0.12)',
        color: '#2dd4bf',
        border: '1px solid rgba(45, 212, 191, 0.3)',
      };
    }

    // Pending states
    if (s === 'PENDING') {
      return {
        label: 'Chờ xử lý',
        bgcolor: 'rgba(245, 158, 11, 0.12)',
        color: '#f59e0b',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      };
    }

    // Cancelled states
    if (s === 'CANCELLED' || s === 'EXPIRED' || s === 'REJECTED') {
      return {
        label: s === 'CANCELLED' ? 'Đã hủy' : s === 'EXPIRED' ? 'Hết hạn' : 'Từ chối',
        bgcolor: 'rgba(239, 68, 68, 0.12)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.3)',
      };
    }

    // Refunded states
    if (s === 'REFUNDED') {
      return {
        label: 'Đã hoàn tiền',
        bgcolor: 'rgba(59, 130, 246, 0.12)',
        color: '#3b82f6',
        border: '1px solid rgba(59, 130, 246, 0.3)',
      };
    }

    // Fallback
    return {
      label: status,
      bgcolor: 'rgba(255, 255, 255, 0.08)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.15)',
    };
  };

  const style = getStyle();

  return (
    <Chip
      label={style.label}
      size="small"
      sx={{
        bgcolor: style.bgcolor,
        color: style.color,
        border: style.border,
        fontWeight: 700,
        fontFamily: 'Outfit, sans-serif',
        borderRadius: '8px',
        px: 1,
      }}
    />
  );
};
