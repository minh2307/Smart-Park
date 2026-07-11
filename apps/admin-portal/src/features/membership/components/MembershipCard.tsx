import React from 'react';
import { Card, CardContent, Typography, Box, Divider, Button } from '@mui/material';
import { MembershipTier } from '../types';
import { MembershipBadge } from './MembershipBadge';
import { MdTrendingUp, MdOutlineSettingsInputComponent, MdEdit } from 'react-icons/md';
import { PermissionWrapper } from '../../../shared/components/PermissionWrapper';

interface MembershipCardProps {
  tier: MembershipTier;
  onEdit: (tier: MembershipTier) => void;
  onSelect: (tier: MembershipTier) => void;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ tier, onEdit, onSelect }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Accent corner tint */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          background: 'linear-gradient(225deg, rgba(25, 118, 210, 0.08) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', zIndex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <MembershipBadge tierCode={tier.code} tierName={tier.name} size="medium" />
          <PermissionWrapper requiredPermission="write:memberships">
            <Button
              size="small"
              variant="text"
              startIcon={<MdEdit />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(tier);
              }}
              sx={{ minWidth: 'auto', p: 0.5 }}
            />
          </PermissionWrapper>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', letterSpacing: 1 }} gutterBottom>
          TIER CODE: {tier.code}
        </Typography>

        <Box display="flex" alignItems="baseline" gap={0.5} my={2}>
          <Typography variant="h3" fontWeight="900" color="primary.main">
            {tier.discountPercentage}%
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
            Discount Rate
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection="column" gap={1.5} sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Min. Required Spend:
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              ${tier.minSpend.toLocaleString()}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Points Multiplier:
            </Typography>
            <Typography variant="body2" fontWeight="bold" display="flex" alignItems="center" gap={0.5}>
              <MdTrendingUp color="#2e7d32" /> {tier.pointsMultiplier}x
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Benefits Count:
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {tier.benefitsCount} privileges
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Active Members:
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {tier.activeMembers} users
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<MdOutlineSettingsInputComponent />}
            onClick={() => onSelect(tier)}
            sx={{ borderRadius: 2 }}
          >
            Configure Rules & Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
