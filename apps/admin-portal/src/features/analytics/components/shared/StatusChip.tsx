/**
 * StatusChip - Colored status indicator with semantic mapping
 */
import React from 'react';
import { Chip, type ChipProps } from '@mui/material';

type StatusType =
  | 'active' | 'open' | 'online'
  | 'maintenance' | 'investigating' | 'in_progress' | 'scheduled' | 'pending' | 'break'
  | 'closed' | 'offline' | 'error' | 'overdue' | 'critical'
  | 'resolved' | 'completed';

const statusColorMap: Record<StatusType, ChipProps['color']> = {
  active: 'success',
  open: 'info',
  online: 'success',
  maintenance: 'warning',
  investigating: 'warning',
  in_progress: 'info',
  scheduled: 'info',
  pending: 'warning',
  break: 'default',
  closed: 'default',
  offline: 'default',
  error: 'error',
  overdue: 'error',
  critical: 'error',
  resolved: 'success',
  completed: 'success',
};

interface StatusChipProps {
  status: string;
  label?: string;
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, size = 'small' }) => {
  const color = statusColorMap[status as StatusType] || 'default';
  const displayLabel = label || status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Chip
      label={displayLabel}
      size={size}
      color={color}
      variant="filled"
      sx={{
        fontWeight: 700,
        fontSize: size === 'small' ? '0.625rem' : '0.6875rem',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
      }}
    />
  );
};
