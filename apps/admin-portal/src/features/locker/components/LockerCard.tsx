import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import { Locker } from '../types';
import { MdLockOpen, MdLock, MdBuild } from 'react-icons/md';

interface LockerCardProps {
  locker: Locker;
  onRent: (locker: Locker) => void;
  onReturn: (locker: Locker) => void;
  onStatusChange: (locker: Locker, newStatus: any) => void;
}

export const LockerCard: React.FC<LockerCardProps> = ({
  locker,
  onRent,
  onReturn,
  onStatusChange,
}) => {
  const getStatusColor = (status: Locker['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'OCCUPIED':
        return 'error';
      case 'RESERVED':
        return 'warning';
      case 'MAINTENANCE':
      case 'OUT_OF_SERVICE':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getStatusLabel = (status: Locker['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Sẵn sàng';
      case 'OCCUPIED':
        return 'Đang thuê';
      case 'RESERVED':
        return 'Đặt trước';
      case 'MAINTENANCE':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderWidth: locker.status === 'OCCUPIED' ? 2 : 1,
        borderColor: locker.status === 'OCCUPIED' ? 'error.main' : 'divider',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="h6" fontWeight="bold" fontFamily="monospace">
            {locker.lockerCode}
          </Typography>
          <Chip label={locker.size} size="small" variant="outlined" color="primary" sx={{ fontWeight: 'bold' }} />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Vị trí: {locker.location || 'N/A'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Khu vực: {locker.zoneName}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Chip
            label={getStatusLabel(locker.status)}
            color={getStatusColor(locker.status) as any}
            size="small"
            icon={locker.status === 'AVAILABLE' ? <MdLockOpen /> : locker.status === 'OCCUPIED' ? <MdLock /> : <MdBuild />}
          />
        </Box>

        <Box display="flex" gap={1}>
          {locker.status === 'AVAILABLE' && (
            <Button variant="contained" color="primary" fullWidth size="small" onClick={() => onRent(locker)}>
              Cho Thuê
            </Button>
          )}

          {locker.status === 'OCCUPIED' && (
            <Button variant="outlined" color="error" fullWidth size="small" onClick={() => onReturn(locker)}>
              Trả Tủ
            </Button>
          )}

          {locker.status === 'AVAILABLE' && (
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              size="small"
              onClick={() => onStatusChange(locker, 'MAINTENANCE')}
            >
              Bảo Trì
            </Button>
          )}

          {locker.status === 'MAINTENANCE' && (
            <Button
              variant="outlined"
              color="success"
              fullWidth
              size="small"
              onClick={() => onStatusChange(locker, 'AVAILABLE')}
            >
              Hoàn Thành
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
export default LockerCard;
