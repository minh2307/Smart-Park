import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Button, Divider, Alert, useTheme, alpha } from '@mui/material';
import { CheckCircle, Cancel, Help, HourglassEmpty, QrCode2, Refresh, ChevronRight } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@shared/utils';
import { useNavigate } from 'react-router-dom';

interface PaymentResultCardProps {
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'PENDING';
  bookingCode: string;
  transactionId: string;
  amount: number;
  errorMessage?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const PaymentResultCard: React.FC<PaymentResultCardProps> = ({
  status,
  bookingCode,
  transactionId,
  amount,
  errorMessage,
  onRetry,
  isRetrying = false,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const getStatusConfig = () => {
    switch (status) {
      case 'SUCCESS':
        return {
          icon: <CheckCircle sx={{ fontSize: 72, color: 'success.main' }} />,
          title: 'Thanh toán thành công!',
          subtitle: 'Vé của bạn đã sẵn sàng sử dụng. Hãy quét mã QR tại quầy soát vé.',
          color: theme.palette.success.main,
          bannerBg: alpha(theme.palette.success.main, 0.05),
        };
      case 'FAILED':
        return {
          icon: <Cancel sx={{ fontSize: 72, color: 'error.main' }} />,
          title: 'Giao dịch thất bại',
          subtitle: errorMessage || 'Có lỗi xảy ra trong quá trình xử lý giao dịch của bạn.',
          color: theme.palette.error.main,
          bannerBg: alpha(theme.palette.error.main, 0.05),
        };
      case 'CANCELLED':
        return {
          icon: <Cancel sx={{ fontSize: 72, color: 'warning.main' }} />,
          title: 'Đã hủy thanh toán',
          subtitle: 'Bạn đã chủ động hủy bỏ quá trình thanh toán.',
          color: theme.palette.warning.main,
          bannerBg: alpha(theme.palette.warning.main, 0.05),
        };
      case 'PENDING':
      default:
        return {
          icon: <HourglassEmpty sx={{ fontSize: 72, color: 'info.main' }} />,
          title: 'Đang xử lý giao dịch',
          subtitle: 'Giao dịch của bạn đang được hệ thống đối soát kết quả.',
          color: theme.palette.info.main,
          bannerBg: alpha(theme.palette.info.main, 0.05),
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card sx={{ border: `1px solid ${config.color}`, borderRadius: 5, overflow: 'hidden', maxWidth: 500, mx: 'auto', textAlign: 'center' }}>
      <Box sx={{ p: 4, backgroundColor: config.bannerBg }}>
        {config.icon}
        <Typography variant="h5" fontWeight={900} fontFamily="Outfit, sans-serif" sx={{ mt: 2, mb: 1, color: config.color }}>
          {config.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {config.subtitle}
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        {status === 'SUCCESS' && bookingCode && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'inline-block',
                p: 2.5,
                borderRadius: 4,
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                mb: 2,
              }}
            >
              <QRCodeSVG value={bookingCode} size={150} />
            </Box>
            <Typography variant="subtitle1" fontWeight={800} color="primary.main" letterSpacing={1.5}>
              MÃ ĐẶT VÉ: {bookingCode}
            </Typography>
          </Box>
        )}

        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Mã giao dịch:</Typography>
            <Typography variant="body2" fontWeight={700}>{transactionId || 'Không xác định'}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Số tiền:</Typography>
            <Typography variant="body2" fontWeight={800}>{formatCurrency(amount)}</Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={1.5}>
          {status === 'SUCCESS' ? (
            <>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={() => navigate('/wallet')}
                sx={{ fontWeight: 700, borderRadius: 3 }}
              >
                Vào ví vé của tôi
              </Button>
              <Button
                variant="text"
                color="inherit"
                fullWidth
                onClick={() => navigate('/tickets')}
                sx={{ fontWeight: 700 }}
              >
                Tiếp tục mua vé
              </Button>
            </>
          ) : (
            <>
              {onRetry && (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={onRetry}
                  disabled={isRetrying}
                  startIcon={<Refresh />}
                  sx={{ fontWeight: 700, borderRadius: 3 }}
                >
                  Thanh toán lại
                </Button>
              )}
              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={() => navigate('/tickets')}
                sx={{ fontWeight: 700, borderRadius: 3 }}
              >
                Quay lại trang chủ
              </Button>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
