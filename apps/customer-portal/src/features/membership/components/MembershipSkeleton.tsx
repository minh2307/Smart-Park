import React from 'react';
import { Box, Grid, Skeleton, Stack } from '@mui/material';

export const MembershipSkeleton: React.FC = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Skeleton
            variant="rectangular"
            height={260}
            sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 4 }}
          />
        </Grid>
        <Grid item xs={12} md={7}>
          <Stack spacing={3} sx={{ height: '100%', justifyContent: 'center' }}>
            <Skeleton variant="text" width="60%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            <Skeleton variant="rectangular" height={15} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 3 }} />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
export default MembershipSkeleton;
