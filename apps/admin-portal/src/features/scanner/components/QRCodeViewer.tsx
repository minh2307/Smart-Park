import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { MdQrCode } from 'react-icons/md';

interface QRCodeViewerProps {
  value: string;
  label?: string;
}

export const QRCodeViewer: React.FC<QRCodeViewerProps> = ({ value, label }) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        maxWidth: 240,
        mx: 'auto',
      }}
    >
      <Box
        sx={{
          p: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MdQrCode style={{ fontSize: '10rem', color: '#111' }} />
      </Box>
      {label && (
        <Typography variant="subtitle2" sx={{ mt: 1.5, fontWeight: 'bold', textAlign: 'center' }}>
          {label}
        </Typography>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'center' }}
      >
        {value}
      </Typography>
    </Paper>
  );
};
export default QRCodeViewer;
