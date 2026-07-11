import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, ...props }) => {
  const getStatusConfig = (val: string): { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' } => {
    const norm = val.toUpperCase();
    
    // Label translation map
    const translations: Record<string, string> = {
      'ACTIVE': 'Hoạt động',
      'COMPLETED': 'Hoàn thành',
      'PAID': 'Đã thanh toán',
      'APPROVED': 'Đã duyệt',
      'SUCCESS': 'Thành công',
      'OPEN': 'Mở',
      'ONLINE': 'Trực tuyến',
      'AVAILABLE': 'Sẵn sàng',
      'UNUSED': 'Chưa sử dụng',
      
      'PENDING': 'Chờ xử lý',
      'SUSPENDED': 'Tạm dừng',
      'WARNING': 'Cảnh báo',
      'EARNING': 'Đang thu',
      'BUSY': 'Đang bận',
      'MAINTENANCE': 'Bảo trì',
      'RESERVED': 'Đặt trước',
      
      'EXPIRED': 'Hết hạn',
      'CANCELLED': 'Đã hủy',
      'FAILED': 'Thất bại',
      'REDEEMED': 'Đã quy đổi',
      'DEDUCT': 'Khấu trừ',
      'CLOSED': 'Đóng',
      'OFFLINE': 'Ngoại tuyến',
      'EMERGENCY': 'Khẩn cấp',
      'DISABLED': 'Vô hiệu hóa',
      'ERROR': 'Lỗi',
      'INACTIVE': 'Ngừng hoạt động',
      'UNAVAILABLE': 'Không phục vụ',
      'OUT_OF_STOCK': 'Hết hàng',
      'OCCUPIED': 'Đang thuê',
      
      'REFUNDED': 'Đã hoàn tiền',
      'RENEWAL': 'Gia hạn',
      'ADJUSTMENT': 'Điều chỉnh',
      'ADD': 'Thêm',
      'INFO': 'Thông tin',
      'USED': 'Đã sử dụng',
    };

    const label = translations[norm] || val;

    if (['ACTIVE', 'COMPLETED', 'PAID', 'APPROVED', 'SUCCESS', 'OPEN', 'ONLINE', 'AVAILABLE', 'UNUSED'].includes(norm)) {
      return { label, color: 'success' };
    }
    if (['PENDING', 'SUSPENDED', 'WARNING', 'EARNING', 'BUSY', 'MAINTENANCE', 'RESERVED'].includes(norm)) {
      return { label, color: 'warning' };
    }
    if (['EXPIRED', 'CANCELLED', 'FAILED', 'REDEEMED', 'DEDUCT', 'CLOSED', 'OFFLINE', 'EMERGENCY', 'DISABLED', 'ERROR', 'INACTIVE', 'UNAVAILABLE', 'OUT_OF_STOCK', 'OCCUPIED'].includes(norm)) {
      return { label, color: 'error' };
    }
    if (['REFUNDED', 'RENEWAL', 'ADJUSTMENT', 'ADD', 'INFO'].includes(norm)) {
      return { label, color: 'info' };
    }
    return { label, color: 'default' };
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
