import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Chip, CircularProgress, alpha, useTheme } from '@mui/material';
import { CardMembership, Stars, WorkspacePremium } from '@mui/icons-material';
import { useGetMembershipsQuery } from '../api/bookingApi';
import { formatCurrency } from '@shared/utils';

interface MembershipDiscountCardProps {
  customerId: number;
  orderTotal: number;
  onApplyDiscount: (percentage: number) => void;
}

export const MembershipDiscountCard: React.FC<MembershipDiscountCardProps> = ({
  customerId,
  orderTotal,
  onApplyDiscount,
}) => {
  const theme = useTheme();
  const { data: memberships, isLoading, error } = useGetMembershipsQuery();

  // Find membership for this customer
  const userMembership = memberships?.find((m: any) => m.customer?.id === customerId);

  React.useEffect(() => {
    if (userMembership?.tier?.discountPercentage) {
      onApplyDiscount(Number(userMembership.tier.discountPercentage));
    } else {
      onApplyDiscount(0);
    }
  }, [userMembership, onApplyDiscount]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error || !userMembership) {
    // If user has no membership, show standard guest option
    return null;
  }

  const tierName = userMembership.tier?.name || 'Standard';
  const tierCode = userMembership.tier?.code || 'STANDARD';
  const points = userMembership.points || 0;
  const discountPercent = Number(userMembership.tier?.discountPercentage || 0);
  const discountValue = (orderTotal * discountPercent) / 100;

  // Premium tier styling
  const isGoldOrAbove = ['GOLD', 'PLATINUM', 'VIP'].includes(tierCode.toUpperCase());
  const gradient = isGoldOrAbove
    ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
    : 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)';
  const shadowColor = isGoldOrAbove ? 'rgba(0,0,0,0.15)' : 'rgba(13, 148, 136, 0.2)';

  return (
    <Card
      sx={{
        background: gradient,
        color: '#ffffff',
        borderRadius: 4,
        boxShadow: `0 8px 30px ${shadowColor}`,
        overflow: 'hidden',
        position: 'relative',
        mb: 3,
        border: isGoldOrAbove ? '1px solid rgba(234, 179, 8, 0.3)' : 'none',
      }}
    >
      {/* Decorative premium badge watermark */}
      <Box
        sx={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          opacity: 0.08,
          transform: 'rotate(-15deg)',
        }}
      >
        <CardMembership sx={{ fontSize: 180 }} />
      </Box>

      <CardContent sx={{ p: 3, zIndex: 1, position: 'relative' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <Stack spacing={0.5}>
            <Typography variant="body2" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>
              Thành viên Smart Park
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, letterSpacing: 0.5 }}>
              {userMembership.customer?.fullName}
            </Typography>
          </Stack>
          <Chip
            icon={<WorkspacePremium sx={{ color: '#fbbf24 !important' }} />}
            label={`Hạng ${tierName}`}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontWeight: 800,
              fontFamily: 'Outfit, sans-serif',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          />
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Stars sx={{ color: '#fbbf24' }} />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Tích lũy: <strong>{points} điểm</strong>
            </Typography>
          </Stack>

          {discountPercent > 0 && (
            <Typography variant="subtitle2" sx={{ backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 700 }}>
              Ưu đãi giảm giá {discountPercent}% (-{formatCurrency(discountValue)})
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
