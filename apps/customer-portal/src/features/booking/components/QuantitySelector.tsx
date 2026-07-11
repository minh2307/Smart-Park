import React from 'react';
import { Stack, IconButton, Typography, Box, alpha, useTheme } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'small' | 'medium';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 0,
  max = 99,
  size = 'medium',
}) => {
  const theme = useTheme();
  const isSmall = size === 'small';

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.8),
        borderRadius: isSmall ? 2 : 3,
        overflow: 'hidden',
        p: 0.5,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <IconButton
        size={isSmall ? 'small' : 'medium'}
        onClick={handleDecrement}
        disabled={value <= min}
        sx={{
          borderRadius: isSmall ? 1.5 : 2,
          p: isSmall ? 0.5 : 1,
          color: 'text.secondary',
          '&:disabled': { color: 'text.disabled' },
        }}
      >
        <Remove fontSize="small" />
      </IconButton>
      
      <Typography
        fontWeight={700}
        variant={isSmall ? 'body2' : 'body1'}
        sx={{
          minWidth: isSmall ? 24 : 36,
          textAlign: 'center',
          userSelect: 'none',
          fontFamily: 'Outfit, sans-serif',
        }}
      >
        {value}
      </Typography>

      <IconButton
        size={isSmall ? 'small' : 'medium'}
        onClick={handleIncrement}
        disabled={value >= max}
        sx={{
          borderRadius: isSmall ? 1.5 : 2,
          p: isSmall ? 0.5 : 1,
          color: 'text.secondary',
          '&:disabled': { color: 'text.disabled' },
        }}
      >
        <Add fontSize="small" />
      </IconButton>
    </Box>
  );
};
