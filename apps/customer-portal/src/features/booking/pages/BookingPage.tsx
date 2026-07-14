import { logger } from '../../../services/logger';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Step,
  Stepper,
  StepLabel,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Stack,
  IconButton,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert,
  MenuItem,
  InputAdornment,
  Snackbar,
  useTheme,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Add,
  Remove,
  AutoAwesome,
  CreditCard,
  QrCode2,
  CheckCircle,
  ShoppingBag,
  ArrowForward,
  ArrowBack,
  ConfirmationNumber,
  CalendarMonth,
  Person,
  Email,
  Phone,
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@shared/utils';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useGetVenuesQuery, useGetVenueTicketTypesQuery } from '../../tickets/api/ticketApi';
import { useCreateBookingMutation, useCreatePaymentMutation } from '../api/bookingApi';
import { addToCart, setVisitDate as setGlobalVisitDate } from '../store/bookingSlice';
import { QuantitySelector } from '../components/QuantitySelector';
import { BookingSummary } from '../components/BookingSummary';
import { useNavigate, useLocation } from 'react-router-dom';

// Zod validation schema
const customerSchema = z.object({
  fullName: z.string().min(3, { message: 'Họ tên phải có ít nhất 3 ký tự' }),
  email: z.string().email({ message: 'Địa chỉ email không hợp lệ' }),
  phone: z.string().regex(/^[0-9]{10}$/, { message: 'Số điện thoại phải có đúng 10 chữ số' }),
  notes: z.string().optional(),
});

type CustomerFormInputs = z.infer<typeof customerSchema>;

