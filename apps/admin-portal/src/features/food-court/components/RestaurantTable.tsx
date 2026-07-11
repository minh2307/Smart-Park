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
import { MdEdit, MdDelete, MdRestaurantMenu } from 'react-icons/md';
import { Restaurant } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface RestaurantTableProps {
  restaurants: Restaurant[];
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (id: number) => void;
  onViewMenu: (restaurant: Restaurant) => void;
}

export const RestaurantTable: React.FC<RestaurantTableProps> = ({
  restaurants,
  onEdit,
  onDelete,
  onViewMenu,
}) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Mã Nhà Hàng</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tên Nhà Hàng</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Vị Trí</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Giờ Mở Cửa</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Quản Lý</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Doanh Thu</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {restaurants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                Không tìm thấy nhà hàng ẩm thực nào.
              </TableCell>
            </TableRow>
          ) : (
            restaurants.map((res) => (
              <TableRow key={res.id} hover>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{res.restaurantCode}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{res.restaurantName}</TableCell>
                <TableCell>{res.location}</TableCell>
                <TableCell>{res.businessHours}</TableCell>
                <TableCell>{res.manager}</TableCell>
                <TableCell>{res.revenue.toLocaleString()}đ</TableCell>
                <TableCell>
                  <StatusChip status={res.status} />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={0.5}>
                    <Tooltip title="Xem thực đơn">
                      <IconButton size="small" color="primary" onClick={() => onViewMenu(res)}>
                        <MdRestaurantMenu />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" color="default" onClick={() => onEdit(res)}>
                        <MdEdit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa nhà hàng">
                      <IconButton size="small" color="error" onClick={() => onDelete(res.id)}>
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
export default RestaurantTable;
