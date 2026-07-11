import React from 'react';
import { Box, Chip, Skeleton } from '@mui/material';
import { LocalOffer, Stars, FamilyRestroom, CardMembership, ConfirmationNumber } from '@mui/icons-material';
import type { TicketCategory } from '../types/ticket.types';

interface TicketBadgeProps {
  category?: TicketCategory;
  isPromotion?: boolean;
  discountPercent?: number;
  isPopular?: boolean;
  size?: 'small' | 'medium';
}

const CATEGORY_CONFIG: Record<TicketCategory, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  STANDARD: { label: 'Tiêu Chuẩn', color: '#0f766e', bg: '#f0fdf9', icon: <ConfirmationNumber fontSize="small" /> },
  COMBO: { label: 'Combo', color: '#7c3aed', bg: '#f5f3ff', icon: <LocalOffer fontSize="small" /> },
  VIP: { label: 'VIP', color: '#b45309', bg: '#fffbeb', icon: <Stars fontSize="small" /> },
  FAMILY: { label: 'Gia Đình', color: '#0369a1', bg: '#f0f9ff', icon: <FamilyRestroom fontSize="small" /> },
  SEASONAL: { label: 'Theo Mùa', color: '#be185d', bg: '#fdf2f8', icon: <CardMembership fontSize="small" /> },
};

export const TicketBadge: React.FC<TicketBadgeProps> = ({
  category,
  isPromotion,
  discountPercent,
  isPopular,
  size = 'small',
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
      {category && (
        <Chip
          size={size}
          label={CATEGORY_CONFIG[category].label}
          icon={
            <Box sx={{ color: CATEGORY_CONFIG[category].color, display: 'flex', alignItems: 'center' }}>
              {CATEGORY_CONFIG[category].icon}
            </Box>
          }
          sx={{
            backgroundColor: CATEGORY_CONFIG[category].bg,
            color: CATEGORY_CONFIG[category].color,
            fontWeight: 600,
            fontSize: '0.7rem',
            border: `1px solid ${CATEGORY_CONFIG[category].color}22`,
          }}
        />
      )}
      {isPopular && (
        <Chip
          size={size}
          label="Phổ Biến"
          sx={{
            backgroundColor: '#fef3c7',
            color: '#92400e',
            fontWeight: 700,
            fontSize: '0.7rem',
            border: '1px solid #fde68a',
          }}
        />
      )}
      {isPromotion && discountPercent && discountPercent > 0 && (
        <Chip
          size={size}
          label={`-${discountPercent}%`}
          sx={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            fontWeight: 700,
            fontSize: '0.7rem',
            border: '1px solid #fecaca',
          }}
        />
      )}
    </Box>
  );
};

export const TicketBadgeSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', gap: 0.75 }}>
    <Skeleton variant="rounded" width={70} height={22} />
    <Skeleton variant="rounded" width={55} height={22} />
  </Box>
);
