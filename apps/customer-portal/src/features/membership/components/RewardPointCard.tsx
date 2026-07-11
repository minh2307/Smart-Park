import React from 'react';
import { Card, CardContent, Typography, Grid, Stack, useTheme } from '@mui/material';
import StarsIcon from '@mui/icons-material/Stars';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface RewardPointCardProps {
  points: number;
}

export const RewardPointCard: React.FC<RewardPointCardProps> = ({ points }) => {
  const theme = useTheme();

  return (
    <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4, mb: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 3 }}>
          Thông Tin Điểm Thưởng
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={6} sm={3}>
            <Stack spacing={1} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <StarsIcon sx={{ color: '#2dd4bf' }} />
                <Typography variant="caption" color="rgba(255,255,255,0.5)">Khả dụng</Typography>
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2dd4bf' }}>{points}</Typography>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Stack spacing={1} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircleIcon sx={{ color: '#4caf50' }} />
                <Typography variant="caption" color="rgba(255,255,255,0.5)">Đã nhận</Typography>
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>{points + 50}</Typography>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Stack spacing={1} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <RemoveCircleIcon sx={{ color: '#ff9800' }} />
                <Typography variant="caption" color="rgba(255,255,255,0.5)">Đã dùng</Typography>
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff9800' }}>50</Typography>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Stack spacing={1} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CancelIcon sx={{ color: '#f44336' }} />
                <Typography variant="caption" color="rgba(255,255,255,0.5)">Hết hạn</Typography>
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f44336' }}>0</Typography>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
