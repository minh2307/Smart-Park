import React from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message = 'Authenticating...',
}) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 101,
        backdropFilter: 'blur(4px)',
      }}
      open={open}
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <CircularProgress color="inherit" size={50} />
        {message && (
          <Typography variant="h6" component="div">
            {message}
          </Typography>
        )}
      </Box>
    </Backdrop>
  );
};
