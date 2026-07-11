import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

interface SkeletonLoadingProps {
  count?: number;
  type?: 'card' | 'list' | 'faq';
}

export const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({ count = 3, type = 'card' }) => {
  return (
    <Stack spacing={2.5}>
      {Array.from({ length: count }).map((_, idx) => (
        <Box
          key={idx}
          sx={{
            p: 3,
            bgcolor: 'rgba(30, 41, 59, 0.3)',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
          }}
        >
          {type === 'card' && (
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Skeleton variant="text" width="40%" height={28} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.06)' }} />
              </Stack>
              <Skeleton variant="text" width="90%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
              <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                <Skeleton variant="text" width="20%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                <Skeleton variant="text" width="30%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
              </Stack>
            </Stack>
          )}

          {type === 'list' && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
              <Stack spacing={1} sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="30%" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                <Skeleton variant="text" width="70%" height={18} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
              </Stack>
            </Stack>
          )}

          {type === 'faq' && (
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Skeleton variant="text" width="70%" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
              <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
            </Stack>
          )}
        </Box>
      ))}
    </Stack>
  );
};
