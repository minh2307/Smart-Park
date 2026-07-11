import React from 'react';
import { Box } from '@mui/material';

interface VenueToolbarProps {
  children: React.ReactNode;
}

export const VenueToolbar: React.FC<VenueToolbarProps> = ({ children }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
      mb={2}
    >
      {children}
    </Box>
  );
};
