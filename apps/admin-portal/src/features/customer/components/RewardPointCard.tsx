import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { MdStar, MdTrendingUp } from 'react-icons/md';
import { CustomerMembership, MembershipTier } from '../types';
import { mockMembershipTiers } from '../services/customerApi';
import { formatCurrency } from '../../analytics/utils/numberFormatters';

interface RewardPointCardProps {
  membership?: CustomerMembership;
  totalSpending?: number;
}

export const RewardPointCard: React.FC<RewardPointCardProps> = ({ membership, totalSpending = 0 }) => {
  if (!membership) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3, p: 1, height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Box p={1} bgcolor="action.hover" sx={{ borderRadius: 2, display: 'flex', color: 'text.secondary' }}>
              <MdStar size={24} />
            </Box>
            <Typography variant="subtitle1" fontWeight="bold">Chương trình thành viên</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Khách hàng này hiện chưa đăng ký chương trình thành viên. Vui lòng thêm hạng thành viên để bắt đầu tích điểm.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Find next tier
  const currentTierIndex = mockMembershipTiers.findIndex((t) => t.code === membership.tier.code);
  const nextTier: MembershipTier | null =
    currentTierIndex !== -1 && currentTierIndex < mockMembershipTiers.length - 1
      ? mockMembershipTiers[currentTierIndex + 1]
      : null;

  // Calculate progress towards next tier based on spending or custom rule
  const currentSpend = totalSpending;
  const targetSpend = nextTier ? nextTier.minSpend : 0;
  const progressPercent = nextTier ? Math.min(100, Math.max(0, (currentSpend / targetSpend) * 100)) : 100;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box p={1} bgcolor="primary.light" sx={{ borderRadius: 2, display: 'flex', color: 'primary.contrastText' }}>
                <MdStar size={24} />
              </Box>
              <Typography variant="subtitle1" fontWeight="bold">Số dư điểm thưởng</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'action.selected', px: 1, py: 0.5, borderRadius: 1 }}>
              Hệ số tích điểm: {membership.tier.pointsMultiplier}x
            </Typography>
          </Box>
          <Box display="flex" alignItems="baseline" gap={1} mt={1}>
            <Typography variant="h3" fontWeight="bold" color="primary.main">
              {membership.points.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">Điểm</Typography>
          </Box>
        </Box>

        {nextTier ? (
          <Box>
            <Box display="flex" justify-content="space-between" justifyContent="space-between" alignItems="center" mb={0.75}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <MdTrendingUp color="text.secondary" />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Tiến trình lên hạng {nextTier.name} ({formatCurrency(currentSpend)} / {formatCurrency(targetSpend)})
                </Typography>
              </Box>
              <Typography variant="caption" fontWeight="bold" color="primary.main">
                {progressPercent.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        ) : (
          <Box sx={{ p: 1, bgcolor: 'success.light', borderRadius: 2, color: 'success.contrastText' }}>
            <Typography variant="caption" fontWeight="bold" display="flex" alignItems="center" gap={0.5}>
              🎉 Đã đạt hạng thành viên cao nhất!
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
