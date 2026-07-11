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
  Typography,
  Chip,
  Box,
  Skeleton,
} from '@mui/material';
import { MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import { RideCategory } from '../types';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

interface RideCategoryTableProps {
  data: RideCategory[];
  loading: boolean;
  onViewDetails: (cat: RideCategory) => void;
  onEdit: (cat: RideCategory) => void;
  onDelete: (cat: RideCategory) => void;
}

export const RideCategoryTable: React.FC<RideCategoryTableProps> = ({
  data,
  loading,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã / Tên danh mục</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Số lượng trò chơi</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton width={120} /><Skeleton width={80} variant="text" /></TableCell>
                <TableCell><Skeleton width={200} /></TableCell>
                <TableCell><Skeleton width={40} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell align="right"><Skeleton width={80} style={{ marginLeft: 'auto' }} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (data.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Không tìm thấy danh mục trò chơi nào phù hợp với bộ lọc tìm kiếm.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Mã / Tên danh mục</TableCell>
            <TableCell>Mô tả</TableCell>
            <TableCell>Số lượng trò chơi</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell align="right">Thao tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((cat) => (
            <TableRow key={cat.id} hover>
              <TableCell>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {cat.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    {cat.code}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ maxWidth: 300 }}>
                <Typography variant="body2" noWrap color="text.secondary" title={cat.description}>
                  {cat.description || '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={`${cat.rideCount} trò chơi`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 'medium' }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={cat.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng hoạt động'}
                  size="small"
                  color={cat.status === 'ACTIVE' ? 'success' : 'default'}
                  sx={{ fontWeight: 'bold', borderRadius: '6px' }}
                />
              </TableCell>
              <TableCell align="right">
                <Box display="flex" justifyContent="flex-end" gap={0.5}>
                  <IconButton size="small" onClick={() => onViewDetails(cat)} color="primary">
                    <MdVisibility size={18} />
                  </IconButton>
                  <PermissionWrapper requiredPermission="write:rides">
                    <IconButton size="small" onClick={() => onEdit(cat)} color="info">
                      <MdEdit size={18} />
                    </IconButton>
                  </PermissionWrapper>
                  <PermissionWrapper requiredPermission="write:rides">
                    <IconButton size="small" onClick={() => onDelete(cat)} color="error">
                      <MdDelete size={18} />
                    </IconButton>
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
