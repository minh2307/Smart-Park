import React from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { MdVisibility, MdCheckCircle, MdEdit } from 'react-icons/md';
import { DataTable } from '../../../components/common/DataTable';
import { Ticket } from '../types';
import { StatusChip } from './StatusChip';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';
import dayjs from 'dayjs';
import { formatCurrency } from '../../analytics/utils/numberFormatters';

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
      label: 'Số vé',
      sortable: true,
      render: (row: Ticket) => (
        <Typography variant="body2" fontWeight={600} fontFamily="monospace">
          {row.ticketCode}
        </Typography>
      ),
    },
    {
      id: 'ticketType' as any,
      label: 'Loại vé',
      render: (row: Ticket) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {row.ticketType?.name || 'Vé vào cổng thường'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatCurrency((row.ticketType?.price || 0) * 25000)}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'venue' as any,
      label: 'Địa điểm',
      render: (row: Ticket) => (
        <Typography variant="body2">
          {row.venue?.name || 'Tất cả các khu'}
        </Typography>
      ),
    },
    {
      id: 'customer' as any,
      label: 'Khách tham quan',
      render: (row: Ticket) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {row.customer?.fullName || 'Khách vãng lai'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.customer?.email || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status' as any,
      label: 'Trạng thái',
      sortable: true,
      render: (row: Ticket) => <StatusChip status={row.status} type="ticket" />,
    },
    {
      id: 'createdAt' as any,
      label: 'Ngày xuất vé',
      sortable: true,
      render: (row: Ticket) => (
        <Typography variant="body2">
          {dayjs(row.createdAt).format('YYYY-MM-DD HH:mm')}
        </Typography>
      ),
    },
    {
      id: 'validDate' as any,
      label: 'Ngày hết hạn',
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
      label: 'Sử dụng (Còn lại / Tối đa)',
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
      label: 'Hành động',
      render: (row: Ticket) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="Xem chi tiết">
            <IconButton onClick={() => onViewDetails(row)} color="info" size="small">
              <MdVisibility size={18} />
            </IconButton>
          </Tooltip>

          <PermissionWrapper requiredPermission="validate:tickets">
            <Tooltip title="Kiểm tra / Quét vé">
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
            <Tooltip title="Chỉnh sửa trạng thái">
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
