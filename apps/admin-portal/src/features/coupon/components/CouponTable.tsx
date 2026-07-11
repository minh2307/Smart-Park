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
import { MdEdit, MdDelete, MdPersonAdd, MdFileDownload } from 'react-icons/md';
import { Coupon } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

interface CouponTableProps {
  coupons: Coupon[];
  onEdit: (c: Coupon) => void;
  onDelete: (c: Coupon) => void;
  onAssign: (c: Coupon) => void;
  onExport: (c: Coupon) => void;
}

export const CouponTable: React.FC<CouponTableProps> = ({
  coupons,
  onEdit,
  onDelete,
  onAssign,
  onExport,
}) => {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Ma Coupon</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Ten Coupon</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Chien dich</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Giam gia</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Gioi han su dung</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Thoi han</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Khach hang da gan</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trang thai</TableCell>
            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Hanh dong</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {coupons.map((c) => (
            <TableRow key={c.id} hover>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{c.code}</TableCell>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.campaignName}</TableCell>
              <TableCell>
                {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `$${c.discountValue}`}
              </TableCell>
              <TableCell>
                {c.usedQuantity} / {c.quantity} (Con {c.remainingQuantity})
              </TableCell>
              <TableCell>{c.expirationDate}</TableCell>
              <TableCell>
                {c.assignedCustomers.length > 0 ? `${c.assignedCustomers.length} khach hang` : 'Chua gan'}
              </TableCell>
              <TableCell>
                <StatusChip status={c.status} />
              </TableCell>
              <TableCell align="right">
                <Box display="flex" justifyContent="flex-end" gap={0.5}>
                  <Tooltip title="Gan cho khach hang">
                    <IconButton onClick={() => onAssign(c)} color="info" size="small">
                      <MdPersonAdd />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xuat CSV">
                    <IconButton onClick={() => onExport(c)} color="default" size="small">
                      <MdFileDownload />
                    </IconButton>
                  </Tooltip>
                  <PermissionWrapper requiredPermission="write:promotions">
                    <Tooltip title="Chinh sua">
                      <IconButton onClick={() => onEdit(c)} color="primary" size="small">
                        <MdEdit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xoa">
                      <IconButton onClick={() => onDelete(c)} color="error" size="small">
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
export default CouponTable;
