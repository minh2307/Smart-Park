import React from 'react';
import { Box } from '@mui/material';

interface UserToolbarProps {
  children: React.ReactNode;
}

export const UserToolbar: React.FC<UserToolbarProps> = ({ children }) => {
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
