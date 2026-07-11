import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material';
import { MdTrendingUp, MdPeople, MdConfirmationNumber, MdLocalActivity } from 'react-icons/md';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box display="flex" justifyContent="center" alignItems="center" width={48} height={48} borderRadius="50%" bgcolor={`${color}15`} color={color}>
      {icon}
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  </Paper>
);

export const VenueStatistics: React.FC = () => {
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Attractions"
          value={48}
          icon={<MdLocalActivity size={24} />}
          color="#3f51b5"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Ticket Types"
          value={12}
          icon={<MdConfirmationNumber size={24} />}
          color="#4caf50"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Monthly Visitors"
          value="14,820"
          icon={<MdPeople size={24} />}
          color="#ff9800"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Monthly Revenue"
          value="$128,450"
          icon={<MdTrendingUp size={24} />}
          color="#e91e63"
        />
      </Grid>
    </Grid>
  );
};
