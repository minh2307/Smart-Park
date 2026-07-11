import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { formatDate } from '@shared/utils';
import type { Booking } from '../../booking/types/booking.types';

interface BookingTimelineProps {
  booking: Booking;
}

export const BookingTimeline: React.FC<BookingTimelineProps> = ({ booking }) => {
  const steps = [
    {
      title: 'Khởi tạo giữ vé',
      description: 'Lượt giữ vé được khóa trong 15 phút để chờ giao dịch thanh toán hoàn tất.',
      date: formatDate(booking.createdAt),
      active: true,
      completed: true,
      icon: <BookOnlineIcon sx={{ color: '#2dd4bf' }} />,
    },
    {
      title: 'Xác nhận thanh toán',
      description: booking.status === 'PAID' || booking.status === 'COMPLETED' || booking.status === 'CHECKED_IN'
        ? 'Nhận thông tin thanh toán hợp lệ từ cổng thanh toán.'
        : booking.status === 'CANCELLED'
        ? 'Yêu cầu thanh toán thất bại hoặc bị hủy.'
        : booking.status === 'EXPIRED'
        ? 'Thời gian giữ chỗ quá hạn 15 phút. Vé đã được trả lại giỏ hàng chung.'
        : 'Đang đợi khách hàng quét mã thanh toán.',
      date: booking.status !== 'PENDING' ? formatDate(booking.createdAt) : '',
      active: booking.status !== 'PENDING',
      completed: booking.status === 'PAID' || booking.status === 'COMPLETED' || booking.status === 'CHECKED_IN',
      failed: booking.status === 'CANCELLED' || booking.status === 'EXPIRED',
      icon: booking.status === 'PAID' || booking.status === 'COMPLETED' || booking.status === 'CHECKED_IN' ? (
        <PaymentIcon sx={{ color: '#2dd4bf' }} />
      ) : booking.status === 'CANCELLED' || booking.status === 'EXPIRED' ? (
        <CancelOutlinedIcon sx={{ color: '#ef4444' }} />
      ) : (
        <PaymentIcon sx={{ color: 'rgba(255,255,255,0.2)' }} />
      ),
    },
    {
      title: 'Phát hành QR Code',
      description: booking.status === 'PAID' || booking.status === 'COMPLETED' || booking.status === 'CHECKED_IN'
        ? 'Mã QR check-in được mã hóa AES-256 an toàn và gửi tới mục Vé của tôi.'
        : 'Đang chờ giao dịch thành công.',
      date: '',
      active: booking.status === 'PAID' || booking.status === 'COMPLETED' || booking.status === 'CHECKED_IN',
      completed: booking.status === 'COMPLETED' || booking.status === 'CHECKED_IN',
      icon: booking.status === 'PAID' || booking.status === 'COMPLETED' || booking.status === 'CHECKED_IN' ? (
        <CheckCircleOutlineIcon sx={{ color: '#2dd4bf' }} />
      ) : (
        <CheckCircleOutlineIcon sx={{ color: 'rgba(255,255,255,0.1)' }} />
      ),
    },
    {
      title: 'Check-in tại cổng',
      description: booking.status === 'CHECKED_IN' || booking.status === 'COMPLETED'
        ? 'Khách hàng quét mã QR qua turnstile thành công vào công viên.'
        : 'Chờ khách hàng tới cổng soát vé.',
      date: '',
      active: booking.status === 'CHECKED_IN' || booking.status === 'COMPLETED',
      completed: booking.status === 'COMPLETED',
      icon: booking.status === 'CHECKED_IN' || booking.status === 'COMPLETED' ? (
        <QrCodeScannerIcon sx={{ color: '#2dd4bf' }} />
      ) : (
        <QrCodeScannerIcon sx={{ color: 'rgba(255,255,255,0.1)' }} />
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
        Tiến trình đặt vé
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
