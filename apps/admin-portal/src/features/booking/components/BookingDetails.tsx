import React, { useState } from 'react';
import { Box, Grid, Typography, Paper, Divider, Stack, Button, Chip } from '@mui/material';
import { Booking } from '../types';
import { StatusChip } from '../../ticket/components/StatusChip';
import { BookingTimeline } from './BookingTimeline';
import { QRCodeViewer } from '../../ticket/components/QRCodeViewer';
import { MdPerson, MdReceipt, MdOutlineConfirmationNumber, MdQrCode } from 'react-icons/md';
import dayjs from 'dayjs';

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
      title: 'Booking Created',
      description: `Order initialized. ID: BK-${String(booking.id).padStart(4, '0')}`,
      timestamp: dayjs(booking.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      status: 'done' as const,
    },
    {
      title: 'Payment Awaiting',
      description: `Method: ${booking.paymentMethod === 'CHUYEN_KHOAN_QR' ? 'QR Banking Transfer' : 'Cash Counter'}`,
      timestamp: dayjs(booking.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      status: (isPaid || isCancelled) ? 'done' as const : 'active' as const,
    },
    {
      title: isCancelled ? 'Booking Cancelled' : 'Payment Confirmed & Completed',
      description: isCancelled ? 'This order was cancelled.' : 'Payment confirmed. Digital ticket passes activated.',
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
                <MdPerson /> Customer Contact Info
              </Typography>
              <StatusChip status={String(booking.status)} type="booking" />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Customer Name</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {booking.customer?.fullName || 'Walk-in Guest'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Email Address</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {booking.customer?.email || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {booking.customer?.phone || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Tickets list */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
              <MdOutlineConfirmationNumber /> Ticket Items ({totalTicketsCount})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {(!booking.tickets || booking.tickets.length === 0) ? (
              <Stack spacing={1.5}>
                {booking.items?.map((item, idx) => (
                  <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" p={1.5} sx={{ bgcolor: 'action.hover', borderRadius: 1.5 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.ticketType?.name || 'Admission Entry'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Price: ${item.ticketType?.price?.toFixed(2) || '0.00'} each
                      </Typography>
                    </Box>
                    <Chip label={`Qty: ${item.quantity}`} size="small" color="primary" />
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
                        Type: {t.ticketType?.name || 'General Admission'} | Max Uses: {t.maxUses}
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
                Registered Visitors Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                {booking.visitors.map((v, idx) => (
                  <Box key={v.id || idx} p={1.5} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">Full Name</Typography>
                        <Typography variant="body2" fontWeight={600}>{v.fullName}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                        <Typography variant="body2">{v.phone || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">ID Card / Passport</Typography>
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
              <MdReceipt /> Order Receipt
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={1.5}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Subtotal Amount</Typography>
                <Typography variant="body2" fontWeight={600}>${booking.totalAmount.toFixed(2)}</Typography>
              </Box>
              {booking.membershipDiscount && booking.membershipDiscount > 0 ? (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Membership Discount</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">-${booking.membershipDiscount.toFixed(2)}</Typography>
                </Box>
              ) : null}
              {booking.promotions ? (
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Promo ({booking.promotions.code})</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">-${booking.promotions.discountAmount.toFixed(2)}</Typography>
                </Box>
              ) : null}
              <Divider />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight="bold">Total Amount</Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                  ${booking.totalAmount.toFixed(2)}
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
                  Pay via QR Link
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Timeline */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Order Timeline
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <BookingTimeline steps={timelineSteps} />
          </Paper>

          {/* Quick QR Viewer */}
          {selectedTicketCode && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" align="center" mb={1.5}>
                Ticket QR Code
              </Typography>
              <QRCodeViewer value={selectedTicketCode} size={150} label={selectedTicketCode} />
              <Box display="flex" justifyContent="center" sx={{ mt: 1.5 }}>
                <Button size="small" color="inherit" onClick={() => setSelectedTicketCode(null)}>
                  Close Preview
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
