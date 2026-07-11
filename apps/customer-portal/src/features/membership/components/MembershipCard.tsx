import React from 'react';
import { Card, CardContent, Typography, Box, Stack, Chip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import type { Membership } from '../types/membership.types';

interface MembershipCardProps {
  membership: Membership;
  customerName: string;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ membership, customerName }) => {
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

  const getTierGlow = (code: string) => {
    switch (code) {
      case 'PLATINUM':
        return '0 8px 32px rgba(2, 136, 209, 0.25)';
      case 'GOLD':
        return '0 8px 32px rgba(237, 108, 2, 0.25)';
      case 'SILVER':
      default:
        return '0 8px 24px rgba(255, 255, 255, 0.05)';
    }
  };

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${getTierColor(membership.tier.code)}50`,
        boxShadow: getTierGlow(membership.tier.code),
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        height: 260,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 3,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${getTierColor(membership.tier.code)}40 0%, transparent 70%)`,
          filter: 'blur(10px)',
        }}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ zIndex: 2 }}>
        <Stack>
          <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#ffffff' }}>
            SMART PARK VIP CARD
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
            Mã số: {membership.membershipCode}
          </Typography>
        </Stack>
        <Chip
          icon={<StarIcon sx={{ color: '#fff !important' }} />}
          label={membership.tier.name.toUpperCase()}
          sx={{
            bgcolor: getTierColor(membership.tier.code),
            color: '#fff',
            fontWeight: 'bold',
          }}
        />
      </Stack>

      <Box sx={{ zIndex: 2 }}>
        <Typography variant="h5" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 0.5 }}>
          {customerName}
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.5)">
          Ngày tham gia: {membership.joinDate}
        </Typography>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
        <Stack>
          <Typography variant="caption" color="rgba(255,255,255,0.4)">
            Điểm tích lũy hiện tại
          </Typography>
          <Typography variant="h4" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: '#2dd4bf' }}>
            {membership.points} <span style={{ fontSize: '1rem', fontWeight: 500 }}>điểm</span>
          </Typography>
        </Stack>
        <Chip
          size="small"
          label={membership.status}
          color="success"
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      </Stack>
    </Card>
  );
};
