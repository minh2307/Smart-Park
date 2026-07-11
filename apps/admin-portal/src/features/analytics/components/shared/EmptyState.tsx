/**
 * EmptyState - Beautiful empty state for dashboard widgets
 */
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { MdBarChart, MdRefresh } from 'react-icons/md';
import type { IconType } from 'react-icons';

interface EmptyStateProps {
  icon?: IconType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = MdBarChart,
  title = 'No data available',
  description = 'Try adjusting the date range or filters',
  actionLabel,
  onAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'action.hover',
          color: 'text.secondary',
          mb: 2,
        }}
      >
        <Icon size={24} />
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 240, mb: 2 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button size="small" startIcon={<MdRefresh size={14} />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};
