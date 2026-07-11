import React from 'react';
import { Box, IconButton, Chip } from '@mui/material';
import { MdEdit, MdDelete, MdVisibility } from 'react-icons/md';
import { DataTable } from '../../../components/common/DataTable';
import { Venue } from '../types';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';
import { useNavigate } from 'react-router-dom';

interface VenueTableProps {
  data: Venue[];
  loading?: boolean;
  page: number;
  rowsPerPage: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onSearchChange: (search: string) => void;
  onEdit: (venue: Venue) => void;
  onDelete: (venue: Venue) => void;
}

export const VenueTable: React.FC<VenueTableProps> = ({
  data,
  loading = false,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  onSearchChange,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      id: 'venueCode' as any,
      label: 'Mã địa điểm',
      sortable: true,
      render: (row: Venue) => <Chip label={row.venueCode} size="small" sx={{ fontWeight: 'bold' }} />,
    },
    {
      id: 'name' as any,
      label: 'Tên địa điểm',
      sortable: true,
    },
    {
      id: 'address' as any,
      label: 'Địa chỉ',
    },
    {
      id: 'city' as any,
      label: 'Thành phố',
      sortable: true,
    },
    {
      id: 'country' as any,
      label: 'Quốc gia',
      sortable: true,
    },
    {
      id: 'manager' as any,
      label: 'Quản lý',
    },
    {
      id: 'status' as any,
      label: 'Trạng thái',
      sortable: true,
      render: (row: Venue) => {
        const statusStr = typeof row.status === 'number' ? (row.status === 1 ? 'ACTIVE' : 'INACTIVE') : row.status;
        const statusMap: Record<string, string> = {
          ACTIVE: 'Hoạt động',
          INACTIVE: 'Ngưng hoạt động',
          UNDER_MAINTENANCE: 'Đang bảo trì',
          CLOSED: 'Đã đóng cửa',
        };
        const colorMap: Record<string, 'success' | 'default' | 'warning' | 'error'> = {
          ACTIVE: 'success',
          INACTIVE: 'default',
          UNDER_MAINTENANCE: 'warning',
          CLOSED: 'error',
        };
        return <Chip label={statusMap[statusStr] || statusStr} color={colorMap[statusStr] || 'default'} size="small" variant="outlined" />;
      },
    },
    {
      id: 'openingHours' as any,
      label: 'Giờ mở cửa',
      render: (row: Venue) => `${row.openingTime || '08:00'} - ${row.closingTime || '22:00'}`,
    },
    {
      id: 'actions' as any,
      label: 'Thao tác',
      render: (row: Venue) => (
        <Box display="flex" gap={1}>
          <IconButton onClick={() => navigate(`/admin/venues/${row.id}`)} color="info" size="small" title="Xem chi tiết">
            <MdVisibility size={18} />
          </IconButton>
          <PermissionWrapper requiredPermission="write:venues">
            <IconButton onClick={() => onEdit(row)} color="primary" size="small" title="Chỉnh sửa địa điểm">
              <MdEdit size={18} />
            </IconButton>
          </PermissionWrapper>
          <PermissionWrapper requiredPermission="delete:venues">
            <IconButton onClick={() => onDelete(row)} color="error" size="small" title="Xóa địa điểm">
              <MdDelete size={18} />
            </IconButton>
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
      onSearchChange={onSearchChange}
    />
  );
};
