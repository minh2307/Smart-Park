/**
 * DashboardCard - Section wrapper card for dashboard widgets
 * Provides consistent header, toolbar, and content area
 */
import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip, Skeleton } from '@mui/material';
import { MdFullscreen, MdRefresh } from 'react-icons/md';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  height?: number | string;
  onRefresh?: () => void;
  onFullscreen?: () => void;
  actions?: React.ReactNode;
  noPadding?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  children,
  loading = false,
  height,
  onRefresh,
  onFullscreen,
  actions,
  noPadding = false,
}) => {
  return (
    <Card
      variant="outlined"
      sx={{
        height: height || '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[3],
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          pt: 2,
          pb: 0.5,
          minHeight: 48,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          {actions}
          {onRefresh && (
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={onRefresh} sx={{ color: 'text.secondary' }}>
                <MdRefresh size={16} />
              </IconButton>
            </Tooltip>
          )}
          {onFullscreen && (
            <Tooltip title="Fullscreen">
              <IconButton size="small" onClick={onFullscreen} sx={{ color: 'text.secondary' }}>
                <MdFullscreen size={16} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Content */}
      <CardContent
        sx={{
          flex: 1,
          p: noPadding ? 0 : 2.5,
          pt: noPadding ? 0 : 1.5,
          '&:last-child': { pb: noPadding ? 0 : 2.5 },
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {loading ? (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, p: noPadding ? 2.5 : 0 }}>
            <Skeleton variant="rounded" height={20} width="60%" />
            <Skeleton variant="rounded" sx={{ flex: 1, minHeight: 120 }} />
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
