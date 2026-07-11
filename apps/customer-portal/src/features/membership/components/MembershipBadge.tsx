import React from 'react';
import { Chip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

interface MembershipBadgeProps {
  tierCode: string;
  tierName: string;
}

export const MembershipBadge: React.FC<MembershipBadgeProps> = ({ tierCode, tierName }) => {
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
    <Chip
      icon={<StarIcon sx={{ color: '#fff !important', fontSize: '1rem' }} />}
      label={tierName.toUpperCase()}
      size="small"
      sx={{
        bgcolor: getTierColor(tierCode),
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '0.75rem',
      }}
    />
  );
};
