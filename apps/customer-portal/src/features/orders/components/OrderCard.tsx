import React from 'react';
import { Card, CardContent, Grid, Typography, Button, Stack, Box, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentsIcon from '@mui/icons-material/Payments';
import { OrderStatusChip } from './OrderStatusChip';
import { formatCurrency, formatDate } from '@shared/utils';
import type { Order } from '../types/order.types';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Visit date helper: extract visit date from items or fallback
  const visitDate = order.items && order.items.length > 0
    ? formatDate(order.createdAt) // Fallback to purchase date or if booking details provide a date
    : formatDate(order.createdAt);

  const totalQuantity = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -6, borderColor: 'rgba(45, 212, 191, 0.4)' }}
      transition={{ duration: 0.2 }}
      sx={{
        bgcolor: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        mb: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: order.status === 'PAID'
            ? 'linear-gradient(90deg, #2dd4bf, #0ea5e9)'
            : order.status === 'PENDING'
            ? 'linear-gradient(90deg, #f59e0b, #eab308)'
            : 'linear-gradient(90deg, #64748b, #475569)',
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          {/* Main Info */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 800,
                    color: '#ffffff',
                  }}
                >
                  {order.orderCode}
                </Typography>
                {order.bookingId && (
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.05)',
                      color: 'rgba(255, 255, 255, 0.5)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1.5,
                      fontFamily: 'monospace',
                    }}
                  >
                    Booking: BK-{order.bookingId}
                  </Typography>
                )}
                <OrderStatusChip status={order.status} />
              </Stack>

              {/* Detail parameters */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" sx={{ display: 'block' }}>
                    Ngày mua
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 14, color: '#2dd4bf' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)' }}>
                      {formatDate(order.createdAt)}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" sx={{ display: 'block' }}>
                    Số lượng vé
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <ReceiptLongIcon sx={{ fontSize: 14, color: '#0ea5e9' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.8)' }}>
                      {totalQuantity} vé
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" sx={{ display: 'block' }}>
                    Thanh toán
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <PaymentsIcon sx={{ fontSize: 14, color: order.status === 'PAID' ? '#2dd4bf' : '#f59e0b' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: order.status === 'PAID' ? '#2dd4bf' : '#f59e0b' }}>
                      {order.status === 'PAID' ? 'Đã nhận tiền' : order.status === 'PENDING' ? 'Đang chờ' : 'Hủy bỏ'}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" sx={{ display: 'block' }}>
                    Trạng thái vé
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <OrderStatusChip status={order.status === 'PAID' ? 'ACTIVE' : order.status === 'CANCELLED' ? 'CANCELLED' : order.status === 'REFUNDED' ? 'REFUNDED' : 'PENDING'} />
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          {/* Pricing & Navigation */}
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' },
                justifyContent: 'space-between',
                alignItems: { xs: 'center', md: 'flex-end' },
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" sx={{ display: 'block', mb: 0.2 }}>
                  Tổng tiền
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 900,
                    color: '#ffffff',
                  }}
                >
                  {formatCurrency(order.totalAmount)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate(`/orders/${order.id}`)}
                sx={{
                  fontWeight: 800,
                  bgcolor: 'rgba(255, 255, 255, 0.06)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  py: 1,
                  px: 2.5,
                  textTransform: 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#2dd4bf',
                    color: '#0f172a',
                    borderColor: '#2dd4bf',
                    boxShadow: '0 4px 14px rgba(45, 212, 191, 0.3)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)',
                  },
                }}
              >
                Chi tiết
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
