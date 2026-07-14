import { logger } from '../../../services/logger';
import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PaymentsIcon from '@mui/icons-material/Payments';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAppSelector } from '../../../store/hooks';
import { useGetOrdersQuery, useCancelOrderMutation, useCancelBookingMutation } from '../services/orderApi';
import { useGetBookingHistoryQuery } from '../../booking/api/bookingApi';
import { OrderCard } from '../components/OrderCard';
import { OrderTable } from '../components/OrderTable';
import { OrderSkeleton } from '../components/OrderSkeleton';
import { PaymentHistoryTable } from '../components/PaymentHistoryTable';
import { OrderStatusChip } from '../components/OrderStatusChip';
import { formatCurrency, formatDate } from '@shared/utils';

export const OrderListPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  const customerId = user?.id || 0;

  // Tabs: 0 = Orders, 1 = Bookings, 2 = Payment History
  const [activeTab, setActiveTab] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(0);

  // Queries
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useGetOrdersQuery({ page, size: 20 }, { skip: !customerId });

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
  } = useGetBookingHistoryQuery(customerId, { skip: !customerId });

  // Mutations
  const [cancelOrder] = useCancelOrderMutation();
  const [cancelBooking] = useCancelBookingMutation();

  // Cancel dialog states
  const [cancelTarget, setCancelTarget] = useState<{ type: 'order' | 'booking'; code: string } | null>(null);
  const [cancelReason, setCancelReason] = useState('Thay đổi kế hoạch vui chơi');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Filter & Sort Orders locally for the customer
  const filteredOrders = useMemo(() => {
    let result = ordersData?.content ? [...ordersData.content] : [];

    // Filter to only this customer's orders
    result = result.filter((o) => o.customer?.id === customerId);

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((o) => o.orderCode.toLowerCase().includes(q));
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((o) => o.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      const amountA = a.totalAmount;
      const amountB = b.totalAmount;

      if (sortBy === 'date_desc') return dateB - dateA;
      if (sortBy === 'date_asc') return dateA - dateB;
      if (sortBy === 'amount_desc') return amountB - amountA;
      if (sortBy === 'amount_asc') return amountA - amountB;
      return 0;
    });

    return result;
  }, [ordersData, customerId, searchQuery, statusFilter, sortBy]);

  // Filter & Sort Bookings
  const filteredBookings = useMemo(() => {
    let result = bookingsData ? [...bookingsData] : [];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((b) => b.code.toLowerCase().includes(q));
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'date_desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [bookingsData, searchQuery, statusFilter, sortBy]);

  // Extract payment transaction history from customer's orders
  const paymentHistory = useMemo(() => {
    const allPayments: any[] = [];
    const customerOrders = ordersData?.content?.filter((o) => o.customer?.id === customerId) || [];
    
    customerOrders.forEach((order) => {
      if (order.payments) {
        order.payments.forEach((payment) => {
          allPayments.push({
            ...payment,
            orderCode: order.orderCode,
          });
        });
      }
    });

    // Sort payments by time desc
    allPayments.sort((a, b) => {
      const timeA = a.paymentTime ? new Date(a.paymentTime).getTime() : 0;
      const timeB = b.paymentTime ? new Date(b.paymentTime).getTime() : 0;
      return timeB - timeA;
    });

    return allPayments;
  }, [ordersData, customerId]);

  const handleCancelClick = (type: 'order' | 'booking', code: string) => {
    setCancelTarget({ type, code });
  };

  const handleCancelSubmit = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      if (cancelTarget.type === 'order') {
        await cancelOrder(cancelTarget.code).unwrap();
      } else {
        await cancelBooking({ code: cancelTarget.code, reason: cancelReason }).unwrap();
      }
      refetchOrders();
      refetchBookings();
      setCancelTarget(null);
    } catch (err) {
      logger.error('Cancellation failed:', err);
    } finally {
      setCancelLoading(false);
    }
  };

  const isDark = theme.palette.mode === 'dark';

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
        {/* Title Block */}
        <Box sx={{ mb: 5 }}>
          <Typography
            sx={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 900,
              fontSize: { xs: '2.2rem', md: '3rem' },
              background: isDark
                ? 'linear-gradient(135deg, #ffffff 50%, #2dd4bf 100%)'
                : 'linear-gradient(135deg, #0f172a 50%, #0d9488 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1.5,
            }}
          >
            Quản lý giao dịch
          </Typography>
          <Typography color={isDark ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary'} variant="body1">
            Tra cứu đơn hàng, lịch sử đặt giữ vé và lịch sử các cổng giao dịch của bạn.
          </Typography>
        </Box>

        {/* Tab Selection */}
        <Box sx={{ borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => {
              setActiveTab(val);
              setStatusFilter('ALL');
            }}
            textColor="inherit"
            indicatorColor="secondary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': { bgcolor: isDark ? '#2dd4bf' : 'primary.main' },
              '& .MuiTab-root': {
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                minWidth: 'auto',
                px: 3,
                pb: 1.5,
                '&.Mui-selected': { color: isDark ? '#2dd4bf' : 'primary.main' },
              },
            }}
          >
            <Tab icon={<ReceiptIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Đơn hàng" />
            <Tab icon={<BookOnlineIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Lịch sử đặt giữ vé" />
            <Tab icon={<PaymentsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Lịch sử thanh toán" />
          </Tabs>
        </Box>

        {/* Filters Panel (Shown for Orders and Bookings) */}
        {activeTab !== 2 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 2,
              mb: 4,
            }}
          >
            <TextField
              size="small"
              placeholder={activeTab === 0 ? "Tìm theo mã hóa đơn (e.g. ORD-...)" : "Tìm theo mã booking (e.g. BK-...)"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flexGrow: 1,
                maxHeight: 40,
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  bgcolor: 'rgba(30, 41, 59, 0.4)',
                  borderRadius: 3,
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                  '&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
                },
              }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { md: 360 } }}>
              <TextField
                select
                size="small"
                label="Trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  width: { sm: 160 },
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    bgcolor: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: 3,
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.4)' },
                }}
              >
                <MenuItem value="ALL">Tất cả</MenuItem>
                <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                <MenuItem value="PAID">Đã thanh toán</MenuItem>
                <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                {activeTab === 0 && <MenuItem value="REFUNDED">Hoàn tiền</MenuItem>}
              </TextField>

              <TextField
                select
                size="small"
                label="Sắp xếp"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  width: { sm: 180 },
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    bgcolor: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: 3,
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.08)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#2dd4bf' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.4)' },
                }}
              >
                <MenuItem value="date_desc">Mới nhất</MenuItem>
                <MenuItem value="date_asc">Cũ nhất</MenuItem>
                {activeTab === 0 && <MenuItem value="amount_desc">Tổng tiền giảm dần</MenuItem>}
                {activeTab === 0 && <MenuItem value="amount_asc">Tổng tiền tăng dần</MenuItem>}
              </TextField>
            </Stack>
          </Box>
        )}

        {/* Tab content rendering */}
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="orders-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {ordersLoading ? (
                Array.from({ length: 3 }).map((_, idx) => <OrderSkeleton key={idx} />)
              ) : ordersError ? (
                <Alert severity="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  Lỗi tải danh sách đơn hàng. Vui lòng thử lại sau.
                </Alert>
              ) : filteredOrders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <ReceiptIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                  <Typography variant="h6">Không tìm thấy đơn hàng nào</Typography>
                </Box>
              ) : (
                <>
                  {/* Desktop view: table */}
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <OrderTable orders={filteredOrders} />
                  </Box>
                  {/* Mobile/Tablet view: cards */}
                  <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    {filteredOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </Box>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              key="bookings-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {bookingsLoading ? (
                Array.from({ length: 3 }).map((_, idx) => <OrderSkeleton key={idx} />)
              ) : bookingsError ? (
                <Alert severity="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  Lỗi tải lịch sử đặt giữ vé. Vui lòng thử lại sau.
                </Alert>
              ) : filteredBookings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <BookOnlineIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                  <Typography variant="h6">Không tìm thấy lượt đặt vé nào</Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {filteredBookings.map((booking) => (
                    <Grid item xs={12} key={booking.id}>
                      <Box
                        sx={{
                          bgcolor: 'rgba(30, 41, 59, 0.4)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: 4,
                          p: 3,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: booking.status === 'PAID' || booking.status === 'CHECKED_IN' || booking.status === 'COMPLETED'
                              ? 'linear-gradient(90deg, #2dd4bf, #0ea5e9)'
                              : booking.status === 'PENDING'
                              ? 'linear-gradient(90deg, #f59e0b, #eab308)'
                              : 'linear-gradient(90deg, #64748b, #475569)',
                          }
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={8}>
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#ffffff' }}>
                                  {booking.code}
                                </Typography>
                                <OrderStatusChip status={booking.status} />
                              </Stack>
                              <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="caption" color="rgba(255,255,255,0.4)">Ngày đi</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{booking.validDate}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="caption" color="rgba(255,255,255,0.4)">Tạo lúc</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatDate(booking.createdAt)}</Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="caption" color="rgba(255,255,255,0.4)">Khuyến mãi</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{booking.couponCode || 'Không áp dụng'}</Typography>
                                </Grid>
                              </Grid>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                            <Stack direction={{ xs: 'row', md: 'column' }} justifyContent="space-between" alignItems={{ xs: 'center', md: 'flex-end' }} spacing={1.5}>
                              <Box>
                                <Typography variant="caption" color="rgba(255,255,255,0.4)">Tổng thanh toán</Typography>
                                <Typography variant="h5" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#ffffff' }}>
                                  {formatCurrency(booking.totalAmount)}
                                </Typography>
                              </Box>
                              <Stack direction="row" spacing={1}>
                                {booking.status === 'PENDING' && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="error"
                                    onClick={() => handleCancelClick('booking', booking.code)}
                                    startIcon={<CancelIcon />}
                                    sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                                  >
                                    Hủy đặt giữ
                                  </Button>
                                )}
                              </Stack>
                            </Stack>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="payments-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {ordersLoading ? (
                <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4, color: '#2dd4bf' }} />
              ) : paymentHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <PaymentsIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)', mb: 2 }} />
                  <Typography variant="h6">Chưa có giao dịch thanh toán nào</Typography>
                </Box>
              ) : (
                <PaymentHistoryTable payments={paymentHistory} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancellation confirmation modal */}
        <Dialog
          open={!!cancelTarget}
          onClose={() => setCancelTarget(null)}
          PaperProps={{
            sx: {
              bgcolor: '#1e293b',
              backgroundImage: 'none',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              width: '100%',
              maxWidth: 400,
            },
          }}
        >
          <DialogTitle sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#ffffff' }}>
            Hủy đơn đặt giữ vé
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                Bạn có chắc chắn muốn hủy đặt giữ vé mang mã <strong>{cancelTarget?.code}</strong> không? Các vé đã đặt sẽ được thu hồi ngay lập tức.
              </Typography>
              {cancelTarget?.type === 'booking' && (
                <TextField
                  fullWidth
                  size="small"
                  label="Lý do hủy"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.5)' } }}
                  InputProps={{
                    sx: {
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                    },
                  }}
                />
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setCancelTarget(null)} sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700 }}>
              Không
            </Button>
            <Button
              onClick={handleCancelSubmit}
              disabled={cancelLoading}
              variant="contained"
              sx={{
                bgcolor: '#ef4444',
                color: '#ffffff',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { bgcolor: '#dc2626' },
              }}
            >
              {cancelLoading ? 'Đang hủy...' : 'Đồng ý hủy'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};
