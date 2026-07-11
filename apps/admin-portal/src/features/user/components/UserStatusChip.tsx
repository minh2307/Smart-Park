import React from 'react';
import { Chip } from '@mui/material';
import { UserStatus } from '../types';

interface UserStatusChipProps {
  status: UserStatus;
}

export const UserStatusChip: React.FC<UserStatusChipProps> = ({ status }) => {
  const colorMap: Record<UserStatus, 'success' | 'default' | 'error' | 'warning'> = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    LOCKED: 'error',
    SUSPENDED: 'warning',
  };

  const labelMap: Record<UserStatus, string> = {
    ACTIVE: 'Hoạt động',
    INACTIVE: 'Ngưng hoạt động',
    LOCKED: 'Bị khóa',
    SUSPENDED: 'Tạm đình chỉ',
  };

  return (
    <Chip
      label={labelMap[status] || status}
      color={colorMap[status]}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 'bold' }}
    />
  );
};