export const BookingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  // Auth state
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Form step
  const [activeStep, setActiveStep] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Selection states
  const [selectedVenueId, setSelectedVenueId] = useState<number | ''>('');
  const [visitDate, setVisitDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);
  
  // RTK Queries & Mutations
  const { data: venues, isLoading: isLoadingVenues } = useGetVenuesQuery();
  const { data: ticketTypes, isLoading: isLoadingTickets } = useGetVenueTicketTypesQuery(
    selectedVenueId as number,
    { skip: selectedVenueId === '' }
  );
  
  const [createBooking, { isLoading: isBookingLoading }] = useCreateBookingMutation();
  const [createPayment, { isLoading: isPaymentLoading }] = useCreatePaymentMutation();

  // Handle location state for direct ticket booking (e.g. from Ticket Catalog "Buy Now")
  useEffect(() => {
    if (location.state?.venueId) {
      setSelectedVenueId(Number(location.state.venueId));
      if (location.state.ticketTypeId) {
        setQuantities({ [Number(location.state.ticketTypeId)]: 1 });
      }
    } else if (venues && venues.length > 0 && selectedVenueId === '') {
      setSelectedVenueId(venues[0].id);
    }
  }, [location.state, venues, selectedVenueId]);

  // Hook Form setup
  const { control, handleSubmit, formState: { errors } } = useForm<CustomerFormInputs>({
    resolver: zodResolver(customerSchema),
    values: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: '',
      notes: '',
    },
  });

  const steps = ['Chọn vé & Ngày', 'Thông tin khách hàng', 'Thanh toán & Nhận vé'];

  const hasSelectedTickets = Object.values(quantities).some((q) => q > 0);
  
  const subtotal = ticketTypes
    ? ticketTypes.reduce((sum, ticket) => sum + (quantities[ticket.id] || 0) * ticket.price, 0)
    : 0;

  const handleQtyChange = (ticketId: number, qty: number) => {
    setQuantities((prev) => ({ ...prev, [ticketId]: qty }));
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    if (!ticketTypes) return;
    ticketTypes.forEach((ticket) => {
      const qty = quantities[ticket.id] || 0;
      if (qty > 0) {
        dispatch(addToCart({ ticketType: ticket, quantity: qty, visitDate }));
      }
    });
    setToastMessage('Đã thêm vé vào giỏ hàng thành công!');
  };

  const handleQuickCheckout = () => {
    handleNext();
  };

  // Submit client details & create order/booking on the backend
  const onSubmitInfo = async (data: CustomerFormInputs) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/booking' } });
      return;
    }
    
    const ticketsReq = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        ticketTypeId: Number(id),
        quantity: qty,
      }));

    try {
      const bookingResult = await createBooking({
        customerId: user!.id,
        tickets: ticketsReq,
        validDate: visitDate,
      }).unwrap();
      
      navigate(`/checkout?code=${bookingResult.code}`);
    } catch (err: any) {
      logger.error('Failed to create booking', err);
    }
  };

  // Handle final checkout and redirect to payment gateway
  const handlePayment = async () => {
    if (!createdBooking) return;
    try {
      const response = await createPayment({
        orderCode: createdBooking.code,
        paymentMethodCode: paymentMethod,
      }).unwrap();

      if (response?.paymentUrl) {
        window.open(response.paymentUrl, '_blank');
        setActiveStep(3); // Show success check in
      }
    } catch (err) {
      logger.error('Failed to generate payment url', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            mb: 2,
            background: 'linear-gradient(135deg, #0f172a 30%, #0d9488 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Đặt vé tham quan
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={600} sx={{ mx: 'auto' }}>
          Đặt vé an toàn, nhanh chóng và nhận mã QR soát vé trực tuyến tức thì.
        </Typography>
      </Box>

      {/* Stepper tracker */}
      {activeStep < 3 && (
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {/* Main Content */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={activeStep === 3 ? 12 : 8}>
          <AnimatePresence mode="wait">
            {activeStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <Typography variant="h6" fontWeight={700} fontFamily="Outfit, sans-serif" sx={{ mb: 3 }}>
                    1. Chọn Địa Điểm & Ngày Tham Quan
                  </Typography>

                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label="Chọn Khu Vực / Công Viên"
                        value={selectedVenueId}
                        onChange={(e) => {
                          setSelectedVenueId(Number(e.target.value));
                          setQuantities({});
                        }}
                        fullWidth
                        disabled={isLoadingVenues}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      >
                        {venues?.map((v) => (
                          <MenuItem key={v.id} value={v.id}>
                            {v.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        type="date"
                        label="Ngày Sử Dụng"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: new Date().toISOString().split('T')[0] }}
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="h6" fontWeight={700} fontFamily="Outfit, sans-serif" sx={{ mb: 2 }}>
                    2. Số Lượng Vé
                  </Typography>

                  {isLoadingTickets ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : ticketTypes && ticketTypes.length > 0 ? (
                    <Stack spacing={2.5}>
                      {ticketTypes.map((ticket) => (
                        <Box
                          key={ticket.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 3,
                            borderRadius: 3.5,
                            border: '1px solid',
                            borderColor: (quantities[ticket.id] || 0) > 0 ? 'primary.main' : 'divider',
                            backgroundColor: (quantities[ticket.id] || 0) > 0 ? alpha(theme.palette.primary.main, 0.02) : 'background.paper',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Box sx={{ pr: 2 }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                              {ticket.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {ticket.description}
                            </Typography>
                            <Typography variant="subtitle1" color="primary.main" fontWeight={800}>
                              {formatCurrency(ticket.price)}
                            </Typography>
                          </Box>
                          <QuantitySelector
                            value={quantities[ticket.id] || 0}
                            onChange={(qty) => handleQtyChange(ticket.id, qty)}
                          />
                        </Box>
                      ))}
                    </Stack>
                  ) : selectedVenueId !== '' ? (
                    <Alert severity="warning" sx={{ borderRadius: 3 }}>
                      Không có loại vé nào khả dụng tại khu vực này.
                    </Alert>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 3 }}>
                      Vui lòng chọn khu vực công viên trước.
                    </Alert>
                  )}
                </Card>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <Typography variant="h6" fontWeight={700} fontFamily="Outfit, sans-serif" sx={{ mb: 3 }}>
                    Thông tin khách hàng
                  </Typography>

                  <form onSubmit={handleSubmit(onSubmitInfo)}>
                    <Stack spacing={3}>
                      <Controller
                        name="fullName"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Họ và Tên"
                            fullWidth
                            error={!!errors.fullName}
                            helperText={errors.fullName?.message}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                          />
                        )}
                      />

                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Email liên hệ"
                            type="email"
                            fullWidth
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                          />
                        )}
                      />

                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Số điện thoại"
                            fullWidth
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                            placeholder="0XXXXXXXXX"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Phone sx={{ color: 'text.disabled' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                          />
                        )}
                      />

                      <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Ghi chú thêm"
                            multiline
                            rows={3}
                            fullWidth
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                          />
                        )}
                      />

                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button variant="outlined" size="large" onClick={handleBack} sx={{ flex: 1, borderRadius: 3, fontWeight: 700 }}>
                          Quay lại
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          disabled={isBookingLoading}
                          sx={{ flex: 2, borderRadius: 3, fontWeight: 700 }}
                        >
                          {isBookingLoading ? <CircularProgress size={24} /> : 'Tiếp tục'}
                        </Button>
                      </Stack>
                    </Stack>
                  </form>
                </Card>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <Typography variant="h6" fontWeight={700} fontFamily="Outfit, sans-serif" sx={{ mb: 3 }}>
                    Lựa chọn phương thức thanh toán
                  </Typography>

                  <Stack spacing={3}>
                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <Stack spacing={2}>
                        <Box sx={{ border: '1px solid', borderColor: paymentMethod === 'VNPAY' ? 'primary.main' : 'divider', borderRadius: 3.5, p: 2.5, display: 'flex', alignItems: 'center' }}>
                          <FormControlLabel
                            value="VNPAY"
                            control={<Radio />}
                            label={
                              <Stack direction="row" spacing={2} alignItems="center">
                                <CreditCard color="primary" />
                                <Typography fontWeight={700}>Cổng thanh toán VNPay</Typography>
                              </Stack>
                            }
                          />
                        </Box>
                        <Box sx={{ border: '1px solid', borderColor: paymentMethod === 'MOMO' ? 'primary.main' : 'divider', borderRadius: 3.5, p: 2.5, display: 'flex', alignItems: 'center' }}>
                          <FormControlLabel
                            value="MOMO"
                            control={<Radio />}
                            label={
                              <Stack direction="row" spacing={2} alignItems="center">
                                <QrCode2 color="secondary" />
                                <Typography fontWeight={700}>Ví điện tử MoMo</Typography>
                              </Stack>
                            }
                          />
                        </Box>
                      </Stack>
                    </RadioGroup>

                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button variant="outlined" size="large" onClick={handleBack} sx={{ flex: 1, borderRadius: 3, fontWeight: 700 }}>
                        Quay lại
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handlePayment}
                        disabled={isPaymentLoading}
                        sx={{ flex: 2, borderRadius: 3, fontWeight: 700 }}
                      >
                        {isPaymentLoading ? <CircularProgress size={24} /> : 'Thực hiện thanh toán'}
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>
            )}

            {activeStep === 3 && (
              <motion.div
                key="step4"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card sx={{ p: 5, borderRadius: 5, border: '2px solid #10b981', textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: '5rem', color: '#10b981', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, mb: 1 }}>
                    Đặt vé thành công!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                    Yêu cầu đặt vé của bạn đã được ghi nhận. Hệ thống đang đồng bộ. Quét mã QR code dưới đây tại quầy soát vé để check-in.
                  </Typography>

                  <Box
                    sx={{
                      display: 'inline-block',
                      p: 3.5,
                      borderRadius: 4,
                      backgroundColor: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      mb: 4,
                    }}
                  >
                    <QRCodeSVG value={createdBooking?.code || ''} size={200} />
                    <Typography variant="subtitle1" fontWeight={800} color="primary.main" sx={{ mt: 2, letterSpacing: 2 }}>
                      CODE: {createdBooking?.code}
                    </Typography>
                  </Box>

                  <Stack spacing={2} sx={{ maxWidth: 300, mx: 'auto' }}>
                    <Button variant="contained" color="primary" fullWidth size="large" onClick={() => navigate('/wallet')} sx={{ fontWeight: 700, borderRadius: 3 }}>
                      Xem ví vé cá nhân
                    </Button>
                    <Button variant="text" color="inherit" fullWidth onClick={() => { setActiveStep(0); setCreatedBooking(null); setQuantities({}); }} sx={{ fontWeight: 700 }}>
                      Đặt thêm vé khác
                    </Button>
                  </Stack>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>

        {activeStep < 3 && (
          <Grid item xs={12} md={4}>
            <BookingSummary
              selectedQuantities={quantities}
              ticketTypes={ticketTypes || []}
              visitDate={visitDate}
              onAddToCart={handleAddToCart}
              onQuickCheckout={handleQuickCheckout}
            />
          </Grid>
        )}
      </Grid>

      {/* Cart add confirmation Toast */}
      <Snackbar
        open={!!toastMessage}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
        action={
          <Button color="secondary" size="small" onClick={() => navigate('/cart')}>
            Xem giỏ hàng
          </Button>
        }
      />
    </Container>
  );
};
