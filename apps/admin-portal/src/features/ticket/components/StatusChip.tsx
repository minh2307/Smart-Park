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
        label = 'Nháp';
        icon = <MdHourglassEmpty size={14} />;
        break;
      case 'AVAILABLE':
        color = 'success';
        label = 'Sẵn sàng';
        icon = <MdCheckCircle size={14} />;
        break;
      case 'RESERVED':
        color = 'warning';
        label = 'Đã giữ chỗ';
        icon = <MdHourglassEmpty size={14} />;
        break;
      case 'SOLD':
        color = 'primary';
        label = 'Đã bán';
        icon = <MdPayment size={14} />;
        break;
      case 'ACTIVATED':
        color = 'info';
        label = 'Đã kích hoạt';
        icon = <MdCheckCircle size={14} />;
        break;
      case 'USED':
        color = 'secondary';
        label = 'Đã sử dụng';
        icon = <MdHistory size={14} />;
        break;
      case 'PARTIALLY_USED':
        color = 'warning';
        label = 'Sử dụng một phần';
        icon = <MdHistory size={14} />;
        break;
      case 'EXPIRED':
        color = 'error';
        label = 'Hết hạn';
        icon = <MdOutlineRemoveCircle size={14} />;
        break;
      case 'CANCELLED':
        color = 'error';
        label = 'Đã hủy';
        icon = <MdClose size={14} />;
        break;
      case 'REFUNDED':
        color = 'default';
        label = 'Đã hoàn tiền';
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
        label = 'Chờ thanh toán';
        icon = <MdHourglassEmpty size={14} />;
        break;
      case 'CONFIRMED':
        color = 'info';
        label = 'Đã xác nhận';
        icon = <MdCheckCircle size={14} />;
        break;
      case 'PAID':
      case '1':
        color = 'success';
        label = 'Đã thanh toán';
        icon = <MdCheckCircle size={14} />;
        break;
      case 'CANCELLED':
      case '2':
        color = 'error';
        label = 'Đã hủy';
        icon = <MdClose size={14} />;
        break;
      case 'EXPIRED':
        color = 'error';
        label = 'Hết hạn';
        icon = <MdOutlineRemoveCircle size={14} />;
        break;
      case 'REFUNDED':
        color = 'secondary';
        label = 'Đã hoàn tiền';
        icon = <MdOutlineRemoveCircle size={14} />;
        break;
      case 'COMPLETED':
        color = 'primary';
        label = 'Hoàn thành';
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
