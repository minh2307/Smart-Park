import React, { useState } from 'react';
import { Box, Container, Typography, Step, Stepper, StepLabel, Button, Card, CardContent, Grid, TextField, Stack, IconButton, Divider, RadioGroup, FormControlLabel, Radio, CircularProgress, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@shared/utils';

// Zod schema for validation
const customerSchema = z.object({
  fullName: z.string().min(3, { message: 'Họ tên phải có ít nhất 3 ký tự' }),
  email: z.string().email({ message: 'Địa chỉ email không hợp lệ' }),
  phone: z.string().regex(/^[0-9]{10}$/, { message: 'Số điện thoại phải có đúng 10 chữ số' }),
  notes: z.string().optional(),
});

type CustomerFormInputs = z.infer<typeof customerSchema>;

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
}

const TICKET_TYPES: TicketType[] = [
  { id: 'single', name: 'Vé Cổng Standard', price: 450000, description: 'Cổng tham quan & trò chơi tiêu chuẩn' },
  { id: 'combo', name: 'Combo All-In-One', price: 650000, description: 'Vé cổng + Voucher ẩm thực 150k + Đồ uống' },
  { id: 'vip', name: 'Vé VIP Express Pass', price: 1200000, description: 'Lối đi VIP Express + VIP Lounge + Ghế VIP show' },
  { id: 'family', name: 'Combo Gia Đình', price: 1800000, description: 'Trọn gói dành cho 2 người lớn & 2 trẻ em' },
];

