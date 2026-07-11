import React, { useState } from 'react';
import { Box, TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { MdQrCodeScanner } from 'react-icons/md';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan }) => {
  const [val, setVal] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && val.trim()) {
      onScan(val.trim());
      setVal('');
    }
  };

  const handleSimulateRandomScan = () => {
    const mockBarcodes = ['8936012345678', '8936012345685', '8936012345692'];
    const randomIdx = Math.floor(Math.random() * mockBarcodes.length);
    onScan(mockBarcodes[randomIdx]);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        label="Quét mã vạch (Barcode Scanner)"
        variant="outlined"
        placeholder="Quét hoặc nhập mã vạch..."
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={handleKeyPress}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Mô phỏng quét tự động">
                <IconButton onClick={handleSimulateRandomScan} color="primary" edge="end">
                  <MdQrCodeScanner />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};
export default BarcodeScanner;
