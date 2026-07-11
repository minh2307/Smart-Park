import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Avatar,
  Box,
  Typography,
  Chip,
  TablePagination,
  Skeleton,
} from '@mui/material';
import { MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import { Customer } from '../types';
import { MembershipBadge } from './MembershipBadge';
import { formatCurrency } from '../../analytics/utils/numberFormatters';

interface CustomerTableProps {
  data: Customer[];
  loading: boolean;
  page: number;
  rowsPerPage: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newSize: number) => void;
  onViewDetails: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  data,
  loading,
  page,
  rowsPerPage,
  totalElements,
  onPageChange,
  onRowsPerPageChange,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  // Get initials for Avatar if no image
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderStatus = (status: string) => {
    const isSuspended = status === 'SUSPENDED';
    return (
      <Chip
        label={status === 'ACTIVE' ? 'HOẠT ĐỘNG' : status === 'SUSPENDED' ? 'TẠM KHÓA' : status}
        size="small"
        color={isSuspended ? 'error' : 'success'}
        variant="outlined"
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Mã / Tên khách hàng</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Thông tin liên hệ</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Hạng thành viên</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Lượt mua</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tổng chi tiêu</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box>
                        <Skeleton width={120} height={20} />
                        <Skeleton width={80} height={16} />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Skeleton width={150} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell align="right"><Skeleton width={80} height={36} /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    Không tìm thấy khách hàng nào khớp với bộ lọc.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          fontWeight: 'bold',
                        }}
                      >
                        {getInitials(row.fullName)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {row.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          CUST-{String(row.id).padStart(4, '0')}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <MembershipBadge tier={row.membership?.tier} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.stats?.totalOrders || 0} đơn hàng
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.stats?.totalTickets || 0} vé
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {formatCurrency(row.stats?.totalSpending || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>{renderStatus(row.status)}</TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={0.5}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onViewDetails(row)}
                      >
                        <MdVisibility size={20} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => onEdit(row)}
                      >
                        <MdEdit size={20} />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(row)}
                      >
                        <MdDelete size={20} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalElements}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};
