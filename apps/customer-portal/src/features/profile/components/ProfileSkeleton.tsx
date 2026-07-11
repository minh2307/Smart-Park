import React from 'react';
import { Box, Grid, Skeleton, Stack } from '@mui/material';

export const ProfileSkeleton: React.FC = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" height={360} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
        </Grid>
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Skeleton variant="rectangular" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }} />
            <Skeleton variant="rectangular" height={260} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }} />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
export default ProfileSkeleton;
