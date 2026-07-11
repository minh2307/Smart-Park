import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { PiCoins, PiUsers, PiChartLineUp, PiSuitcase } from 'react-icons/pi';
import { Campaign } from '../types';

interface CampaignStatisticsProps {
  campaigns: Campaign[];
}

export const CampaignStatistics: React.FC<CampaignStatisticsProps> = ({ campaigns }) => {
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.totalRevenue, 0);

  const stats = [
    {
      title: 'Tong So Chien Dich',
      value: totalCampaigns,
      icon: <PiSuitcase size={28} />,
      color: 'primary.main',
      bgColor: 'primary.light',
    },
    {
      title: 'Chien Dich Hoat Dong',
      value: activeCampaigns,
      icon: <PiUsers size={28} />,
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      title: 'Tong Ngan Sach',
      value: `$${totalBudget.toLocaleString()}`,
      icon: <PiCoins size={28} />,
      color: 'warning.main',
      bgColor: 'warning.light',
    },
    {
      title: 'Tong Doanh Thu',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <PiChartLineUp size={28} />,
      color: 'info.main',
      bgColor: 'info.light',
    },
  ];

  return (
    <Grid container spacing={3} mb={4}>
      {stats.map((stat, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stat.value}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    color: stat.color,
                    bgcolor: (theme) => {
                      const c = stat.color.split('.')[0] as 'primary' | 'success' | 'warning' | 'info';
                      return theme.palette[c]?.light || '#f5f5f5';
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
export default CampaignStatistics;
