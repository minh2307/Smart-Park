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
  Typography,
} from '@mui/material';
import { MdEdit, MdDelete } from 'react-icons/md';
import { MenuItem } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface MenuTableProps {
  menuItems: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
}

export const MenuTable: React.FC<MenuTableProps> = ({ menuItems, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Món Ăn</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Phân Loại</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Giá Gốc</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Chiết Khấu</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Giá Thực Tế</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Thời Gian Chế Biến</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Lượng Calo</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {menuItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                Không có món ăn nào trong thực đơn này.
              </TableCell>
            </TableRow>
          ) : (
            menuItems.map((item) => {
              const discountedPrice = item.price - (item.price * item.discount) / 100;
              return (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      {item.image && (
                        <Box
                          component="img"
                          src={item.image}
                          alt={item.itemName}
                          sx={{ width: 48, height: 48, borderRadius: 2, objectFit: 'cover' }}
                        />
                      )}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.itemName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell sx={{ textDecoration: item.discount > 0 ? 'line-through' : 'none', color: item.discount > 0 ? 'text.secondary' : 'text.primary' }}>
                    {item.price.toLocaleString()}đ
                  </TableCell>
                  <TableCell>{item.discount > 0 ? `${item.discount}%` : '—'}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {discountedPrice.toLocaleString()}đ
                  </TableCell>
                  <TableCell>{item.preparationTime} phút</TableCell>
                  <TableCell>{item.calories} Kcal</TableCell>
                  <TableCell>
                    <StatusChip status={item.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={0.5}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton size="small" color="default" onClick={() => onEdit(item)}>
                          <MdEdit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa món">
                        <IconButton size="small" color="error" onClick={() => onDelete(item.id)}>
                          <MdDelete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default MenuTable;
