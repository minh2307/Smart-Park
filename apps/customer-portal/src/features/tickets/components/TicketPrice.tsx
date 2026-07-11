import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { formatCurrency } from '@shared/utils';

interface TicketPriceProps {
  price: number;
  discountPercent?: number;
  size?: 'small' | 'medium' | 'large';
}

export const TicketPrice: React.FC<TicketPriceProps> = ({ price, discountPercent, size = 'medium' }) => {
  const hasDiscount = discountPercent && discountPercent > 0;
  const originalPrice = hasDiscount ? Math.round(price / (1 - discountPercent! / 100)) : null;

  const fontSizes = {
    small: { current: '1rem', original: '0.75rem' },
    medium: { current: '1.25rem', original: '0.85rem' },
    large: { current: '1.75rem', original: '1rem' },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
      {hasDiscount && originalPrice && (
        <Typography
          variant="caption"
          sx={{
            textDecoration: 'line-through',
            color: 'text.disabled',
            fontSize: fontSizes[size].original,
            lineHeight: 1.2,
          }}
        >
          {formatCurrency(originalPrice)}
        </Typography>
      )}
      <Typography
        sx={{
          fontSize: fontSizes[size].current,
          fontWeight: 800,
          fontFamily: 'Outfit, sans-serif',
          color: hasDiscount ? '#dc2626' : 'primary.main',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}
      >
        {formatCurrency(price)}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
        / người
      </Typography>
    </Box>
  );
};

export const TicketPriceSkeleton: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'medium' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
    <Skeleton variant="text" width={60} height={14} />
    <Skeleton variant="text" width={size === 'large' ? 130 : 100} height={size === 'large' ? 28 : 20} />
  </Box>
);
