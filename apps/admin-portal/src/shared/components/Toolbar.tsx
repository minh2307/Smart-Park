import React from 'react';
import { Box, Typography } from '@mui/material';

interface ToolbarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({ title, subtitle, action }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 4,
      }}
    >
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>{action}</Box>}
    </Box>
  );
};
