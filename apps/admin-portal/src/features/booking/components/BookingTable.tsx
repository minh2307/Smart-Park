import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { MdVisibility, MdClose, MdQrCode } from 'react-icons/md';
import { DataTable } from '../../../components/common/DataTable';
import { Booking } from '../types';
import { StatusChip } from '../../ticket/components/StatusChip';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';
import dayjs from 'dayjs';

interface BookingTableProps {
  data: Booking[];
  loading?: boolean;
  page: number;
  rowsPerPage: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onViewDetails: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onPayQR: (booking: Booking) => void;
}

export const BookingTable: React.FC<BookingTableProps> = ({
  data,
  loading = false,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  onViewDetails,
  onCancel,
  onPayQR,
}) => {
  const columns = [
    {
      id: 'id' as any,
      label: 'Booking ID',
      sortable: true,
      render: (row: Booking) => (
        <Typography variant="body2" fontWeight={600} fontFamily="monospace">
          BK-{String(row.id).padStart(4, '0')}
        </Typography>
      ),
    },
    {
      id: 'customer' as any,
      label: 'Customer',
      render: (row: Booking) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {row.customer?.fullName || 'Walk-in Guest'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.customer?.email || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'createdAt' as any,
      label: 'Booking Date',
      sortable: true,
      render: (row: Booking) => (
        <Typography variant="body2">
          {dayjs(row.createdAt).format('YYYY-MM-DD HH:mm')}
        </Typography>
      ),
    },
    {
      id: 'visitDate' as any,
      label: 'Visit Date',
      sortable: true,
      render: (row: Booking) => (
        <Typography variant="body2">
          {row.visitDate ? dayjs(row.visitDate).format('YYYY-MM-DD') : dayjs(row.createdAt).format('YYYY-MM-DD')}
        </Typography>
      ),
    },
    {
      id: 'ticketCount' as any,
      label: 'Tickets',
      render: (row: Booking) => {
        const count = row.items?.reduce((sum, item) => sum + item.quantity, 0) || row.tickets?.length || 1;
        return (
          <Typography variant="body2" fontWeight={500}>
            {count}
          </Typography>
        );
      },
    },
    {
      id: 'totalAmount' as any,
      label: 'Total Amount',
      sortable: true,
      render: (row: Booking) => (
        <Typography variant="body2" fontWeight={600} color="primary.main">
          ${row.totalAmount?.toFixed(2) || '0.00'}
        </Typography>
      ),
    },
    {
      id: 'status' as any,
      label: 'Status',
      sortable: true,
      render: (row: Booking) => (
        <StatusChip status={String(row.status)} type="booking" />
      ),
    },
    {
      id: 'actions' as any,
      label: 'Actions',
      render: (row: Booking) => {
        const isPending = row.status === 0 || String(row.status).toUpperCase() === 'PENDING';
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="View Details">
              <IconButton onClick={() => onViewDetails(row)} color="info" size="small">
                <MdVisibility size={18} />
              </IconButton>
            </Tooltip>

            {isPending && (
              <>
                <Tooltip title="Pay via QR Code">
                  <IconButton onClick={() => onPayQR(row)} color="success" size="small">
                    <MdQrCode size={18} />
                  </IconButton>
                </Tooltip>
                <PermissionWrapper requiredPermission="write:bookings">
                  <Tooltip title="Cancel Booking">
                    <IconButton onClick={() => onCancel(row)} color="error" size="small">
                      <MdClose size={18} />
                    </IconButton>
                  </Tooltip>
                </PermissionWrapper>
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      page={page}
      rowsPerPage={rowsPerPage}
      totalElements={totalElements}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
};
