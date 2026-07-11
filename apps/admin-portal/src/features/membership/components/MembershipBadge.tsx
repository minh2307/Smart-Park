import React from 'react';
import { Box, Typography } from '@mui/material';
import { MdStar } from 'react-icons/md';

interface MembershipBadgeProps {
  tierCode: string;
  tierName: string;
  size?: 'small' | 'medium' | 'large';
}

export const MembershipBadge: React.FC<MembershipBadgeProps> = ({ tierCode, tierName, size = 'medium' }) => {
  const getTierStyles = (code: string) => {
    switch (code.toUpperCase()) {
      case 'PLATINUM':
        return {
          bg: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)',
          color: '#0f172a',
          border: '1px solid rgba(255,255,255,0.6)',
          shadow: '0 4px 12px rgba(148, 163, 184, 0.3)',
        };
      case 'GOLD':
        return {
          bg: 'linear-gradient(135deg, #fef08a 0%, #facc15 50%, #eab308 100%)',
          color: '#713f12',
          border: '1px solid rgba(253, 224, 71, 0.8)',
          shadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
        };
      case 'SILVER':
        return {
          bg: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
          color: '#334155',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          shadow: '0 4px 12px rgba(100, 116, 139, 0.2)',
        };
      case 'BRONZE':
      default:
        return {
          bg: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #f97316 100%)',
          color: '#7c2d12',
          border: '1px solid rgba(251, 146, 60, 0.8)',
          shadow: '0 4px 12px rgba(249, 115, 22, 0.2)',
        };
    }
  };

  const styles = getTierStyles(tierCode);
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <Box
      sx={{
        background: styles.bg,
        color: styles.color,
        border: styles.border,
        boxShadow: styles.shadow,
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? 0.5 : 1,
        px: isSmall ? 1.25 : isLarge ? 2.5 : 1.75,
        py: isSmall ? 0.5 : isLarge ? 1 : 0.75,
        borderRadius: 2.5,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      }}
    >
      <MdStar size={isSmall ? 14 : isLarge ? 20 : 16} />
      <Typography
        variant={isSmall ? 'caption' : isLarge ? 'subtitle2' : 'body2'}
        fontWeight="800"
        sx={{ lineHeight: 1 }}
      >
        {tierName}
      </Typography>
    </Box>
  );
};
