import React from 'react';
import { Card as MuiCard, CardContent, Typography, Box, Paper } from '@mui/material';
import { IconType } from 'react-icons';

// 1. Generic Card
export const Card: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <MuiCard variant="outlined" sx={{ borderRadius: 2 }}>
      {title && (
        <Box px={2} py={1.5} borderBottom="1px solid" borderColor="divider">
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
        </Box>
      )}
      <CardContent>{children}</CardContent>
    </MuiCard>
  );
};

// 2. Statistic Card
interface StatisticCardProps {
  title: string;
  value: string | number;
  icon?: IconType;
  color?: string;
  trend?: {
    value: string;
    label: string;
    isPositive?: boolean;
  };
}
export const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'primary.main',
  trend,
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold" sx={{ my: 0.5 }}>
          {value}
        </Typography>
        {trend && (
          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
            <Typography
              variant="caption"
              fontWeight="bold"
              color={trend.isPositive ? 'success.main' : 'error.main'}
            >
              {trend.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {trend.label}
            </Typography>
          </Box>
        )}
      </Box>
      {Icon && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color.replace('.main', '')}.light`,
            color: color,
            opacity: 0.85,
          }}
        >
          <Icon size={24} />
        </Box>
      )}
    </Paper>
  );
};

// 3. Info Card
export const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
};
