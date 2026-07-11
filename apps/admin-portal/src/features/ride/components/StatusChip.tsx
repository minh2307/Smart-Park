import React from 'react';
import { Chip } from '@mui/material';
import { RideOperatingStatus } from '../types';
import {
  MdPlayArrow,
  MdPause,
  MdBuild,
  MdWarning,
  MdReportProblem,
  MdLock,
} from 'react-icons/md';

interface StatusChipProps {
  status: RideOperatingStatus;
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
  const getConfig = (statusValue: RideOperatingStatus) => {
    switch (statusValue) {
      case 'OPERATING':
        return {
          label: 'Đang vận hành',
          color: 'success' as const,
          icon: <MdPlayArrow />,
        };
      case 'CLOSED':
        return {
          label: 'Đã đóng cửa',
          color: 'default' as const,
          icon: <MdPause />,
        };
      case 'MAINTENANCE':
        return {
          label: 'Đang bảo trì',
          color: 'warning' as const,
          icon: <MdBuild />,
        };
      case 'TEMPORARILY_CLOSED':
        return {
          label: 'Tạm đóng cửa',
          color: 'error' as const,
          icon: <MdWarning />,
          variant: 'outlined' as const,
        };
      case 'EMERGENCY_STOP':
        return {
          label: 'Dừng khẩn cấp',
          color: 'error' as const,
          icon: <MdReportProblem />,
        };
      case 'RESERVED':
        return {
          label: 'Đã đặt chỗ',
          color: 'primary' as const,
          icon: <MdLock />,
        };
      default:
        return {
          label: statusValue,
          color: 'default' as const,
        };
    }
  };

  const { label, color, icon, variant } = getConfig(status);

  return (
    <Chip
      size={size}
      icon={icon}
      label={label}
      color={color}
      variant={variant || 'filled'}
      sx={{
        fontWeight: 'bold',
        fontSize: '0.75rem',
        borderRadius: '6px',
        py: 0.25,
        '& .MuiChip-icon': {
          fontSize: '1rem',
        },
      }}
    />
  );
};
