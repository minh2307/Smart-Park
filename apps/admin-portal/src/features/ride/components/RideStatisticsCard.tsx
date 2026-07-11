import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { MdPlayArrow, MdBuild, MdAccessTime } from 'react-icons/md';

interface RideStatisticsCardProps {
  total: number;
  operating: number;
  closed: number;
  maintenance: number;
  avgQueueTime: number;
}

export const RideStatisticsCard: React.FC<RideStatisticsCardProps> = ({
  total,
  operating,
  closed,
  maintenance,
  avgQueueTime,
}) => {
  const cards = [
    {
      title: 'Total Rides',
      value: total,
      subtitle: 'Registered Attractions',
      bg: 'primary.light',
      color: 'primary.contrastText',
      icon: <MdPlayArrow size={24} />,
    },
    {
      title: 'Operating',
      value: operating,
      subtitle: 'Live Attractions',
      bg: 'success.light',
      color: 'success.contrastText',
      icon: <MdPlayArrow size={24} />,
    },
    {
      title: 'Under Maintenance / Closed',
      value: maintenance + closed,
      subtitle: `${maintenance} In Service | ${closed} Closed`,
      bg: 'error.light',
      color: 'error.contrastText',
      icon: <MdBuild size={24} />,
    },
    {
      title: 'Average Queue Wait',
      value: `${avgQueueTime}m`,
      subtitle: 'Mean Wait Time',
      bg: 'warning.light',
      color: 'warning.contrastText',
      icon: <MdAccessTime size={24} />,
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
