import React from 'react';
import { Backdrop, CircularProgress, Box, Typography, LinearProgress, Alert } from '@mui/material';

// 1. Loading Overlay
export const LoadingOverlay: React.FC<{ open: boolean }> = ({ open }) => {
  return (
    <Backdrop open={open} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999, backdropFilter: 'blur(4px)' }}>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <CircularProgress color="inherit" />
        <Typography variant="body2" color="inherit">
          Loading, please wait...
        </Typography>
      </Box>
    </Backdrop>
  );
};

// 2. Spinner
export const Spinner: React.FC = () => {
  return (
    <Box display="flex" justifyContent="center" py={4}>
      <CircularProgress />
    </Box>
  );
};

// 3. Progress Bar
export const ProgressBar: React.FC<{ value?: number }> = ({ value }) => {
  return (
    <Box width="100%" sx={{ my: 1 }}>
      {value !== undefined ? (
        <LinearProgress variant="determinate" value={value} />
      ) : (
        <LinearProgress />
      )}
    </Box>
  );
};

// 4. Success, Error, Warning Message banners
export const SuccessMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <Alert severity="success" sx={{ borderRadius: 2 }}>
      {message}
    </Alert>
  );
};

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <Alert severity="error" sx={{ borderRadius: 2 }}>
      {message}
    </Alert>
  );
};

export const WarningMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <Alert severity="warning" sx={{ borderRadius: 2 }}>
      {message}
    </Alert>
  );
};
