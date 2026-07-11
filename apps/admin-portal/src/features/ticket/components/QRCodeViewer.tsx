import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface QRCodeViewerProps {
  value: string;
  size?: number;
  label?: string;
}

export const QRCodeViewer: React.FC<QRCodeViewerProps> = ({
  value,
  size = 180,
  label,
}) => {
  // Use a reliable QR Code generator API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    value || 'GATEOS-VOID'
  )}&color=000000&bgcolor=ffffff`;

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#fff',
        border: '1px solid',
        borderColor: 'divider',
        width: 'fit-content',
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: 2,
          position: 'relative',
        }}
      >
        <img
          src={qrUrl}
          alt={`QR Code: ${value}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Box>
      {label && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1.5, fontFamily: 'monospace', fontWeight: 600, letterSpacing: 1 }}
        >
          {label}
        </Typography>
      )}
    </Paper>
  );
};
