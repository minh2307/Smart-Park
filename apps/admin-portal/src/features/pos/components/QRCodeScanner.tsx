import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { MdQrCode } from 'react-icons/md';

interface QRCodeScannerProps {
  onScanResult: (result: string) => void;
  onCancel: () => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScanResult, onCancel }) => {
  const simulateScan = (type: 'MEMBER' | 'COUPON' | 'VOUCHER') => {
    if (type === 'MEMBER') {
      onScanResult('MEM-VIP-999');
    } else if (type === 'COUPON') {
      onScanResult('GIAM50K');
    } else {
      onScanResult('VOUCHER100');
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Giả Lập Camera Quét Mã QR Code
      </Typography>
      <Box sx={{ width: 140, height: 140, bgcolor: 'grey.100', mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, border: '2px dashed', borderColor: 'grey.300', borderRadius: 2 }}>
        <MdQrCode style={{ fontSize: '4rem', color: '#666' }} />
      </Box>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Chọn loại mã QR giả lập để kiểm tra:
      </Typography>
      <Box display="flex" flexDirection="column" gap={1.5} mb={3}>
        <Button variant="outlined" onClick={() => simulateScan('MEMBER')}>
          Quét Thẻ Thành Viên (MEM-VIP-999)
        </Button>
        <Button variant="outlined" onClick={() => simulateScan('COUPON')}>
          Quét Mã Coupon Giảm Giá (GIAM50K)
        </Button>
        <Button variant="outlined" onClick={() => simulateScan('VOUCHER')}>
          Quét Voucher Thanh Toán (VOUCHER100)
        </Button>
      </Box>
      <Button color="error" fullWidth onClick={onCancel} variant="contained">
        Đóng Camera
      </Button>
    </Paper>
  );
};
export default QRCodeScanner;
