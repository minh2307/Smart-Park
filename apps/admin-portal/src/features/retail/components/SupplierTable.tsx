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
import { MdEdit, MdDelete } from 'react-icons/md';
import { Supplier } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: number) => void;
}

export const SupplierTable: React.FC<SupplierTableProps> = ({ suppliers, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Mã NCC</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tên Nhà Cung Cấp</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Người Liên Hệ</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Điện Thoại</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Địa Chỉ</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                Không tìm thấy nhà cung cấp nào.
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((sup) => (
              <TableRow key={sup.id} hover>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{sup.supplierCode}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{sup.supplierName}</TableCell>
                <TableCell>{sup.contactName}</TableCell>
                <TableCell>{sup.phone}</TableCell>
                <TableCell>{sup.email}</TableCell>
                <TableCell>{sup.address}</TableCell>
                <TableCell>
                  <StatusChip status={sup.status} />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={0.5}>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" color="default" onClick={() => onEdit(sup)}>
                        <MdEdit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa nhà cung cấp">
                      <IconButton size="small" color="error" onClick={() => onDelete(sup.id)}>
                        <MdDelete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default SupplierTable;
