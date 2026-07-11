import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Card, CardContent, Button, Stack, Box, CircularProgress, Alert, useTheme, alpha } from '@mui/material';
import { Payment, KeyboardArrowLeft, ArrowForward, HelpOutline } from '@mui/icons-material';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useGetBookingByCodeQuery } from '../../booking/api/bookingApi';
import { useCreatePaymentSessionMutation } from '../api/checkoutApi';
import { CheckoutSummary } from '../components/CheckoutSummary';
import { PaymentMethodList } from '../components/PaymentMethodList';
import { PaymentConfirmationDialog } from '../components/PaymentConfirmationDialog';
import { formatCurrency } from '@shared/utils';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const theme = useTheme();

  // Get booking code from query params or location state
  const bookingCode = searchParams.get('code') || location.state?.bookingCode;

  const [selectedMethod, setSelectedMethod] = useState('VNPAY');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch Booking Details from backend
  const { data: booking, isLoading: isBookingLoading, error: bookingError } = useGetBookingByCodeQuery(
    bookingCode || '',
    { skip: !bookingCode }
  );

  // Payment mutation
  const [createPaymentSession, { isLoading: isPaymentLoading }] = useCreatePaymentSessionMutation();

  useEffect(() => {
    if (!bookingCode) {
      navigate('/tickets');
    }
  }, [bookingCode, navigate]);

  if (isBookingLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Đang tải thông tin thanh toán...
        </Typography>
      </Box>
    );
  }

  if (bookingError || !booking) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Không thể tìm thấy thông tin đặt vé hợp lệ. Vui lòng quay lại danh sách vé.
        </Alert>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/tickets')}>
          Quay lại danh sách vé
        </Button>
      </Container>
    );
  }

  const items = booking.tickets.map((t: any) => ({
    ticketName: t.ticketType?.name || 'Vé tham quan',
    quantity: t.quantity,
    price: t.ticketType?.price || 0,
    visitDate: booking.validDate,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const couponDiscount = booking.discountAmount || 0;
  const membershipDiscount = 0; // Backend combines discounts or details it in the order total
  const finalTotal = booking.totalAmount;

  const handleCheckoutSubmit = () => {
    setConfirmOpen(true);
  };

  const handlePaymentConfirm = async () => {
    setConfirmOpen(false);
    try {
      const response = await createPaymentSession({
        orderCode: booking.code,
        paymentMethodCode: selectedMethod,
      }).unwrap();

      if (response?.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    } catch (err) {
      console.error('Failed to create payment', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back button */}
      <Button
        startIcon={<KeyboardArrowLeft />}
        onClick={() => navigate('/tickets')}
        sx={{ mb: 4, fontWeight: 700 }}
      >
        Thay đổi lựa chọn vé
      </Button>

      <Typography
        variant="h4"
        sx={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 900,
          mb: 4,
          background: 'linear-gradient(135deg, #0f172a 30%, #0d9488 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Xác nhận Thanh toán & Vé
      </Typography>

      <Grid container spacing={4}>
        {/* Checkout Forms & Selections */}
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            {/* Customer Details info block */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} fontFamily="Outfit, sans-serif" sx={{ mb: 2 }}>
                  Thông tin khách hàng nhận vé
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Họ tên:</Typography>
                    <Typography variant="body2" fontWeight={600}>{booking.customer?.fullName}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                    <Typography variant="body2" fontWeight={600}>{booking.customer?.email}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Trạng thái đặt vé:</Typography>
                    <Typography variant="body2" fontWeight={700} color="warning.main">{booking.status}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Payment method select */}
            <PaymentMethodList
              selectedCode={selectedMethod}
              onSelect={setSelectedMethod}
            />

            {/* Pay Button */}
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleCheckoutSubmit}
              disabled={isPaymentLoading}
              endIcon={<ArrowForward />}
              sx={{ fontWeight: 800, py: 1.8, borderRadius: 3.5 }}
            >
              {isPaymentLoading ? <CircularProgress size={24} /> : `Thanh toán ngay • ${formatCurrency(finalTotal)}`}
            </Button>
          </Stack>
        </Grid>

        {/* Pricing & Ticket breakdown column */}
        <Grid item xs={12} md={5}>
          <CheckoutSummary
            items={items}
            subtotal={subtotal}
            couponDiscount={couponDiscount}
            membershipDiscount={membershipDiscount}
            finalTotal={finalTotal}
          />
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <PaymentConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handlePaymentConfirm}
        totalAmount={finalTotal}
        paymentMethodName={selectedMethod === 'VNPAY' ? 'Cổng thanh toán VNPay' : 'Ví điện tử MoMo'}
      />
    </Container>
  );
};