export const BookingPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({
    single: 0,
    combo: 0,
    vip: 0,
    family: 0,
  });
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketCode, setTicketCode] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<CustomerFormInputs>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      notes: '',
    },
  });

  const steps = ['Chọn Loại Vé', 'Thông Tin Khách Hàng', 'Thanh Toán & Nhận Vé'];

  // AI dynamic pricing simulation metrics
  const hasSelectedTickets = Object.values(quantities).some(q => q > 0);
  const totalOriginalPrice = TICKET_TYPES.reduce((sum, ticket) => sum + (quantities[ticket.id] * ticket.price), 0);
  
  // Simulated AI Price Discount (e.g. 5% off for rainy forecast or online booking loyalty incentive)
  const discountRate = 0.05;
  const discountAmount = totalOriginalPrice * discountRate;
  const totalFinalPrice = totalOriginalPrice - discountAmount;

  const handleIncrement = (id: string) => {
    setQuantities(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const handleDecrement = (id: string) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, prev[id] - 1) }));
  };

  const handleNext = () => {
    if (activeStep === 0 && !hasSelectedTickets) return;
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const onSubmitInfo = (_data: CustomerFormInputs) => {
    handleNext();
  };

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate API gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      setTicketCode(`TKT-${Math.random().toString(36).substring(3, 9).toUpperCase()}`);
      setActiveStep(3); // success view
    }, 2000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header Banner */}
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
          Đặt Vé Trực Tuyến
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Hệ thống đặt chỗ và thanh toán tự động, nhận vé tức thì qua mã QR.
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

      {/* Main Flow Content */}
      <Grid container spacing={4}>
        {/* Left column: main action form */}
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
                  <Typography variant="h5" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 3 }}>
                    1. Lên Lịch Trình & Chọn Số Lượng Vé
                  </Typography>

                  <TextField
                    type="date"
                    label="Ngày tham quan"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{ mb: 4 }}
                  />

                  <Stack spacing={3}>
                    {TICKET_TYPES.map((ticket) => (
                      <Box
                        key={ticket.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 3,
                          borderRadius: 3,
                          border: quantities[ticket.id] > 0 
                            ? '1px solid #0d9488' 
                            : '1px solid rgba(226, 232, 240, 0.8)',
                          backgroundColor: quantities[ticket.id] > 0 
                            ? 'rgba(13, 148, 136, 0.02)' 
                            : 'background.paper',
                        }}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {ticket.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {ticket.description}
                          </Typography>
                          <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
                            {formatCurrency(ticket.price)}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={2} alignItems="center">
                          <IconButton
                            onClick={() => handleDecrement(ticket.id)}
                            disabled={quantities[ticket.id] === 0}
                            sx={{ border: '1px solid rgba(226, 232, 240, 0.8)' }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography variant="h6" sx={{ minWidth: 20, textAlign: 'center' }}>
                            {quantities[ticket.id]}
                          </Typography>
                          <IconButton
                            onClick={() => handleIncrement(ticket.id)}
                            sx={{ border: '1px solid rgba(226, 232, 240, 0.8)' }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
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
                  <Typography variant="h5" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 3 }}>
                    2. Nhập Thông Tin Khách Hàng Soát Vé
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
                          />
                        )}
                      />

                      <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Địa chỉ Email"
                            type="email"
                            fullWidth
                            error={!!errors.email}
                            helperText={errors.email?.message}
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
                          />
                        )}
                      />

                      <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Ghi chú đặc biệt (Ví dụ: xe lăn, dị ứng thực phẩm)"
                            multiline
                            rows={3}
                            fullWidth
                          />
                        )}
                      />

                      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                        <Button variant="outlined" size="large" onClick={handleBack} sx={{ flex: 1 }}>
                          Quay Lại
                        </Button>
                        <Button type="submit" variant="contained" color="primary" size="large" sx={{ flex: 2, fontWeight: 'bold' }}>
                          Tiếp Tục
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
                  <Typography variant="h5" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 3 }}>
                    3. Lựa Chọn Phương Thức Thanh Toán
                  </Typography>

                  {isProcessing ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <CircularProgress size={50} sx={{ mb: 3 }} />
                      <Typography variant="h6">Đang kết nối cổng thanh toán an toàn...</Typography>
                      <Typography variant="body2" color="text.secondary">Vui lòng không tắt trình duyệt hoặc tải lại trang.</Typography>
                    </Box>
                  ) : (
                    <Stack spacing={4}>
                      <RadioGroup
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <Stack spacing={2}>
                          <Box sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: 3, p: 2 }}>
                            <FormControlLabel
                              value="vnpay"
                              control={<Radio />}
                              label={
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <CreditCardIcon color="primary" />
                                  <Typography fontWeight="bold">Cổng Thanh Toán VNPay</Typography>
                                </Stack>
                              }
                            />
                          </Box>
                          <Box sx={{ border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: 3, p: 2 }}>
                            <FormControlLabel
                              value="momo"
                              control={<Radio />}
                              label={
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <QrCode2Icon color="secondary" />
                                  <Typography fontWeight="bold">Ví Điện Tử MoMo</Typography>
                                </Stack>
                              }
                            />
                          </Box>
                        </Stack>
                      </RadioGroup>

                      <Stack direction="row" spacing={2}>
                        <Button variant="outlined" size="large" onClick={handleBack} sx={{ flex: 1 }}>
                          Quay Lại
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={handlePay}
                          sx={{ flex: 2, fontWeight: 'bold' }}
                        >
                          Xác Nhận & Thanh Toán
                        </Button>
                      </Stack>
                    </Stack>
                  )}
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
                  <CheckCircleIcon sx={{ fontSize: '4.5rem', color: '#10b981', mb: 2 }} />
                  <Typography variant="h4" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, mb: 1 }}>
                    Đặt Vé Thành Công!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Mã vé QR đã được tạo thành công và gửi vào email của bạn. Vui lòng quét mã tại cổng kiểm soát để vào cổng trực tiếp.
                  </Typography>

                  <Box
                    sx={{
                      display: 'inline-block',
                      p: 3,
                      borderRadius: 4,
                      backgroundColor: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      mb: 4,
                    }}
                  >
                    <QRCodeSVG value={ticketCode} size={180} />
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ mt: 2, letterSpacing: 1.5 }}>
                      MÃ VÉ: {ticketCode}
                    </Typography>
                  </Box>

                  <Grid container spacing={2} justifyContent="center" sx={{ maxWidth: 400, mx: 'auto' }}>
                    <Grid item xs={12}>
                      <Button variant="contained" color="primary" fullWidth size="large" onClick={() => setActiveStep(0)}>
                        Đặt Thêm Vé Khác
                      </Button>
                    </Grid>
                  </Grid>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>

        {/* Right column: checkout receipt summary (visible during payment phases 0,1,2) */}
        {activeStep < 3 && (
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Dynamic AI Pricing Banner */}
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)',
                  color: '#ffffff',
                  borderRadius: 4,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <AutoAwesomeIcon sx={{ color: 'secondary.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold">AI Dynamic Pricing</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Hệ thống AI phân tích thời tiết mát mẻ và mật độ đặt chỗ vừa phải. Áp dụng ưu đãi giảm giá <strong style={{ color: '#fbbf24' }}>5%</strong> độc quyền khi mua vé trực tuyến hôm nay!
                  </Typography>
                </CardContent>
              </Card>

              {/* Booking Summary receipt */}
              <Card sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  Tóm Tắt Đơn Hàng
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Ngày tham quan: <strong>{visitDate}</strong>
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5}>
                  {TICKET_TYPES.map((ticket) => {
                    const q = quantities[ticket.id];
                    if (q === 0) return null;
                    return (
                      <Stack key={ticket.id} direction="row" justifyContent="space-between">
                        <Typography variant="body2">
                          {ticket.name} x {q}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(q * ticket.price)}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>

                {hasSelectedTickets ? (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Tạm tính</Typography>
                      <Typography variant="body2">{formatCurrency(totalOriginalPrice)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Typography variant="body2" color="success.main">Ưu đãi AI đặt sớm (5%)</Typography>
                      <Typography variant="body2" color="success.main">-{formatCurrency(discountAmount)}</Typography>
                    </Stack>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold">Tổng cộng</Typography>
                      <Typography variant="h5" fontWeight="bold" color="primary.main">
                        {formatCurrency(totalFinalPrice)}
                      </Typography>
                    </Stack>
                  </>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Vui lòng chọn ít nhất 1 vé để tiếp tục.
                  </Alert>
                )}

                {activeStep === 0 && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={!hasSelectedTickets}
                    onClick={handleNext}
                    sx={{ mt: 3, fontWeight: 'bold' }}
                  >
                    Tiếp Tục Đặt Vé
                  </Button>
                )}
              </Card>
            </Stack>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};
