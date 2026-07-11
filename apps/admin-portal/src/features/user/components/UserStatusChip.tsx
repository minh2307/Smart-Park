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

  return (
    <Chip
      label={status}
      color={colorMap[status]}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 'bold' }}
    />
  );
};
