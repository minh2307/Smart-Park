import React, { useState } from 'react';
import { Box, Paper, Grid, Card, CardContent, Typography, Alert } from '@mui/material';
import { PageContainer } from '../../../layouts/components/PageContainer';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Dialog';
import { TicketTable } from '../components/TicketTable';
import { TicketFilterPanel } from '../components/TicketFilterPanel';
import { TicketDetails } from '../components/TicketDetails';
import { TicketForm } from '../components/TicketForm';
import { TicketValidationDialog } from '../components/TicketValidationDialog';
import { useGetTicketsQuery, useUpdateTicketStatusMutation } from '../services/ticketApi';
import { Ticket, TicketStatus } from '../types';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';
import { MdQrCodeScanner, MdConfirmationNumber, MdCheckCircle, MdOutlineRemoveCircle } from 'react-icons/md';

export const TicketOverviewPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TicketStatus | ''>('');
  const [venueId, setVenueId] = useState<number | ''>('');

  const { data, isLoading, isError, refetch } = useGetTicketsQuery({
    page,
    size,
    search,
    status,
    venueId,
  });

  const [updateTicketStatus, { isLoading: isUpdating }] = useUpdateTicketStatusMutation();

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setVenueId('');
    setPage(0);
  };

  const handleEditSubmit = async (formData: any) => {
    if (!selectedTicket) return;
    try {
      await updateTicketStatus({
        id: selectedTicket.id,
        status: formData.status,
      }).unwrap();
      
      // Update selected ticket in UI
      setSelectedTicket((prev) => prev ? {
        ...prev,
        status: formData.status,
        validDate: formData.validDate,
        maxUses: formData.maxUses,
        remainingUses: formData.maxUses - prev.usageCount,
        customer: prev.customer ? {
          ...prev.customer,
          fullName: formData.customerName,
          email: formData.customerEmail,
        } : undefined
      } : null);

      setEditOpen(false);
    } catch (err) {
      console.error('Failed to update ticket status', err);
      // Fallback for demo: update mock state locally
      const idx = mockTickets.findIndex(t => t.id === selectedTicket.id);
      if (idx !== -1) {
        mockTickets[idx] = {
          ...mockTickets[idx],
          status: formData.status,
          validDate: formData.validDate,
          maxUses: formData.maxUses,
          remainingUses: formData.maxUses - mockTickets[idx].usageCount,
          customer: {
            id: mockTickets[idx].customer?.id || 1,
            fullName: formData.customerName,
            email: formData.customerEmail,
          }
        };
      }
      setEditOpen(false);
    }
  };

  const mockTickets: Ticket[] = [
    {
      id: 1,
      ticketCode: 'TKT-7829-109',
      validDate: '2026-12-31',
      createdAt: '2026-07-09T08:15:30Z',
      status: 'SOLD',
      usageCount: 0,
      remainingUses: 1,
      maxUses: 1,
      ticketType: { id: 1, name: 'General Admission', price: 45.00 },
      customer: { id: 1, fullName: 'John Doe', email: 'john.doe@gmail.com', phone: '+123456789' },
      venue: { id: 1, name: 'Smart Park East Wing' },
    },
    {
      id: 2,
      ticketCode: 'TKT-9912-304',
      validDate: '2026-06-30',
      createdAt: '2026-06-01T10:00:00Z',
      status: 'EXPIRED',
      usageCount: 1,
      remainingUses: 0,
      maxUses: 1,
      ticketType: { id: 2, name: 'VIP Fast Pass', price: 95.00 },
      customer: { id: 2, fullName: 'Jane Smith', email: 'jane.smith@yahoo.com', phone: '+987654321' },
      venue: { id: 1, name: 'Smart Park East Wing' },
    },
    {
      id: 3,
      ticketCode: 'TKT-4412-882',
      validDate: '2026-08-15',
      createdAt: '2026-07-08T14:22:15Z',
      status: 'USED',
      usageCount: 2,
      remainingUses: 0,
      maxUses: 2,
      ticketType: { id: 3, name: 'Two-Day Combo Pass', price: 80.00 },
      customer: { id: 3, fullName: 'Robert Johnson', email: 'robert.j@outlook.com', phone: '+447911123' },
      venue: { id: 2, name: 'Water World Pavilion' },
      scans: [
        { id: 1, attractionName: 'Colossus Rollercoaster', checkInTime: '2026-07-08T15:30:00Z', status: 'THANH_CONG' },
        { id: 2, attractionName: 'Pirate Ship Swing', checkInTime: '2026-07-08T17:45:00Z', status: 'THANH_CONG' }
      ]
    },
    {
      id: 4,
      ticketCode: 'TKT-3382-771',
      validDate: '2026-10-01',
      createdAt: '2026-07-09T11:05:00Z',
      status: 'ACTIVATED',
      usageCount: 1,
      remainingUses: 4,
      maxUses: 5,
      ticketType: { id: 4, name: 'Season Multi-Pass', price: 150.00 },
      customer: { id: 4, fullName: 'Emily Davis', email: 'emily.d@gmail.com', phone: '+15550199' },
      venue: { id: 2, name: 'Water World Pavilion' },
      scans: [
        { id: 3, attractionName: 'Splash Mountain water ride', checkInTime: '2026-07-09T12:00:00Z', status: 'THANH_CONG' }
      ]
    }
  ];

  const displayData = data?.content || (isLoading ? [] : mockTickets);
  const displayTotal = data?.totalElements ?? mockTickets.length;

  // Summary Metrics calculations
  const totalSold = displayData.filter(t => t.status === 'SOLD' || t.status === 'ACTIVATED' || t.status === 'USED' || t.status === 'PARTIALLY_USED').length;
  const totalUsed = displayData.filter(t => t.status === 'USED').length;
  const totalExpired = displayData.filter(t => t.status === 'EXPIRED').length;

  return (
    <PageContainer
      title="Tổng quan quản lý vé"
      toolbar={
        <PermissionWrapper requiredPermission="validate:tickets">
          <Button
            variant="contained"
            color="success"
            startIcon={<MdQrCodeScanner />}
            onClick={() => setValidationOpen(true)}
          >
            Quét & Kiểm tra vé
          </Button>
        </PermissionWrapper>
      }
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Summary statistics */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="primary.light" sx={{ borderRadius: 2, color: 'primary.contrastText', display: 'flex' }}>
                  <MdConfirmationNumber size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Tổng số vé bán ra</Typography>
                  <Typography variant="h5" fontWeight="bold">{totalSold}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="success.light" sx={{ borderRadius: 2, color: 'success.contrastText', display: 'flex' }}>
                  <MdCheckCircle size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Đã soát vé (Đã sử dụng)</Typography>
                  <Typography variant="h5" fontWeight="bold">{totalUsed}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box p={1.5} bgcolor="error.light" sx={{ borderRadius: 2, color: 'error.contrastText', display: 'flex' }}>
                  <MdOutlineRemoveCircle size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Vé đã hết hạn</Typography>
                  <Typography variant="h5" fontWeight="bold">{totalExpired}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filter bar */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <TicketFilterPanel
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
            Không thể kết nối đến máy chủ quản lý vé. Đang hiển thị danh sách ngoại tuyến.
          </Alert>
        )}

        {/* Tickets table */}
        <TicketTable
          data={displayData}
          loading={isLoading}
          page={page}
          rowsPerPage={size}
          totalElements={displayTotal}
          onPageChange={setPage}
          onRowsPerPageChange={setSize}
          onViewDetails={(ticket) => {
            setSelectedTicket(ticket);
            setDetailsOpen(true);
          }}
          onValidate={(ticket) => {
            setSelectedTicket(ticket);
            setValidationOpen(true);
          }}
          onEditStatus={(ticket) => {
            setSelectedTicket(ticket);
            setEditOpen(true);
          }}
        />

        {/* Details Dialog */}
        <Modal
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          title="Bảng chi tiết thông tin vé"
          maxWidth="md"
        >
          {selectedTicket && <TicketDetails ticket={selectedTicket} />}
        </Modal>

        {/* Edit Dialog */}
        <Modal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title="Điều chỉnh thông tin & trạng thái vé"
        >
          <TicketForm
            initialData={selectedTicket || undefined}
            onSubmit={handleEditSubmit}
            loading={isUpdating}
          />
        </Modal>

        {/* Validation Dialog */}
        <TicketValidationDialog
          open={validationOpen}
          onClose={() => {
            setValidationOpen(false);
            refetch();
          }}
          initialTicketCode={selectedTicket?.ticketCode || ''}
        />
      </Box>
    </PageContainer>
  );
};
