import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { MdCardMembership } from 'react-icons/md';
import { MembershipTier } from '../types';

interface MembershipBadgeProps {
  tier?: MembershipTier;
  size?: 'small' | 'medium';
}

export const MembershipBadge: React.FC<MembershipBadgeProps> = ({ tier, size = 'medium' }) => {
  if (!tier) {
    return (
      <Chip
        icon={<MdCardMembership />}
        label="No Membership"
        size={size}
        variant="outlined"
        sx={{ borderColor: 'text.disabled', color: 'text.disabled' }}
      />
    );
  }

  // Visual configuration per tier
  const tierConfig: Record<string, { bg: string; color: string; label: string }> = {
    BRONZE: {
      bg: 'linear-gradient(135deg, #a75d31 0%, #d88a53 100%)',
      color: '#fff',
      label: 'Bronze Member',
    },
    SILVER: {
      bg: 'linear-gradient(135deg, #707b7c 0%, #b2babb 100%)',
      color: '#fff',
      label: 'Silver Member',
    },
    GOLD: {
      bg: 'linear-gradient(135deg, #d4af37 0%, #f9e79f 100%)',
      color: '#4a3b00',
      label: 'Gold Member',
    },
    PLATINUM: {
      bg: 'linear-gradient(135deg, #1b263b 0%, #5c6b73 100%)',
      color: '#e0e1dd',
      label: 'Platinum VIP',
    },
  };

  const current = tierConfig[tier.code] || {
    bg: 'linear-gradient(135deg, #6c757d 0%, #adb5bd 100%)',
    color: '#fff',
    label: tier.name,
  };

  return (
    <Tooltip title={`Discount: ${tier.discountPercentage}% | Point Multiplier: ${tier.pointsMultiplier}x`} arrow>
      <Chip
        icon={<MdCardMembership style={{ color: current.color }} />}
        label={current.label}
        size={size}
        sx={{
          background: current.bg,
          color: current.color,
          fontWeight: 'bold',
          border: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          '& .MuiChip-icon': {
            color: 'inherit',
          },
        }}
      />
    </Tooltip>
  );
};
