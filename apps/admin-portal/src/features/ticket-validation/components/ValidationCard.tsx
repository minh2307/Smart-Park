import React from 'react';
import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import { MdCheckCircle, MdError, MdConfirmationNumber, MdReportProblem } from 'react-icons/md';
import { ValidationSummaryStats } from '../types';

interface ValidationCardProps {
  stats: ValidationSummaryStats;
}

export const ValidationCard: React.FC<ValidationCardProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Tổng số lượt quét',
      value: stats.totalScans,
      icon: <MdConfirmationNumber style={{ fontSize: '2.5rem', color: '#1976d2' }} />,
      bgColor: 'info.light',
      borderColor: 'info.main',
    },
    {
      title: 'Quét thành công',
      value: stats.successfulScans,
      icon: <MdCheckCircle style={{ fontSize: '2.5rem', color: '#2e7d32' }} />,
      bgColor: 'success.light',
      borderColor: 'success.main',
    },
    {
      title: 'Quét thất bại',
      value: stats.failedScans,
      icon: <MdError style={{ fontSize: '2.5rem', color: '#d32f2f' }} />,
      bgColor: 'error.light',
      borderColor: 'error.main',
    },
    {
      title: 'Sai vị trí/Hết hạn',
      value: stats.wrongLocationScans + stats.expiredScans,
      icon: <MdReportProblem style={{ fontSize: '2.5rem', color: '#ed6c02' }} />,
      bgColor: 'warning.light',
      borderColor: 'warning.main',
    },
  ];

  return (
    <Grid container spacing={3} mb={3}>
      {cards.map((c, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: c.borderColor,
              bgcolor: c.bgColor,
              opacity: 0.95,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 2,
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    {c.title}
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>
                    {c.value}
                  </Typography>
                </Box>
                {c.icon}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
export default ValidationCard;
