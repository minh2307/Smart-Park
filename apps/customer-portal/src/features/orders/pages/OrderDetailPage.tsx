import { logger } from '../../../services/logger';
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  useTheme,
} from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetOrderDetailsQuery,
  useCancelOrderMutation,
  useRetryPaymentMutation,
  useGetPaymentMethodsQuery,
} from '../services/orderApi';
import { OrderStatusChip } from '../components/OrderStatusChip';
import { OrderTimeline } from '../components/OrderTimeline';
import { OrderSummary } from '../components/OrderSummary';
import { InvoiceCard } from '../components/InvoiceCard';
import { RefundCard } from '../components/RefundCard';
import { formatCurrency, formatDate } from '@shared/utils';

export const OrderDetailPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = Number(id);

  const { data: order, isLoading, error, refetch } = useGetOrderDetailsQuery(orderId, {
    skip: !orderId,
  });

  const { data: paymentMethods } = useGetPaymentMethodsQuery();
  const [retryPayment, { isLoading: isRetrying }] = useRetryPaymentMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const [selectedMethod, setSelectedMethod] = useState('VNPAY');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleRetryPayment = async () => {
    if (!order) return;
    try {
      const response = await retryPayment({
        orderCode: order.orderCode,
        paymentMethodCode: selectedMethod,
      }).unwrap();
      if (response?.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    } catch (err) {
      logger.error('Failed to retry payment:', err);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      await cancelOrder(order.orderCode).unwrap();
      refetch();
    } catch (err) {
      logger.error('Failed to cancel order:', err);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: 2, bgcolor: 'background.default' }}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">
          Đang tải chi tiết đơn hàng...
        </Typography>
      </Box>
    );
  }

  const isDark = theme.palette.mode === 'dark';

  if (error || !order) {
    return (
      <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', py: 6 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 3 }}>
            Không tìm thấy thông tin đơn hàng này. Vui lòng quay lại danh sách giao dịch.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/orders')}
            startIcon={<KeyboardArrowLeftIcon />}
            sx={{
              mt: 3,
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              color: 'text.primary',
              borderRadius: 2,
              '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
            }}
          >
            Quay lại danh sách
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        color: 'text.primary',
        py: 6,
        background: isDark
          ? 'radial-gradient(circle at top right, rgba(20, 184, 166, 0.08), transparent 45%)'
          : 'radial-gradient(circle at top right, rgba(13, 148, 136, 0.04), transparent 45%)',
      }}
    >
      <Container maxWidth="lg">
        {/* Navigation Action */}
        <Button
          startIcon={<KeyboardArrowLeftIcon />}
          onClick={() => navigate('/orders')}
          sx={{
            mb: 4,
            fontWeight: 700,
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary',
            textTransform: 'none',
            '&:hover': { color: isDark ? '#ffffff' : 'text.primary' },
          }}
        >
          Quay lại danh sách giao dịch
        </Button>

        {/* Header Summary */}
        <Box sx={{ mb: 5 }}>
          <Grid container spacing={3} justifyContent="space-between" alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 900,
                    color: 'text.primary',
                  }}
                >
                  Chi tiết đơn hàng: {order.orderCode}
                </Typography>
                <OrderStatusChip status={order.status} />
              </Stack>
              <Typography color={isDark ? 'rgba(255, 255, 255, 0.5)' : 'text.secondary'} variant="body2" sx={{ mt: 1 }}>
                Khởi tạo ngày: {formatDate(order.createdAt)}
              </Typography>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} md={5} sx={{ textAlign: { md: 'right' } }}>
              {order.status === 'PENDING' && (
                <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelOrder}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                      '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239, 68, 68, 0.05)' },
                    }}
                  >
                    Hủy đơn hàng
                  </Button>
                </Stack>
              )}
              {order.status === 'PAID' && (
                <Button
                  variant="contained"
                  startIcon={<QrCodeIcon />}
                  onClick={() => navigate('/tickets')}
                  sx={{
                    bgcolor: isDark ? '#2dd4bf' : 'primary.main',
                    color: isDark ? '#0f172a' : '#ffffff',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    px: 3,
                    '&:hover': { bgcolor: isDark ? '#0ea5e9' : 'primary.dark', color: '#ffffff' },
                  }}
                >
                  Ví vé của tôi (QR)
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Dashboard Grid */}
        <Grid container spacing={4}>
          {/* Main content - Left Column */}
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              {/* Product items table */}
              <Card sx={{ bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'background.paper', backdropFilter: 'blur(20px)', border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', mb: 2 }}>
                    Chi tiết sản phẩm dịch vụ
                  </Typography>
                  <Stack spacing={2}>
                    {order.items?.map((item) => (
                      <Box key={item.id}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              Vé Vui Chơi Smart Park (Mã loại: {item.referenceId})
                            </Typography>
                            <Typography variant="caption" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'}>
                              Loại hình dịch vụ: {item.itemType}
                            </Typography>
                          </Grid>
                          <Grid item xs={4} sm={2} sx={{ textAlign: { sm: 'center' } }}>
                            <Typography variant="caption" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'} sx={{ display: 'block' }}>Đơn giá</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatCurrency(item.unitPrice)}</Typography>
                          </Grid>
                          <Grid item xs={4} sm={2} sx={{ textAlign: { sm: 'center' } }}>
                            <Typography variant="caption" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'} sx={{ display: 'block' }}>Số lượng</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.quantity}</Typography>
                          </Grid>
                          <Grid item xs={4} sm={2} sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'} sx={{ display: 'block' }}>Thành tiền</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 750, color: 'text.primary' }}>{formatCurrency(item.totalPrice)}</Typography>
                          </Grid>
                        </Grid>
                        <Divider sx={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', mt: 2 }} />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Order status tracking timeline */}
              <Card sx={{ bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'background.paper', backdropFilter: 'blur(20px)', border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <OrderTimeline order={order} />
                </CardContent>
              </Card>

              {/* Retry payment selectors (if PENDING) */}
              {order.status === 'PENDING' && (
                <Card sx={{ bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'background.paper', backdropFilter: 'blur(20px)', border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 4 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif', mb: 2 }}>
                      Hoàn tất thanh toán
                    </Typography>
                    <FormControl component="fieldset">
                      <FormLabel component="legend" sx={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary', mb: 1, fontSize: '0.85rem' }}>
                        Chọn cổng thanh toán điện tử
                      </FormLabel>
                      <RadioGroup
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        row
                      >
                        <FormControlLabel
                          value="VNPAY"
                          control={<Radio sx={{ color: isDark ? '#2dd4bf' : 'primary.main', '&.Mui-checked': { color: isDark ? '#2dd4bf' : 'primary.main' } }} />}
                          label="Cổng thanh toán VNPay"
                        />
                        <FormControlLabel
                          value="MOMO"
                          control={<Radio sx={{ color: isDark ? '#2dd4bf' : 'primary.main', '&.Mui-checked': { color: isDark ? '#2dd4bf' : 'primary.main' } }} />}
                          label="Ví điện tử MoMo"
                        />
                      </RadioGroup>
                    </FormControl>
                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        startIcon={<PaymentIcon />}
                        onClick={handleRetryPayment}
                        disabled={isRetrying}
                        sx={{
                          bgcolor: isDark ? '#2dd4bf' : 'primary.main',
                          color: isDark ? '#0f172a' : '#ffffff',
                          fontWeight: 800,
                          px: 4,
                          py: 1.5,
                          borderRadius: 2.5,
                          textTransform: 'none',
                          '&:hover': { bgcolor: isDark ? '#0ea5e9' : 'primary.dark', color: '#ffffff' },
                          '&:active': { transform: 'scale(0.98)' },
                        }}
                      >
                        {isRetrying ? 'Đang kết nối...' : 'Thanh toán ngay'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* Pricing Summary & Customer Details - Right Column */}
          <Grid item xs={12} md={4}>
            <Stack spacing={4}>
              {/* Customer Profile card */}
              <Card sx={{ bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'background.paper', backdropFilter: 'blur(20px)', border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)', borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                    <Box sx={{ p: 1, bgcolor: 'rgba(14, 165, 233, 0.1)', borderRadius: 2 }}>
                      <PersonIcon sx={{ color: '#0ea5e9' }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                      Khách hàng nhận vé
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'} sx={{ display: 'block' }}>Họ tên</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer?.fullName}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'} sx={{ display: 'block' }}>Email liên hệ</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer?.email}</Typography>
                    </Box>
                    {order.customer?.phone && (
                      <Box>
                        <Typography variant="caption" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'} sx={{ display: 'block' }}>Số điện thoại</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customer?.phone}</Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Order total amount Summary */}
              <OrderSummary order={order} />

              {/* Invoice generation card */}
              <InvoiceCard order={order} />

              {/* Refund details card (if PAID or REFUNDED) */}
              {(order.status === 'PAID' || order.status === 'REFUNDED') && (
                <RefundCard refunds={order.refunds} payments={order.payments} onRefundSuccess={refetch} />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
