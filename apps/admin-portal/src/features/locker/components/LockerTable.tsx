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
import { MdLockOpen, MdLock, MdBuild } from 'react-icons/md';
import { Locker } from '../types';
import { StatusChip } from '../../../shared/components/StatusChip';

interface LockerTableProps {
  lockers: Locker[];
  onRent: (locker: Locker) => void;
  onReturn: (locker: Locker) => void;
  onStatusChange: (locker: Locker, newStatus: any) => void;
}

export const LockerTable: React.FC<LockerTableProps> = ({
  lockers,
  onRent,
  onReturn,
  onStatusChange,
}) => {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Mã Tủ Đồ</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Kích Thước</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Vị Trí Chi Tiết</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Khu Vực (Zone)</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Trạng Thái</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Thao Tác</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lockers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                Không tìm thấy tủ đồ nào khớp điều kiện.
              </TableCell>
            </TableRow>
          ) : (
            lockers.map((locker) => (
              <TableRow key={locker.id} hover>
                <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{locker.lockerCode}</TableCell>
                <TableCell>{locker.size}</TableCell>
                <TableCell>{locker.location || 'N/A'}</TableCell>
                <TableCell>{locker.zoneName}</TableCell>
                <TableCell>
                  <StatusChip status={locker.status} />
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" justifyContent="flex-end" gap={0.5}>
                    {locker.status === 'AVAILABLE' && (
                      <Tooltip title="Cho thuê">
                        <IconButton size="small" color="primary" onClick={() => onRent(locker)}>
                          <MdLockOpen />
                        </IconButton>
                      </Tooltip>
                    )}
                    {locker.status === 'OCCUPIED' && (
                      <Tooltip title="Trả tủ đồ">
                        <IconButton size="small" color="error" onClick={() => onReturn(locker)}>
                          <MdLock />
                        </IconButton>
                      </Tooltip>
                    )}
                    {locker.status === 'AVAILABLE' && (
                      <Tooltip title="Bảo trì">
                        <IconButton size="small" color="default" onClick={() => onStatusChange(locker, 'MAINTENANCE')}>
                          <MdBuild />
                        </IconButton>
                      </Tooltip>
                    )}
                    {locker.status === 'MAINTENANCE' && (
                      <Tooltip title="Mở khóa hoạt động">
                        <IconButton size="small" color="success" onClick={() => onStatusChange(locker, 'AVAILABLE')}>
                          <MdLockOpen />
                        </IconButton>
                      </Tooltip>
                    )}
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
export default LockerTable;
