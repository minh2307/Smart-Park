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
import { Category } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({ categories, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Tên Danh Mục</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Mô Tả</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Thứ Tự Sắp Xếp</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                Không tìm thấy danh mục sản phẩm nào.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((cat) => (
              <TableRow key={cat.id} hover>
                <TableCell sx={{ fontWeight: 'bold' }}>{cat.categoryName}</TableCell>
                <TableCell>{cat.description || '—'}</TableCell>
                <TableCell>{cat.sortOrder}</TableCell>
                <TableCell>
                  <StatusChip status={cat.status} />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={0.5}>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" color="default" onClick={() => onEdit(cat)}>
                        <MdEdit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa danh mục">
                      <IconButton size="small" color="error" onClick={() => onDelete(cat.id)}>
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
export default CategoryTable;
