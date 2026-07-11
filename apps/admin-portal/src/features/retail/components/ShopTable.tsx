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
import { Shop } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface ShopTableProps {
  shops: Shop[];
  onEdit: (shop: Shop) => void;
  onDelete: (id: number) => void;
}

export const ShopTable: React.FC<ShopTableProps> = ({ shops, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Mã Cửa Hàng</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tên Cửa Hàng</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Vị Trí</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Giờ Hoạt Động</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Người Quản Lý</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Phân Loại</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Doanh Thu lũy kế</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shops.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                Không tìm thấy cửa hàng bán lẻ nào.
              </TableCell>
            </TableRow>
          ) : (
            shops.map((shop) => (
              <TableRow key={shop.id} hover>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{shop.shopCode}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{shop.shopName}</TableCell>
                <TableCell>{shop.location}</TableCell>
                <TableCell>{shop.businessHours}</TableCell>
                <TableCell>{shop.manager}</TableCell>
                <TableCell>{shop.category}</TableCell>
                <TableCell>{shop.revenue.toLocaleString()}đ</TableCell>
                <TableCell>
                  <StatusChip status={shop.status} />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={0.5}>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" color="default" onClick={() => onEdit(shop)}>
                        <MdEdit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa cửa hàng">
                      <IconButton size="small" color="error" onClick={() => onDelete(shop.id)}>
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
export default ShopTable;
