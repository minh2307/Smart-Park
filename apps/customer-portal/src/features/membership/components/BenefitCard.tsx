import React from 'react';
import { Card, CardContent, Typography, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface BenefitCardProps {
  title: string;
  description: string;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ title, description }) => {
  return (
    <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
          <CheckCircleIcon sx={{ color: '#2dd4bf' }} />
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
        </Stack>
        <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};
