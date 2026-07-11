import React from 'react';
import { Card, CardContent, Grid, Skeleton, Box, Stack } from '@mui/material';

export const OrderSkeleton: React.FC = () => {
  return (
    <Card
      sx={{
        bgcolor: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 4,
        mb: 3,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ height: 3, bgcolor: 'rgba(255, 255, 255, 0.05)' }} />
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Skeleton variant="text" width={140} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                <Skeleton variant="rectangular" width={90} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }} />
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Skeleton variant="text" width="60%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mt: 0.5 }} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Skeleton variant="text" width="60%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mt: 0.5 }} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Skeleton variant="text" width="60%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mt: 0.5 }} />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Skeleton variant="text" width="60%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mt: 0.5 }} />
                </Grid>
              </Grid>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
            <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 1.5 }}>
              <Skeleton variant="text" width={100} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
              <Skeleton variant="rectangular" width={120} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
