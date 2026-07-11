import React from 'react';
import { Box, Typography } from '@mui/material';
import { MdAccessTime } from 'react-icons/md';

interface QueueIndicatorProps {
  minutes: number;
  status: string;
}

export const QueueIndicator: React.FC<QueueIndicatorProps> = ({ minutes, status }) => {
  if (status !== 'OPERATING') {
    return (
      <Box display="inline-flex" alignItems="center" gap={0.5} sx={{ color: 'text.disabled' }}>
        <MdAccessTime size={16} />
        <Typography variant="body2" fontWeight="medium">N/A</Typography>
      </Box>
    );
  }

  const getStatusColor = (min: number) => {
    if (min <= 10) return { main: 'success.main', bg: 'success.light', text: 'success.contrastText' };
    if (min <= 30) return { main: 'warning.main', bg: 'warning.light', text: 'warning.contrastText' };
    return { main: 'error.main', bg: 'error.light', text: 'error.contrastText' };
  };

  const colors = getStatusColor(minutes);

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap={0.75}
      px={1.25}
      py={0.25}
      sx={{
        bgcolor: colors.bg,
        borderRadius: 2,
        color: colors.main,
        border: '1px solid',
        borderColor: colors.main,
        width: 'fit-content'
      }}
    >
      <MdAccessTime size={16} />
      <Typography variant="caption" fontWeight="bold">
        {minutes === 0 ? 'No Wait' : `${minutes} min`}
      </Typography>
    </Box>
  );
};
