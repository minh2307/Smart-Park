import { Box, CircularProgress } from '@mui/material';

export const PageLoader = () => (
  <Box
    sx={{
      minHeight: '100dvh',
      bgcolor: '#0b1221',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <CircularProgress sx={{ color: '#2dd4bf' }} size={36} thickness={3} />
  </Box>
);
