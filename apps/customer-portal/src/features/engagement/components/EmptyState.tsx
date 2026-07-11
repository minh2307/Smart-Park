import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { SvgIconProps } from '@mui/material';

interface EmptyStateProps {
  icon: React.ComponentType<SvgIconProps>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
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
        textAlign: 'center',
        py: 8,
        px: 3,
        bgcolor: 'rgba(30, 41, 59, 0.2)',
        borderRadius: 4,
        border: '1px dashed rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Icon sx={{ fontSize: 64, color: 'rgba(45, 212, 191, 0.25)', mb: 2 }} />
      <Typography
        variant="h6"
        sx={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700,
          color: '#ffffff',
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.5)',
          maxWidth: 400,
          mb: actionLabel && onAction ? 3 : 0,
        }}
      >
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{
            background: 'linear-gradient(135deg, #2dd4bf 0%, #0ea5e9 100%)',
            color: '#0f172a',
            fontWeight: 800,
            textTransform: 'none',
            borderRadius: 2.5,
            px: 4,
            boxShadow: '0 4px 14px rgba(45, 212, 191, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(45, 212, 191, 0.5)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s',
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};
