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
  LinearProgress,
  Box,
  Typography,
} from '@mui/material';
import { MdVisibility, MdEdit, MdDelete } from 'react-icons/md';
import { ParkingArea } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

interface ParkingTableProps {
  areas: ParkingArea[];
  onView: (area: ParkingArea) => void;
  onEdit: (area: ParkingArea) => void;
  onDelete: (area: ParkingArea) => void;
}

export const ParkingTable: React.FC<ParkingTableProps> = ({ areas, onView, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Mã Bãi Xe</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Tên Bãi Xe</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Công Viên (Venue)</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Công Suất Sử Dụng</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Giờ Hoạt Động</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {areas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                Không tìm thấy dữ liệu bãi xe nào.
              </TableCell>
            </TableRow>
          ) : (
            areas.map((area) => {
              const occupancyRate = area.totalSpaces > 0 ? (area.occupiedSpaces / area.totalSpaces) * 100 : 0;
              return (
                <TableRow key={area.id} hover>
                  <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{area.code}</TableCell>
                  <TableCell>{area.name}</TableCell>
                  <TableCell>{area.parkName || 'N/A'}</TableCell>
                  <TableCell>
                    <Box sx={{ width: '100%', minWidth: 120 }}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          {area.occupiedSpaces}/{area.totalSpaces} Ô đỗ
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {occupancyRate.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={occupancyRate}
                        color={occupancyRate > 90 ? 'error' : occupancyRate > 70 ? 'warning' : 'success'}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{area.operatingHours}</TableCell>
                  <TableCell>
                    <StatusChip status={area.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={0.5}>
                      <Tooltip title="Chi tiết">
                        <IconButton size="small" onClick={() => onView(area)}>
                          <MdVisibility />
                        </IconButton>
                      </Tooltip>
                      <PermissionWrapper requiredPermission="write:venues">
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" color="primary" onClick={() => onEdit(area)}>
                            <MdEdit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => onDelete(area)}>
                            <MdDelete />
                          </IconButton>
                        </Tooltip>
                      </PermissionWrapper>
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
export default ParkingTable;
