/**
 * StatisticCard - Premium KPI metric card
 * Displays value, trend indicator, sparkline, and comparison
 */
import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton, useTheme } from '@mui/material';
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat } from 'react-icons/md';
import type { IconType } from 'react-icons';

interface StatisticCardProps {
  title: string;
  value: string;
  trend?: { value: number; direction: 'up' | 'down' | 'flat' };
  icon?: IconType;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  sparklineData?: number[];
  compareLabel?: string;
  loading?: boolean;
}

const TrendIcon: Record<string, IconType> = {
  up: MdTrendingUp,
  down: MdTrendingDown,
  flat: MdTrendingFlat,
};

const trendColor: Record<string, string> = {
  up: '#22c55e',
  down: '#ef4444',
  flat: '#64748b',
};

/**
 * Mini sparkline rendered as an SVG polyline
 */
const Sparkline: React.FC<{ data: number[]; color: string; width?: number; height?: number }> = ({
  data,
  color,
  width = 80,
  height = 28,
}) => {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#spark-${color.replace('#', '')})`}
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  trend,
  icon: Icon,
  color = 'primary',
  sparklineData,
  compareLabel,
  loading = false,
}) => {
  const theme = useTheme();
  const accentColor = theme.palette[color]?.main || theme.palette.primary.main;
  const accentBg = theme.palette[color]?.light || theme.palette.primary.light;

  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Skeleton width={100} height={16} sx={{ mb: 1 }} />
          <Skeleton width={140} height={32} sx={{ mb: 1 }} />
          <Skeleton width={80} height={14} />
        </CardContent>
      </Card>
    );
  }

  const TrendComp = trend ? TrendIcon[trend.direction] : null;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: accentColor,
          boxShadow: `0 0 0 1px ${accentColor}20`,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.02em' }}>
            {title}
          </Typography>
          {Icon && (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: accentBg,
                color: accentColor,
                flexShrink: 0,
              }}
            >
              <Icon size={16} />
            </Box>
          )}
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            mb: 1,
          }}
        >
          {value}
        </Typography>

        {sparklineData && sparklineData.length > 1 && (
          <Box sx={{ mb: 1 }}>
            <Sparkline data={sparklineData} color={accentColor} />
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {trend && TrendComp && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                px: 0.75,
                py: 0.25,
                borderRadius: '6px',
                backgroundColor: `${trendColor[trend.direction]}12`,
                color: trendColor[trend.direction],
              }}
            >
              <TrendComp size={14} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6875rem' }}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </Typography>
            </Box>
          )}
          {compareLabel && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
              {compareLabel}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
