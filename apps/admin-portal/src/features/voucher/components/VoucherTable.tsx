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
  Tooltip,
  Box,
} from '@mui/material';
import { MdEdit, MdDelete, MdCheckCircle, MdVisibility } from 'react-icons/md';
import { Voucher } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

interface VoucherTableProps {
  vouchers: Voucher[];
  onView: (v: Voucher) => void;
  onEdit: (v: Voucher) => void;
  onDelete: (v: Voucher) => void;
  onRedeem?: (v: Voucher) => void;
}

export const VoucherTable: React.FC<VoucherTableProps> = ({
  vouchers,
  onView,
  onEdit,
  onDelete,
  onRedeem,
}) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Ma Voucher</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Loai Voucher</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Menh gia</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Khach hang</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Ngay phat hanh</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Thoi han</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Ngay su dung</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trang thai</TableCell>
            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Hanh dong</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vouchers.map((v) => (
            <TableRow key={v.id} hover>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{v.code}</TableCell>
              <TableCell>{v.voucherType}</TableCell>
              <TableCell>${v.voucherValue.toLocaleString()}</TableCell>
              <TableCell>{v.assignedCustomer || 'Chua gan'}</TableCell>
              <TableCell>{v.issueDate}</TableCell>
              <TableCell>{v.expirationDate}</TableCell>
              <TableCell>{v.redeemedDate ? new Date(v.redeemedDate).toLocaleDateString() : '-'}</TableCell>
              <TableCell>
                <StatusChip status={v.status} />
              </TableCell>
              <TableCell align="right">
                <Box display="flex" justifyContent="flex-end" gap={0.5}>
                  <Tooltip title="Xem chi tiet">
                    <IconButton onClick={() => onView(v)} color="info" size="small">
                      <MdVisibility />
                    </IconButton>
                  </Tooltip>
                  {v.status === 'UNREDEEMED' && onRedeem && (
                    <Tooltip title="Su dung (Redeem)">
                      <IconButton onClick={() => onRedeem(v)} color="success" size="small">
                        <MdCheckCircle />
                      </IconButton>
                    </Tooltip>
                  )}
                  <PermissionWrapper requiredPermission="write:promotions">
                    <Tooltip title="Chinh sua">
                      <IconButton onClick={() => onEdit(v)} color="primary" size="small">
                        <MdEdit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xoa">
                      <IconButton onClick={() => onDelete(v)} color="error" size="small">
                        <MdDelete />
                      </IconButton>
                    </Tooltip>
                  </PermissionWrapper>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default VoucherTable;
