import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  toolbar?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  toolbar,
  children,
}) => {
  return (
    <Box
      id="main-content"
      component="section"
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: 1440,
        width: '100%',
        mx: 'auto',
      }}
    >
      {/* Page header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            color="text.primary"
            sx={{
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {toolbar && (
          <Box display="flex" gap={1.5} flexShrink={0}>
            {toolbar}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  );
};
