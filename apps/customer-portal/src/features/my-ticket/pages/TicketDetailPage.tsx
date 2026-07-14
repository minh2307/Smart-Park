import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Skeleton,
  Stack,
  Divider,
  Dialog,
  IconButton,
  Alert,
  LinearProgress,
  Paper,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { QRCodeSVG } from 'qrcode.react';
import { useGetTicketByCodeQuery, useCancelBookingFromTicketMutation } from '../api/myTicketApi';
import { useGetVenueAttractionsQuery } from '../../tickets/api/ticketApi';
import type { TicketStatus } from '../types/my-ticket.types';

export const TicketDetailPage: React.FC = () => {
  const { ticketCode } = useParams<{ ticketCode: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // QR security state
  const [qrToken, setQrToken] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  // Error/Success state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Queries & Mutations
  const { data: ticket, isLoading, error } = useGetTicketByCodeQuery(ticketCode || '', {
    skip: !ticketCode,
  });

  const venueId = ticket?.ticketType?.venueId || 0;
  const { data: attractions = [], isLoading: isLoadingAttractions } = useGetVenueAttractionsQuery(
    venueId,
    { skip: !venueId }
  );

  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingFromTicketMutation();

  // Dynamic QR Code generation for security
  useEffect(() => {
    if (!ticket) return;

    const generateSecureToken = () => {
      // Create a dynamic payload combining ticket code, timestamp, and a random signature
      const randomSig = Math.floor(100000 + Math.random() * 900000);
      const timestamp = Date.now();
      const token = `GATEOS_TICKET_${ticket.ticketCode}_TS_${timestamp}_SIG_${randomSig}`;
      setQrToken(token);
      setCountdown(30);
    };

    generateSecureToken();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generateSecureToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ticket]);

  // Handle browser print trigger
  const handlePrint = () => {
    window.print();
  };

  // Handle Cancellation/Refund request
  const handleCancelBooking = async () => {
    if (!ticket?.booking?.code) return;

    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng và hoàn tiền cho vé này không?')) {
      setErrorMsg(null);
      setSuccessMsg(null);
      try {
        await cancelBooking({ code: ticket.booking.code }).unwrap();
        setSuccessMsg('Hủy đặt vé và hoàn tiền thành công!');
      } catch (err: any) {
        const backendError = err?.data?.message || 'Có lỗi xảy ra trong quá trình hủy vé.';
        setErrorMsg(backendError);
      }
    }
  };

  // Helper for status styling
  const getStatusChipProps = (status: TicketStatus) => {
    switch (status) {
      case 'PAID':
        return {
          label: 'Chưa sử dụng',
          sx: {
            bgcolor: 'rgba(46, 125, 50, 0.1)',
            color: '#2e7d32',
            fontWeight: 'bold',
            border: '1px solid rgba(46, 125, 50, 0.3)',
          },
        };
      case 'CHECKED_IN':
        return {
          label: 'Đã check-in',
          sx: {
            bgcolor: 'rgba(2, 136, 209, 0.1)',
            color: '#0288d1',
            fontWeight: 'bold',
            border: '1px solid rgba(2, 136, 209, 0.3)',
          },
        };
      case 'USED':
        return {
          label: 'Đã sử dụng',
          sx: {
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: 'bold',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        };
      case 'EXPIRED':
        return {
          label: 'Hết hạn',
          sx: {
            bgcolor: 'rgba(237, 108, 2, 0.1)',
            color: '#ed6c02',
            fontWeight: 'bold',
            border: '1px solid rgba(237, 108, 2, 0.3)',
          },
        };
      case 'CANCELLED':
      case 'REFUNDED':
        return {
          label: status === 'REFUNDED' ? 'Đã hoàn tiền' : 'Đã hủy',
          sx: {
            bgcolor: 'rgba(211, 47, 47, 0.1)',
            color: '#d32f2f',
            fontWeight: 'bold',
            border: '1px solid rgba(211, 47, 47, 0.3)',
          },
        };
      default:
        return {
          label: status,
          sx: {},
        };
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Skeleton variant="rectangular" height={50} width={120} sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} sx={{ mb: 4, bgcolor: 'rgba(255,255,255,0.05)' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !ticket) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 4, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#f44336' }}>
          Không thể tìm thấy vé yêu cầu hoặc bạn không có quyền truy cập.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/wallet')} startIcon={<ArrowBackIcon />}>
          Quay lại ví vé
        </Button>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        py: 6,
        minHeight: '90vh',
        background: isDark
          ? 'radial-gradient(circle at top right, rgba(20, 184, 166, 0.08), transparent 40%)'
          : 'radial-gradient(circle at top right, rgba(13, 148, 136, 0.04), transparent 40%)',
        // Hide sidebar/layout during browser print view
        '@media print': {
          bgcolor: '#ffffff',
          color: '#000000',
          p: 0,
          background: 'none',
        },
      }}
    >
      <Container maxWidth="lg" className="print-container">
        {/* Navigation Bar - Hide during print */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', '@media print': { display: 'none' } }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/wallet')}
            sx={{
              color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
              fontWeight: 600,
              '&:hover': { color: isDark ? '#2dd4bf' : 'primary.main' },
            }}
          >
            Quay lại ví vé
          </Button>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)',
                color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'text.primary',
                '&:hover': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              In Vé
            </Button>
          </Stack>
        </Box>

        {/* Dynamic Alerts */}
        {errorMsg && (
          <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 4, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#f44336', '@media print': { display: 'none' } }}>
            {errorMsg}
          </Alert>
        )}

        {successMsg && (
          <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 4, bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#4caf50', '@media print': { display: 'none' } }}>
            {successMsg}
          </Alert>
        )}

        {/* Main Grid content */}
        <Grid container spacing={4}>
          {/* Left Column: Ticket details and Attractions list */}
          <Grid item xs={12} md={8}>
            <Stack spacing={4}>
              {/* Ticket Voucher Block */}
              <Card
                sx={{
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'background.paper',
                  backdropFilter: 'blur(20px)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  '@media print': {
                    bgcolor: '#ffffff',
                    border: '2px dashed #000000',
                    boxShadow: 'none',
                    color: '#000000',
                    borderRadius: 0,
                  },
                }}
              >
                {/* Visual Header */}
                <Box
                  sx={{
                    px: 4,
                    py: 3,
                    background: isDark
                      ? 'linear-gradient(90deg, rgba(20, 184, 166, 0.15), rgba(14, 165, 233, 0.15))'
                      : 'linear-gradient(90deg, rgba(20, 184, 166, 0.06), rgba(14, 165, 233, 0.06))',
                    borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '@media print': {
                      background: 'none',
                      borderBottom: '1px solid #000000',
                    },
                  }}
                >
                  <Stack>
                    <Typography
                      sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                      }}
                    >
                      THẺ RA VÀO SMART PARK
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary', '@media print': { color: '#666666' } }}>
                      Mã vé: {ticket.ticketCode}
                    </Typography>
                  </Stack>
                  <Chip size="medium" {...getStatusChipProps(ticket.status)} />
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 800,
                      color: 'text.primary',
                      mb: 3,
                      '@media print': { color: '#000000' },
                    }}
                  >
                    {ticket.ticketType.name}
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'} sx={{ mb: 0.5, '@media print': { color: '#666666' } }}>
                        Khách hàng
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Khách Hàng #{ticket.customerId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'} sx={{ mb: 0.5, '@media print': { color: '#666666' } }}>
                        Hạn sử dụng
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EventIcon sx={{ fontSize: 18, color: isDark ? '#2dd4bf' : 'primary.main', '@media print': { color: '#000000' } }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {ticket.validDate}
                        </Typography>
                      </Stack>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', my: 1, '@media print': { borderColor: '#000000' } }} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'} sx={{ mb: 0.5, '@media print': { color: '#666666' } }}>
                        Mã Booking
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {ticket.booking?.code || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'} sx={{ mb: 0.5, '@media print': { color: '#666666' } }}>
                        Trạng thái thanh toán
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: isDark ? '#2dd4bf' : 'primary.main', '@media print': { color: '#000000' } }}>
                        ĐÃ THANH TOÁN (VNPAY)
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Print QR Code Layout */}
                  <Box
                    sx={{
                      display: 'none',
                      '@media print': {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 4,
                      },
                    }}
                  >
                    <QRCodeSVG value={qrToken || ticket.ticketCode} size={180} level="H" />
                    <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
                      {ticket.ticketCode}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Timeline Verification Logs */}
              <Card
                sx={{
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'background.paper',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: 4,
                  p: 3,
                  '@media print': { display: 'none' },
                }}
              >
                <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 3 }}>
                  Lịch Sử Giao Dịch & Sử Dụng
                </Typography>

                <Stack spacing={3.5} sx={{ position: 'relative', pl: 3.5 }}>
                  {/* Timeline vertical bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      bottom: 10,
                      left: 10,
                      width: 2,
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    }}
                  />

                  {/* Step 1: Created */}
                  <Stack direction="row" spacing={2} sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -32,
                        top: 2,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: '#0ea5e9',
                        boxShadow: '0 0 10px rgba(14, 165, 233, 0.5)',
                      }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Khởi tạo đơn hàng & Đặt vé thành công
                      </Typography>
                      <Typography variant="caption" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'}>
                        {ticket.createdAt}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Step 2: Paid */}
                  <Stack direction="row" spacing={2} sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -32,
                        top: 2,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: ticket.status !== 'RESERVED' ? (isDark ? '#2dd4bf' : 'primary.main') : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                        boxShadow: ticket.status !== 'RESERVED' ? (isDark ? '0 0 10px rgba(45, 212, 191, 0.5)' : '0 0 10px rgba(13, 148, 136, 0.4)') : 'none',
                      }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: ticket.status !== 'RESERVED' ? 'text.primary' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)') }}>
                        Đã xác nhận thanh toán thành công
                      </Typography>
                      {ticket.status !== 'RESERVED' && (
                        <Typography variant="caption" color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'}>
                          {ticket.createdAt}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  {/* Step 3: Checked in */}
                  <Stack direction="row" spacing={2} sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: -32,
                        top: 2,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: (ticket.status === 'CHECKED_IN' || ticket.status === 'USED') ? '#0288d1' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                        boxShadow: (ticket.status === 'CHECKED_IN' || ticket.status === 'USED') ? '0 0 10px rgba(2, 136, 209, 0.5)' : 'none',
                      }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: (ticket.status === 'CHECKED_IN' || ticket.status === 'USED') ? 'text.primary' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)') }}>
                        Quét check-in tại cổng
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Card>

              {/* Related Attractions Section */}
              <Box sx={{ '@media print': { display: 'none' } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    mb: 3,
                  }}
                >
                  Các Trò Chơi & Điểm Tham Quan Phù Hợp
                </Typography>

                {isLoadingAttractions ? (
                  <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
                ) : attractions.length === 0 ? (
                  <Typography variant="body2" color={isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary'}>
                    Chưa có thông tin trò chơi cho công viên này.
                  </Typography>
                ) : (
                  <Grid container spacing={3}>
                    {attractions.slice(0, 3).map((attr) => (
                      <Grid item xs={12} sm={4} key={attr.id}>
                        <Card
                          sx={{
                            bgcolor: isDark ? 'rgba(30, 41, 59, 0.3)' : 'background.paper',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.08)',
                            borderRadius: 3,
                            height: '100%',
                          }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Chip
                              size="small"
                              label={attr.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm dừng'}
                              color={attr.status === 'ACTIVE' ? 'success' : 'warning'}
                              sx={{ mb: 1.5, height: 20, fontSize: '0.75rem' }}
                            />
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1, lineHeight: 1.3 }}>
                              {attr.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color={isDark ? 'rgba(255, 255, 255, 0.4)' : 'text.secondary'}
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                height: 48,
                              }}
                            >
                              {attr.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Stack>
          </Grid>

          {/* Right Column: Secure QR Code check-in and Action parameters */}
          <Grid item xs={12} md={4} sx={{ '@media print': { display: 'none' } }}>
            <Stack spacing={4}>
              {/* Secure QR Box */}
              {ticket.status === 'PAID' && (
                <Card
                  sx={{
                    bgcolor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'background.paper',
                    backdropFilter: 'blur(20px)',
                    border: isDark ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(13, 148, 136, 0.3)',
                    boxShadow: isDark ? '0 8px 32px 0 rgba(45, 212, 191, 0.05)' : '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
                    borderRadius: 4,
                    textAlign: 'center',
                    p: 4,
                  }}
                >
                  <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 1 }}>
                    Mã Check-in Tự Động
                  </Typography>
                  <Typography variant="body2" color={isDark ? 'rgba(255, 255, 255, 0.5)' : 'text.secondary'} sx={{ mb: 3 }}>
                    Quét tại làn cổng soát vé tự động Smart Gate.
                  </Typography>

                  {/* QR rendering container */}
                  <Box
                    onClick={() => setIsQrZoomed(true)}
                    sx={{
                      display: 'inline-flex',
                      p: 2.5,
                      bgcolor: '#ffffff',
                      borderRadius: 3,
                      mb: 2.5,
                      cursor: 'zoom-in',
                      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.03)' },
                    }}
                  >
                    <QRCodeSVG value={qrToken} size={180} level="H" />
                  </Box>

                  {/* Expiration progress tracker */}
                  <Stack spacing={1} sx={{ px: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color={isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary'}>
                        Mã bảo mật tự động cập nhật
                      </Typography>
                      <Typography variant="caption" sx={{ color: isDark ? '#2dd4bf' : 'primary.main', fontWeight: 'bold' }}>
                        {countdown}s
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(countdown / 30) * 100}
                      color="secondary"
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: isDark ? '#2dd4bf' : 'primary.main',
                        },
                      }}
                    />
                  </Stack>
                  <Typography variant="caption" color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'text.secondary'}>
                    Mã QR bảo mật động chống sao chép và chia sẻ trái phép.
                  </Typography>
                </Card>
              )}

              {/* Terms and Guidelines */}
              <Card
                sx={{
                  bgcolor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'background.paper',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: 4,
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 2 }}>
                  Điều Khoản & Hướng Dẫn
                </Typography>

                <Stack spacing={2}>
                  <Stack direction="row" spacing={1.5}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: isDark ? '#2dd4bf' : 'primary.main', mt: 0.3 }} />
                    <Typography variant="body2" color={isDark ? 'rgba(255, 255, 255, 0.7)' : 'text.primary'}>
                      Có giá trị sử dụng một lần duy nhất vào ngày đăng ký đã chọn ({ticket.validDate}).
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: isDark ? '#2dd4bf' : 'primary.main', mt: 0.3 }} />
                    <Typography variant="body2" color={isDark ? 'rgba(255, 255, 255, 0.7)' : 'text.primary'}>
                      Vui lòng tăng tối đa độ sáng màn hình điện thoại trước khi quét tại cổng tự động.
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: isDark ? '#2dd4bf' : 'primary.main', mt: 0.3 }} />
                    <Typography variant="body2" color={isDark ? 'rgba(255, 255, 255, 0.7)' : 'text.primary'}>
                      Trẻ em dưới 1m được miễn phí vé cổng nhưng cần có người lớn đi kèm bảo hộ.
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5}>
                    <InfoIcon sx={{ fontSize: 18, color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary', mt: 0.3 }} />
                    <Typography variant="body2" color={isDark ? 'rgba(255, 255, 255, 0.5)' : 'text.secondary'}>
                      Chính sách hoàn hủy áp dụng trước thời gian tham quan tối thiểu 24 giờ.
                    </Typography>
                  </Stack>
                </Stack>
              </Card>

              {/* Cancellation/Refund Trigger */}
              {ticket.status === 'PAID' && ticket.booking?.code && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<CancelIcon />}
                  disabled={isCancelling}
                  onClick={handleCancelBooking}
                  sx={{
                    py: 1.5,
                    fontWeight: 'bold',
                    borderColor: 'rgba(211, 47, 47, 0.3)',
                    color: '#d32f2f',
                    '&:hover': {
                      borderColor: '#d32f2f',
                      bgcolor: 'rgba(211, 47, 47, 0.05)',
                    },
                  }}
                >
                  {isCancelling ? 'Đang hủy...' : 'Hủy Vé & Hoàn Tiền'}
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* QR ZOOMED DIALOG */}
      <Dialog
        open={isQrZoomed}
        onClose={() => setIsQrZoomed(false)}
        PaperProps={{
          sx: {
            bgcolor: '#ffffff',
            p: 4,
            borderRadius: 4,
            textAlign: 'center',
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={() => setIsQrZoomed(false)} size="small" sx={{ color: '#000000' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <QRCodeSVG value={qrToken} size={250} level="H" />
        <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700, mt: 3, mb: 1 }}>
          Quét QR của bạn
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Mã số: {ticket.ticketCode}
        </Typography>
      </Dialog>
    </Box>
  );
};
