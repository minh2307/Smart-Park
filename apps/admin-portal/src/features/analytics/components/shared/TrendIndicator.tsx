/**
 * TrendIndicator - Up/down arrow with percentage badge
 */
import React from 'react';
import { Box, Typography } from '@mui/material';
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat } from 'react-icons/md';

interface TrendIndicatorProps {
  value: number;
  direction: 'up' | 'down' | 'flat';
  label?: string;
  size?: 'small' | 'medium';
}

const colors = {
  up: { bg: '#22c55e12', text: '#22c55e' },
  down: { bg: '#ef444412', text: '#ef4444' },
  flat: { bg: '#64748b12', text: '#64748b' },
};

const icons = { up: MdTrendingUp, down: MdTrendingDown, flat: MdTrendingFlat };

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  direction,
  label,
  size = 'small',
}) => {
  const Icon = icons[direction];
  const c = colors[direction];
  const iconSize = size === 'small' ? 14 : 16;
  const fontSize = size === 'small' ? '0.6875rem' : '0.75rem';

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.25,
          px: 0.75,
          py: 0.25,
          borderRadius: '6px',
          backgroundColor: c.bg,
          color: c.text,
        }}
      >
        <Icon size={iconSize} />
        <Typography component="span" sx={{ fontWeight: 700, fontSize, lineHeight: 1 }}>
          {value > 0 ? '+' : ''}{value}%
        </Typography>
      </Box>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize }}>
          {label}
        </Typography>
      )}
    </Box>
  );
};
