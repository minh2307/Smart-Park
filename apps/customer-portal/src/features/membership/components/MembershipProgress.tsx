import React from 'react';
import { Box, Typography, Stack, LinearProgress } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import type { MembershipTier } from '../types/membership.types';

interface MembershipProgressProps {
  currentPoints: number;
  currentTierName: string;
  nextTier: MembershipTier | null;
  progressPercentage: number;
  requiredPoints: number;
}

export const MembershipProgress: React.FC<MembershipProgressProps> = ({
  currentPoints,
  currentTierName,
  nextTier,
  progressPercentage,
  requiredPoints,
}) => {
  const getTierColor = (code: string) => {
    switch (code) {
      case 'PLATINUM':
        return '#0288d1';
      case 'GOLD':
        return '#ed6c02';
      case 'SILVER':
      default:
        return '#94a3b8';
    }
  };

  return (
    <Box>
      {nextTier ? (
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              Thăng hạng tiếp theo: <span style={{ color: getTierColor(nextTier.code) }}>{nextTier.name}</span>
              <ArrowUpwardIcon sx={{ color: '#2dd4bf' }} />
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
              Cần thêm <strong>{requiredPoints} điểm</strong> để đạt mốc chi tiêu {nextTier.minSpend.toLocaleString('vi-VN')} VND.
            </Typography>
          </Box>

          <Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#2dd4bf',
                  borderRadius: 5,
                },
              }}
            />
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Typography variant="caption" color="rgba(255,255,255,0.4)">
                Hạng hiện tại ({currentTierName})
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.4)">
                Mốc thăng hạng ({nextTier.name})
              </Typography>
            </Stack>
          </Box>
        </Stack>
      ) : (
        <Box textAlign="center" sx={{ py: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#ed6c02', mb: 1 }}>
            Hạng Thẻ Cao Nhất Đạt Được!
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            Bạn đã đạt tới cấp độ VIP cao nhất và đang hưởng trọn đặc quyền từ Smart Park.
          </Typography>
        </Box>
      )}
    </Box>
  );
};
