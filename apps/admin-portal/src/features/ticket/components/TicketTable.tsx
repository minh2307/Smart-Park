import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { MdVisibility, MdCheckCircle, MdEdit } from 'react-icons/md';
import { DataTable } from '../../../components/common/DataTable';
import { Ticket } from '../types';
import { StatusChip } from './StatusChip';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';
import dayjs from 'dayjs';

interface TicketTableProps {
  data: Ticket[];
  loading?: boolean;
  page: number;
  rowsPerPage: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onViewDetails: (ticket: Ticket) => void;
  onValidate: (ticket: Ticket) => void;
  onEditStatus: (ticket: Ticket) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  data,
  loading = false,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  onViewDetails,
  onValidate,
  onEditStatus,
}) => {
  const columns = [
    {
      id: 'ticketCode' as any,
      label: 'Ticket Number',
      sortable: true,
      render: (row: Ticket) => (
        <Typography variant="body2" fontWeight={600} fontFamily="monospace">
          {row.ticketCode}
        </Typography>
      ),
    },
    {
      id: 'ticketType' as any,
      label: 'Ticket Type',
      render: (row: Ticket) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {row.ticketType?.name || 'Standard Admission'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ${row.ticketType?.price?.toFixed(2) || '0.00'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'venue' as any,
      label: 'Venue',
      render: (row: Ticket) => (
        <Typography variant="body2">
          {row.venue?.name || 'All Parks'}
        </Typography>
      ),
    },
    {
      id: 'customer' as any,
      label: 'Visitor',
      render: (row: Ticket) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {row.customer?.fullName || 'Walk-in Customer'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.customer?.email || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status' as any,
      label: 'Status',
      sortable: true,
      render: (row: Ticket) => <StatusChip status={row.status} type="ticket" />,
    },
    {
      id: 'createdAt' as any,
      label: 'Issue Date',
      sortable: true,
      render: (row: Ticket) => (
        <Typography variant="body2">
          {dayjs(row.createdAt).format('YYYY-MM-DD HH:mm')}
        </Typography>
      ),
    },
    {
      id: 'validDate' as any,
      label: 'Expiration',
      sortable: true,
      render: (row: Ticket) => {
        const isExpired = dayjs(row.validDate).isBefore(dayjs(), 'day') && row.status !== 'USED';
        return (
          <Typography
            variant="body2"
            color={isExpired ? 'error.main' : 'text.primary'}
            fontWeight={isExpired ? 600 : 400}
          >
            {dayjs(row.validDate).format('YYYY-MM-DD')}
          </Typography>
        );
      },
    },
    {
      id: 'usage' as any,
      label: 'Usage (Rem / Max)',
      render: (row: Ticket) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" fontWeight={600}>
            {row.remainingUses}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            /
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.maxUses}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'actions' as any,
      label: 'Actions',
      render: (row: Ticket) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="View Details">
            <IconButton onClick={() => onViewDetails(row)} color="info" size="small">
              <MdVisibility size={18} />
            </IconButton>
          </Tooltip>

          <PermissionWrapper requiredPermission="validate:tickets">
            <Tooltip title="Validate / Scan Ticket">
              <IconButton
                onClick={() => onValidate(row)}
                color="success"
                size="small"
                disabled={row.status === 'USED' || row.status === 'EXPIRED' || row.status === 'CANCELLED'}
              >
                <MdCheckCircle size={18} />
              </IconButton>
            </Tooltip>
          </PermissionWrapper>

          <PermissionWrapper requiredPermission="write:tickets">
            <Tooltip title="Edit Status">
              <IconButton onClick={() => onEditStatus(row)} color="primary" size="small">
                <MdEdit size={18} />
              </IconButton>
            </Tooltip>
          </PermissionWrapper>
        </Box>
      ),
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
