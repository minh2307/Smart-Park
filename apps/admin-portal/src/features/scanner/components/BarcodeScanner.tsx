import React, { useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { MdSettingsInputHdmi } from 'react-icons/md';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  enabled: boolean;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, enabled }) => {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys
      if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Alt' || e.key === 'Meta') {
        return;
      }

      const currentTime = Date.now();
      
      // If the delay between keypresses is too large, it is likely manual typing rather than scanner input.
      // However, to be friendly, we buffer scanner inputs which are usually typed within 30ms of each other.
      // We will allow up to 100ms between keys.
      if (currentTime - lastKeyTimeRef.current > 100) {
        bufferRef.current = '';
      }

      lastKeyTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        if (bufferRef.current.length > 2) {
          onScan(bufferRef.current);
          bufferRef.current = '';
        }
      } else {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onScan]);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: enabled ? 'primary.light' : 'action.hover', opacity: 0.9, mt: 2 }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <MdSettingsInputHdmi style={{ fontSize: '1.75rem', color: enabled ? '#1976d2' : 'gray' }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {enabled ? 'Kết nối Máy Quét Cầm Tay: SẴN SÀNG' : 'Máy Quét Cầm Tay: ĐANG TẮT'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {enabled
                ? 'Hệ thống đang tự động bắt tín hiệu từ đầu đọc mã vạch USB / Bluetooth. Chỉ cần quét.'
                : 'Vui lòng cấu hình/mở cổng để bắt đầu quét phần cứng.'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
export default BarcodeScanner;
