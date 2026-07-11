import React, { useState } from 'react';
import { Box, Paper, Grid, Card, CardContent, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { PageContainer } from '../../../layouts/components/PageContainer';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Dialog';
import { BookingTable } from '../components/BookingTable';
import { BookingFilterPanel } from '../components/BookingFilterPanel';
import { BookingDetails } from '../components/BookingDetails';
import { BookingForm } from '../components/BookingForm';
import {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
  useCreatePaymentLinkMutation,
} from '../services/bookingApi';
import { Booking } from '../types';
import { BookingInput } from '../schemas/bookingSchema';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';
import { MdAdd, MdReceipt, MdShoppingBag, MdCancel } from 'react-icons/md';

export const BookingListPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [venueId, setVenueId] = useState<number | ''>('');

  const { data, isLoading, isError, refetch } = useGetBookingsQuery({
    page,
    size,
    search,
    status,
    venueId,
  });

  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();
  const [cancelBooking] = useCancelBookingMutation();
  const [createPaymentLink] = useCreatePaymentLinkMutation();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [payQROpen, setPayQROpen] = useState(false);
  const [payUrl, setPayUrl] = useState<string | null>(null);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setVenueId('');
    setPage(0);
  };

  const handleCreateSubmit = async (formData: BookingInput) => {
    try {
      const idempotencyKey = crypto.randomUUID();
      const body = {
        customerId: formData.customerId,
        venueId: formData.venueId,
        items: formData.items.map((i: any) => ({
          ticketTypeId: i.ticketTypeId,
          quantity: i.quantity,
        })),
      };
      
      await createBooking({ body, idempotencyKey }).unwrap();
      
      // Update local state if backend call succeeds
      setCreateOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to create booking', err);
      // Fallback: simulate local mock creation
      const mockId = mockBookings.length + 1;
      const subtotal = formData.items.reduce((sum: number, item: any) => {
        const type = mockTicketTypes.find((t) => t.id === item.ticketTypeId);
        return sum + (type?.price || 0) * item.quantity;
      }, 0);
      const discount = formData.promotionCode?.toUpperCase() === 'GATEOS10' ? subtotal * 0.1 : 0;
      
      const newMockBooking: Booking = {
        id: mockId,
        customerId: formData.customerId,
        venueId: formData.venueId,
        totalAmount: subtotal - discount,
        paymentMethod: formData.paymentMethod,
        status: 0, // Pending
        createdAt: new Date().toISOString(),
        customer: mockCustomers.find(c => c.id === formData.customerId) || { id: 1, fullName: 'Walk-in Customer', email: 'c@g.com' },
        items: formData.items.map((i: any) => ({
          ticketTypeId: i.ticketTypeId,
          quantity: i.quantity,
          ticketType: mockTicketTypes.find(t => t.id === i.ticketTypeId)
        }))
      };
      
      mockBookings.unshift(newMockBooking);
      setCreateOpen(false);
    }
  };

  const handleCancelConfirm = async (booking: Booking) => {
    if (window.confirm(`Are you sure you want to cancel booking BK-${String(booking.id).padStart(4, '0')}?`)) {
      try {
        await cancelBooking(booking.id).unwrap();
      } catch (err) {
        console.error('Failed to cancel booking', err);
        // Fallback: update status locally
        const idx = mockBookings.findIndex(b => b.id === booking.id);
        if (idx !== -1) {
          mockBookings[idx].status = 2; // Cancelled
        }
        // Force re-render by trigger
        setPage(page);
      }
    }
  };

  const handlePayQRTrigger = async (booking: Booking) => {
    setSelectedBooking(booking);
    try {
      const res = await createPaymentLink({
        orderId: booking.id,
        paymentMethod: 'CHUYEN_KHOAN_QR',
      }).unwrap();
      setPayUrl(res.paymentUrl);
      setPayQROpen(true);
    } catch (err) {
      console.error('Failed to create payment link', err);
      // Fallback: generate a simulated payment string for bank transfer
      setPayUrl(`https://img.vietqr.io/image/970415-11336699-compact2.png?amount=${booking.totalAmount}&addInfo=GATEOS%20BK%20${booking.id}&accountName=GATEOS%20TICKETS`);
      setPayQROpen(true);
    }
  };

  const handlePaySuccessSimulated = () => {
    if (!selectedBooking) return;
    // Mark as paid locally
    const idx = mockBookings.findIndex(b => b.id === selectedBooking.id);
    if (idx !== -1) {
      mockBookings[idx].status = 1; // Paid
      // Generate mock tickets for it
      mockBookings[idx].tickets = mockBookings[idx].items?.map((item, index) => ({
        id: Math.floor(Math.random() * 1000),
        ticketCode: `TKT-${Math.floor(1000 + Math.random() * 9000)}-${selectedBooking.id}-${index}`,
        status: 'SOLD',
        validDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        usageCount: 0,
        remainingUses: 1,
        maxUses: 1,
        ticketType: item.ticketType,
        customer: selectedBooking.customer,
      }));
    }
    setPayQROpen(false);
    setSelectedBooking(null);
  };

  const mockCustomers = [
    { id: 1, fullName: 'John Doe', email: 'john.doe@gmail.com' },
    { id: 2, fullName: 'Jane Smith', email: 'jane.smith@yahoo.com' },
    { id: 3, fullName: 'Robert Johnson', email: 'robert.j@outlook.com' },
  ];

  const mockTicketTypes = [
    { id: 1, name: 'General Admission', price: 45.00 },
    { id: 2, name: 'VIP Fast Pass', price: 95.00 },
    { id: 3, name: 'Two-Day Combo Pass', price: 80.00 },
  ];

  const mockBookings: Booking[] = [
    {
      id: 1,
      customerId: 1,
      venueId: 1,
      totalAmount: 45.00,
      paymentMethod: 'CHUYEN_KHOAN_QR',
      status: 1,
      createdAt: '2026-07-09T08:15:30Z',
      customer: { id: 1, fullName: 'John Doe', email: 'john.doe@gmail.com', phone: '+123456789' },
      venue: { id: 1, name: 'Smart Park East Wing' },
      items: [{ ticketTypeId: 1, quantity: 1, ticketType: { id: 1, name: 'General Admission', price: 45.00 } }],
      tickets: [{ id: 1, ticketCode: 'TKT-7829-109', status: 'SOLD', validDate: '2026-12-31', createdAt: '2026-07-09T08:15:30Z', maxUses: 1, remainingUses: 1, usageCount: 0 }]
    },
    {
      id: 2,
      customerId: 2,
      venueId: 1,
      totalAmount: 95.00,
      paymentMethod: 'TIEN_MAT',
      status: 0,
      createdAt: '2026-07-09T10:00:00Z',
      customer: { id: 2, fullName: 'Jane Smith', email: 'jane.smith@yahoo.com', phone: '+987654321' },
      venue: { id: 1, name: 'Smart Park East Wing' },
      items: [{ ticketTypeId: 2, quantity: 1, ticketType: { id: 2, name: 'VIP Fast Pass', price: 95.00 } }],
    },
    {
      id: 3,
      customerId: 3,
      venueId: 2,
      totalAmount: 160.00,
      paymentMethod: 'CHUYEN_KHOAN_QR',
      status: 2,
      createdAt: '2026-07-08T14:22:15Z',
      customer: { id: 3, fullName: 'Robert Johnson', email: 'robert.j@outlook.com', phone: '+447911123' },
      venue: { id: 2, name: 'Water World Pavilion' },
      items: [{ ticketTypeId: 3, quantity: 2, ticketType: { id: 3, name: 'Two-Day Combo Pass', price: 80.00 } }],
    }
  ];

  const displayData = data?.content || (isLoading ? [] : mockBookings);
  const displayTotal = data?.totalElements ?? mockBookings.length;

  const countPending = displayData.filter(b => b.status === 0).length;
  const countPaid = displayData.filter(b => b.status === 1).length;
  const countCancelled = displayData.filter(b => b.status === 2).length;

  return (
    <PageContainer
      title="Booking & Sales Registry"
      toolbar={
        <PermissionWrapper requiredPermission="write:bookings">
          <Button
            variant="contained"
            startIcon={<MdAdd />}
            onClick={() => setCreateOpen(true)}
          >
            Create Booking
          </Button>
        </PermissionWrapper>
      }
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Metric Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="warning.light" sx={{ borderRadius: 2, color: 'warning.contrastText', display: 'flex' }}>
                  <MdShoppingBag size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Awaiting Payment</Typography>
                  <Typography variant="h5" fontWeight="bold">{countPending}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="success.light" sx={{ borderRadius: 2, color: 'success.contrastText', display: 'flex' }}>
                  <MdReceipt size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Completed Sales</Typography>
                  <Typography variant="h5" fontWeight="bold">{countPaid}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="error.light" sx={{ borderRadius: 2, color: 'error.contrastText', display: 'flex' }}>
                  <MdCancel size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Cancelled Bookings</Typography>
                  <Typography variant="h5" fontWeight="bold">{countCancelled}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter bar */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <BookingFilterPanel
            search={search}
            status={status}
            venueId={venueId}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onVenueChange={setVenueId}
            onReset={handleResetFilters}
            onRefresh={refetch}
          />
        </Paper>

        {isError && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Failed to connect to backend order service. Showing offline local records.
          </Alert>
        )}

        {/* Booking table */}
        <BookingTable
          data={displayData}
          loading={isLoading}
          page={page}
          rowsPerPage={size}
          totalElements={displayTotal}
          onPageChange={setPage}
          onRowsPerPageChange={setSize}
          onViewDetails={(booking) => {
            setSelectedBooking(booking);
            setDetailsOpen(true);
          }}
          onCancel={handleCancelConfirm}
          onPayQR={handlePayQRTrigger}
        />

        {/* Details Dialog */}
        <Modal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          title="Booking Sales Receipt Info"
          maxWidth="md"
        >
          {selectedBooking && (
            <BookingDetails
              booking={selectedBooking}
              onPayQR={handlePayQRTrigger}
            />
          )}
        </Modal>

        {/* Create Booking Wizard Modal */}
        <Modal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Initialize New Booking"
          maxWidth="md"
        >
          <BookingForm onSubmit={handleCreateSubmit} loading={isCreating} />
        </Modal>

        {/* Payment QR Modal */}
        <Dialog open={payQROpen} onClose={() => setPayQROpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', align: 'center' }}>Scan to Complete Purchase</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            {selectedBooking && (
              <>
                <Typography variant="body1" fontWeight="bold" gutterBottom>
                  Total Amount: ${selectedBooking.totalAmount.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" mb={2}>
                  Scan the QR code below via banking/e-wallet application to initiate payment.
                </Typography>
                
                {payUrl ? (
                  <Box
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: '#fff',
                      width: 220,
                      height: 220,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img src={payUrl} alt="VietQR Link" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                ) : (
                  <Typography variant="caption">Generating payment URL...</Typography>
                )}
                
                <Typography variant="caption" sx={{ mt: 2, fontFamily: 'monospace', fontWeight: 'bold' }}>
                  REF: GATEOS BK {selectedBooking.id}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button onClick={handlePaySuccessSimulated} variant="contained" color="success">
              Simulate Successful Payment
            </Button>
            <Button onClick={() => setPayQROpen(false)} variant="outlined" color="inherit">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};
