import React, { useState } from 'react';
import { Box, Grid, Typography, Paper, Divider, Stack, Button, Chip } from '@mui/material';
import { Booking } from '../types';
import { StatusChip } from '../../ticket/components/StatusChip';
import { BookingTimeline } from './BookingTimeline';
import { QRCodeViewer } from '../../ticket/components/QRCodeViewer';
import { MdPerson, MdReceipt, MdOutlineConfirmationNumber, MdQrCode } from 'react-icons/md';
import dayjs from 'dayjs';
import { formatCurrency } from '../../analytics/utils/numberFormatters';

interface BookingDetailsProps {
  booking: Booking;
  onPayQR?: (booking: Booking) => void;
}

export const BookingDetails: React.FC<BookingDetailsProps> = ({
  booking,
  onPayQR,
}) => {
  const [selectedTicketCode, setSelectedTicketCode] = useState<string | null>(null);

  const totalTicketsCount = booking.items?.reduce((sum, item) => sum + item.quantity, 0) || booking.tickets?.length || 0;

  // Build booking timeline steps
  const isPaid = booking.status === 1 || String(booking.status).toUpperCase() === 'PAID';
  const isCancelled = booking.status === 2 || String(booking.status).toUpperCase() === 'CANCELLED';

  const timelineSteps = [
    {
      title: 'Đã tạo đơn hàng',
      description: `Đơn hàng được khởi tạo. Mã: BK-${String(booking.id).padStart(4, '0')}`,
      timestamp: dayjs(booking.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      status: 'done' as const,
    },
    {
      title: 'Chờ thanh toán',
      description: `Phương thức: ${booking.paymentMethod === 'CHUYEN_KHOAN_QR' ? 'Chuyển khoản Ngân hàng qua QR' : 'Tiền mặt tại quầy'}`,
      timestamp: dayjs(booking.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      status: (isPaid || isCancelled) ? 'done' as const : 'active' as const,
    },
    {
      title: isCancelled ? 'Đơn hàng đã hủy' : 'Thanh toán đã xác nhận & Hoàn tất',
      description: isCancelled ? 'Đơn hàng này đã bị hủy.' : 'Xác nhận thanh toán thành công. Các thẻ vé kỹ thuật số đã được kích hoạt.',
      timestamp: isPaid ? dayjs(booking.createdAt).add(5, 'minute').format('YYYY-MM-DD HH:mm:ss') : undefined,
      status: isPaid ? 'done' as const : (isCancelled ? 'failed' as const : 'pending' as const),
    },
  ];

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Grid container spacing={3}>
        {/* Left column: customer, tickets, visitors */}
        <Grid item xs={12} md={8} display="flex" flexDirection="column" gap={3}>
          {/* Customer */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                <MdPerson /> Thông tin liên hệ Khách hàng
              </Typography>
              <StatusChip status={String(booking.status)} type="booking" />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Tên khách hàng</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {booking.customer?.fullName || 'Khách vãng lai'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Địa chỉ Email</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {booking.customer?.email || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {booking.customer?.phone || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Tickets list */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
              <MdOutlineConfirmationNumber /> Các loại vé ({totalTicketsCount})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {(!booking.tickets || booking.tickets.length === 0) ? (
              <Stack spacing={1.5}>
                {booking.items?.map((item, idx) => (
                  <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" p={1.5} sx={{ bgcolor: 'action.hover', borderRadius: 1.5 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.ticketType?.name || 'Vé vào cửa'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Đơn giá: {formatCurrency(item.ticketType?.price || 0)} / vé
                      </Typography>
                    </Box>
                    <Chip label={`SL: ${item.quantity}`} size="small" color="primary" />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Stack spacing={2}>
                {booking.tickets.map((t) => (
                  <Box key={t.id} display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ bgcolor: 'action.hover', borderRadius: 1.5 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={700} fontFamily="monospace" color="text.primary">
                        {t.ticketCode}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Loại: {t.ticketType?.name || 'Vé phổ thông'} | Lượt dùng tối đa: {t.maxUses}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1.5} alignItems="center">
                      <StatusChip status={t.status} type="ticket" />
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<MdQrCode />}
                        onClick={() => setSelectedTicketCode(t.ticketCode)}
                      >
                        QR
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Visitors */}
          {booking.visitors && booking.visitors.length > 0 && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Thông tin khách tham quan đã đăng ký
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                {booking.visitors.map((v, idx) => (
                  <Box key={v.id || idx} p={1.5} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">Họ và tên</Typography>
                        <Typography variant="body2" fontWeight={600}>{v.fullName}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">Số điện thoại</Typography>
                        <Typography variant="body2">{v.phone || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">CCCD / Hộ chiếu</Typography>
                        <Typography variant="body2">{v.idCard || 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Paper>
          )}
        </Grid>

        {/* Right column: payment, timeline, QR viewer */}
        <Grid item xs={12} md={4} display="flex" flexDirection="column" gap={3}>
          {/* Payment info */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
              <MdReceipt /> Hóa đơn đơn hàng
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Tạm tính</Typography>
                <Typography variant="body2" fontWeight={600}>{formatCurrency(booking.totalAmount)}</Typography>
              </Box>
              {booking.membershipDiscount && booking.membershipDiscount > 0 ? (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Giảm giá Thành viên</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">-{formatCurrency(booking.membershipDiscount)}</Typography>
                </Box>
              ) : null}
              {booking.promotions ? (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Khuyến mãi ({booking.promotions.code})</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">-{formatCurrency(booking.promotions.discountAmount)}</Typography>
                </Box>
              ) : null}
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight="bold">Tổng tiền</Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                  {formatCurrency(booking.totalAmount)}
                </Typography>
              </Box>
              
              {!isPaid && !isCancelled && onPayQR && (
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<MdQrCode />}
                  onClick={() => onPayQR(booking)}
                  sx={{ mt: 1 }}
                >
                  Thanh toán qua liên kết QR
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Timeline */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Tiến trình đơn hàng
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <BookingTimeline steps={timelineSteps} />
          </Paper>

          {/* Quick QR Viewer */}
          {selectedTicketCode && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" align="center" mb={1.5}>
                Mã QR Vé
              </Typography>
              <QRCodeViewer value={selectedTicketCode} size={150} label={selectedTicketCode} />
              <Box display="flex" justifyContent="center" sx={{ mt: 1.5 }}>
                <Button size="small" color="inherit" onClick={() => setSelectedTicketCode(null)}>
                  Đóng xem trước
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
