import React from 'react';
import { Box, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  height?: string | number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ height = '100%' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height,
      }}
    >
      <CircularProgress color="primary" />
    </Box>
  );
};
