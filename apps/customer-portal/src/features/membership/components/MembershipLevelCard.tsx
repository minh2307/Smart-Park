import React from 'react';
import { Card, CardContent, Typography, Stack, Chip, Divider, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { MembershipTier } from '../types/membership.types';

interface MembershipLevelCardProps {
  tier: MembershipTier;
  isCurrent: boolean;
}

export const MembershipLevelCard: React.FC<MembershipLevelCardProps> = ({ tier, isCurrent }) => {
  const theme = useTheme();

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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: isCurrent ? 'rgba(30, 41, 59, 0.6)' : 'rgba(30, 41, 59, 0.2)',
        backdropFilter: 'blur(20px)',
        border: isCurrent ? `2px solid ${getTierColor(tier.code)}` : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isCurrent ? getTierGlow(tier.code) : 'none',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        p: 1.5,
      }}
    >
      {isCurrent && (
        <Chip
          label="Hạng thẻ của bạn"
          size="small"
          sx={{
            position: 'absolute',
            top: 15,
            right: 15,
            bgcolor: '#2dd4bf',
            color: '#0f172a',
            fontWeight: 'bold',
          }}
        />
      )}

      <CardContent sx={{ p: 2.5 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 800,
            color: getTierColor(tier.code),
            mb: 1,
          }}
        >
          {tier.name}
        </Typography>

        <Typography variant="body2" color="rgba(255,255,255,0.4)" sx={{ mb: 3 }}>
          Mốc chi tiêu: {tier.minSpend === 0 ? 'Mặc định khi đăng ký' : `Từ ${tier.minSpend.toLocaleString('vi-VN')} VND`}
        </Typography>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 3 }} />

        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircleIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />
            <Typography variant="body2">
              Giảm giá dịch vụ: <strong>{tier.discountPercentage}%</strong>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircleIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />
            <Typography variant="body2">
              Hệ số tích điểm: <strong>x{tier.pointsMultiplier}</strong>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircleIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />
            <Typography variant="body2">
              {tier.code === 'SILVER' ? 'Hỗ trợ dịch vụ cơ bản' : tier.code === 'GOLD' ? 'Ưu tiên check-in cổng phụ' : 'VIP Fast-Pass & Quầy check-in riêng'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CheckCircleIcon sx={{ fontSize: 18, color: '#2dd4bf' }} />
            <Typography variant="body2">
              {tier.code === 'SILVER' ? 'Khuyến mãi theo chiến dịch' : tier.code === 'GOLD' ? 'Quà tặng ngày sinh nhật' : 'Tham dự Show sự kiện độc quyền & Birthday Combo'}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
