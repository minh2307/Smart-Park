import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Grid, Card, CardContent } from '@mui/material';
import { MdVideocam, MdQrCode, MdKeyboard } from 'react-icons/md';

interface CameraScannerProps {
  onScan: (qrCode: string) => void;
  flashEnabled?: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onScan, flashEnabled = false }) => {
  const [manualCode, setManualCode] = useState('');
  const [pulsing, setPulsing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsing((prev) => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  // Pre-configured test codes to make testing validation states extremely simple
  const testTickets = [
    { label: 'Vé Thường Đầm Sen', code: 'TK_DS_STANDARD_998811A' },
    { label: 'Vé VIP Đầm Sen', code: 'TK_DS_VIP_998811B' },
    { label: 'Vé Đã Sử Dụng', code: 'TK_USED_999' },
    { label: 'Vé Hết Hạn', code: 'TK_EXPIRED_XYZ_999' },
    { label: 'Vé Sai Địa Điểm', code: 'TK_WRONG_LOC_123' },
    { label: 'Vé Bị Khóa', code: 'TK_SUSPENDED_456' },
  ];

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', height: '100%' }}>
      <Box
        sx={{
          bgcolor: '#121212',
          p: 3,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 280,
          borderBottom: '1px solid #2d2d2d',
        }}
      >
        {/* Flashlight Indicator */}
        {flashEnabled && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: 'yellow',
              boxShadow: '0 0 10px yellow',
            }}
          />
        )}

        {/* Viewfinder simulation */}
        <Box
          sx={{
            width: 200,
            height: 200,
            border: '2px solid #388e3c',
            borderRadius: 2,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(56, 142, 60, 0.4)',
          }}
        >
          {/* Laser scanning line */}
          <Box
            sx={{
              width: '100%',
              height: '2px',
              bgcolor: '#388e3c',
              position: 'absolute',
              top: pulsing ? '10%' : '90%',
              transition: 'top 1.4s ease-in-out',
              boxShadow: '0 0 8px #388e3c',
            }}
          />
          <MdQrCode style={{ fontSize: '6rem', color: '#388e3c', opacity: 0.6 }} />
        </Box>
        <Typography variant="caption" sx={{ color: '#888', mt: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MdVideocam /> Trình giả lập camera đang hoạt động...
        </Typography>
      </Box>

      <CardContent>
        {/* Manual Keyboard input */}
        <Box component="form" onSubmit={handleManualSubmit} sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <TextField
            size="small"
            fullWidth
            label="Nhập mã vé thủ công (hoặc USB Scanner)"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            InputProps={{
              startAdornment: <MdKeyboard style={{ marginRight: 8, color: 'gray' }} />,
            }}
          />
          <Button type="submit" variant="contained" color="primary">
            Quét
          </Button>
        </Box>

        {/* Quick test buttons */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Phím tắt quét vé (Hỗ trợ Kiểm thử):
        </Typography>
        <Grid container spacing={1}>
          {testTickets.map((t, i) => (
            <Grid item xs={6} key={i}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => onScan(t.code)}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.75,
                }}
              >
                {t.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};
export default CameraScanner;
