import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { MdPeople, MdCardMembership, MdStars, MdPercent } from 'react-icons/md';

interface MembershipStatisticsProps {
  totalMembers: number;
  activeTiersCount: number;
  totalPoints: number;
  averageDiscount: number;
}

export const MembershipStatistics: React.FC<MembershipStatisticsProps> = ({
  totalMembers,
  activeTiersCount,
  totalPoints,
  averageDiscount,
}) => {
  const cards = [
    {
      title: 'Total Members',
      value: totalMembers,
      subtitle: 'Enrolled Customers',
      bg: 'primary.light',
      color: 'primary.contrastText',
      icon: <MdPeople size={24} />,
    },
    {
      title: 'Active Tiers',
      value: activeTiersCount,
      subtitle: 'Membership Levels',
      bg: 'success.light',
      color: 'success.contrastText',
      icon: <MdCardMembership size={24} />,
    },
    {
      title: 'Points Issued',
      value: totalPoints.toLocaleString(),
      subtitle: 'Loyalty Balance',
      bg: 'warning.light',
      color: 'warning.contrastText',
      icon: <MdStars size={24} />,
    },
    {
      title: 'Avg. Tier Discount',
      value: `${averageDiscount.toFixed(1)}%`,
      subtitle: 'Ticket Rate Benefits',
      bg: 'error.light',
      color: 'error.contrastText',
      icon: <MdPercent size={24} />,
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
