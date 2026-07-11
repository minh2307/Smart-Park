import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, ...props }) => {
  const getStatusConfig = (val: string): { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' } => {
    const norm = val.toUpperCase();
    if (['ACTIVE', 'COMPLETED', 'PAID', 'APPROVED', 'SUCCESS', 'OPEN', 'ONLINE'].includes(norm)) {
      return { label: val, color: 'success' };
    }
    if (['PENDING', 'SUSPENDED', 'WARNING', 'EARNING', 'BUSY', 'MAINTENANCE'].includes(norm)) {
      return { label: val, color: 'warning' };
    }
    if (['EXPIRED', 'CANCELLED', 'FAILED', 'REDEEMED', 'DEDUCT', 'CLOSED', 'OFFLINE', 'EMERGENCY', 'DISABLED', 'ERROR'].includes(norm)) {
      return { label: val, color: 'error' };
    }
    if (['REFUNDED', 'RENEWAL', 'ADJUSTMENT', 'ADD', 'INFO'].includes(norm)) {
      return { label: val, color: 'info' };
    }
    return { label: val, color: 'default' };
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{
        fontWeight: 'bold',
        borderRadius: '6px',
        px: 0.5,
        ...props.sx,
      }}
      {...props}
    />
  );
};
