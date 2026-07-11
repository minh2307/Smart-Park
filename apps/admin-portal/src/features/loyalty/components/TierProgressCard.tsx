import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';
import { MembershipTier } from '../../membership/types';

interface TierProgressCardProps {
  currentPoints: number;
  currentTier: MembershipTier;
  nextTier?: MembershipTier;
}

export const TierProgressCard: React.FC<TierProgressCardProps> = ({
  currentPoints,
  currentTier,
  nextTier,
}) => {
  if (!nextTier) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'action.hover' }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Maximum Tier Achieved 🎉
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You are currently on the highest tier ({currentTier.name}) with {currentPoints.toLocaleString()} points.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const upgradeThreshold = nextTier.pointRules.upgradeThreshold;
  const progressPercent = Math.min(100, Math.max(0, (currentPoints / upgradeThreshold) * 100));
  const pointsNeeded = Math.max(0, upgradeThreshold - currentPoints);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2" fontWeight="bold">
            Progress to {nextTier.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentPoints.toLocaleString()} / {upgradeThreshold.toLocaleString()} Pts
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{ height: 8, borderRadius: 4, mb: 2 }}
        />

        <Typography variant="body2" color="text.secondary">
          Earn <strong>{pointsNeeded.toLocaleString()}</strong> more points to upgrade your membership level.
        </Typography>
      </CardContent>
    </Card>
  );
};
