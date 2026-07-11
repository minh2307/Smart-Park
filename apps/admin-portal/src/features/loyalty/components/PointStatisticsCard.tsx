import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { MdTrendingUp, MdTrendingDown, MdEventBusy, MdPeople } from 'react-icons/md';
import { LoyaltySummary } from '../types';

interface PointStatisticsCardProps {
  summary: LoyaltySummary;
}

export const PointStatisticsCard: React.FC<PointStatisticsCardProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Total Points Issued',
      value: summary.totalEarned.toLocaleString(),
      subtitle: 'All-time Earned',
      bg: 'success.light',
      color: 'success.contrastText',
      icon: <MdTrendingUp size={24} />,
    },
    {
      title: 'Total Points Redeemed',
      value: summary.totalRedeemed.toLocaleString(),
      subtitle: 'All-time Spent',
      bg: 'primary.light',
      color: 'primary.contrastText',
      icon: <MdTrendingDown size={24} />,
    },
    {
      title: 'Points Expiring Soon',
      value: summary.expiringSoon.toLocaleString(),
      subtitle: 'In next 30 days',
      bg: 'error.light',
      color: 'error.contrastText',
      icon: <MdEventBusy size={24} />,
    },
    {
      title: 'Active Earners',
      value: summary.activeEarners.toLocaleString(),
      subtitle: 'Loyalty participants',
      bg: 'warning.light',
      color: 'warning.contrastText',
      icon: <MdPeople size={24} />,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box p={1.5} bgcolor={card.bg} sx={{ borderRadius: 2.5, color: card.color, display: 'flex' }}>
                {card.icon}
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {card.title}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
