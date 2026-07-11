import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
  MdHourglassEmpty,
  MdCheckCircle,
  MdClose,
  MdPayment,
  MdInfo,
  MdHistory,
  MdOutlineRemoveCircle,
} from 'react-icons/md';

interface StatusChipProps {
  status: string;
  type?: 'ticket' | 'booking';
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  type = 'ticket',
  size = 'small',
}) => {
  const norm = status?.toUpperCase() || '';

  let color: ChipProps['color'] = 'default';
  let label = status;
  let icon = <MdInfo size={16} />;

  if (type === 'ticket') {
    switch (norm) {
      case 'DRAFT':
        color = 'default';
        label = 'Draft';
        icon = <MdHourglassEmpty size={14} />;
        break;
      case 'AVAILABLE':
        color = 'success';
        label = 'Available';
        icon = <MdCheckCircle size={14} />;
        break;
      case 'RESERVED':
        color = 'warning';
        label = 'Reserved';
        icon = <MdHourglassEmpty size={14} />;
        break;
      case 'SOLD':
        color = 'primary';
        label = 'Sold';
        icon = <MdPayment size={14} />;
        break;
      case 'ACTIVATED':
        color = 'info';
        label = 'Activated';
        icon = <MdCheckCircle size={14} />;
        break;
      case 'USED':
        color = 'secondary';
        label = 'Used';
        icon = <MdHistory size={14} />;
        break;
      case 'PARTIALLY_USED':
        color = 'warning';
        label = 'Partially Used';
        icon = <MdHistory size={14} />;
        break;
      case 'EXPIRED':
        color = 'error';
        label = 'Expired';
        icon = <MdOutlineRemoveCircle size={14} />;
        break;
      case 'CANCELLED':
        color = 'error';
        label = 'Cancelled';
        icon = <MdClose size={14} />;
        break;
      case 'REFUNDED':
        color = 'default';
        label = 'Refunded';
        icon = <MdOutlineRemoveCircle size={14} />;
        break;
      default:
        color = 'default';
        label = status;
        break;
    }
  } else {
    // booking/order
    switch (norm) {
      case 'PENDING':
      case '0':
        color = 'warning';
        label = 'Pending';
        icon = <MdHourglassEmpty size={14} />;
        break;
      case 'CONFIRMED':
        color = 'info';
        label = 'Confirmed';
        icon = <MdCheckCircle size={14} />;
        break;
      case 'PAID':
      case '1':
        color = 'success';
        label = 'Paid';
        icon = <MdCheckCircle size={14} />;
        break;
      case 'CANCELLED':
      case '2':
        color = 'error';
        label = 'Cancelled';
        icon = <MdClose size={14} />;
        break;
      case 'EXPIRED':
        color = 'error';
        label = 'Expired';
        icon = <MdOutlineRemoveCircle size={14} />;
        break;
      case 'REFUNDED':
        color = 'secondary';
        label = 'Refunded';
        icon = <MdOutlineRemoveCircle size={14} />;
        break;
      case 'COMPLETED':
        color = 'primary';
        label = 'Completed';
        icon = <MdCheckCircle size={14} />;
        break;
      default:
        color = 'default';
        label = status;
        break;
    }
  }

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size={size}
      variant="outlined"
      sx={{
        fontWeight: 600,
        borderRadius: '8px',
        px: 0.5,
        backgroundColor: (theme) => {
          if (color === 'default') return 'rgba(0, 0, 0, 0.04)';
          const mainColor = (theme.palette[color] as any)?.main || '#ccc';
          return `${mainColor}0A`; // 4% opacity background
        },
      }}
    />
  );
};
