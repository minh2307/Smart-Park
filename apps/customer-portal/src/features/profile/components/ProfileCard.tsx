import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Stack, Chip, Divider, useTheme } from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import StarsIcon from '@mui/icons-material/Stars';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import type { CustomerProfile } from '../types/profile.types';

interface ProfileCardProps {
  profile: CustomerProfile;
  email: string;
  avatarUrl: string | null;
  tierName: string;
  points: number;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  email,
  avatarUrl,
  tierName,
  points,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Glow background accent */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.15) 0%, transparent 70%)',
          filter: 'blur(10px)',
        }}
      />

      <CardContent sx={{ p: 4, zIndex: 2, position: 'relative' }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          {/* Avatar display */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={avatarUrl || undefined}
              alt={profile.fullName}
              sx={{
                width: 110,
                height: 110,
                fontSize: '2.5rem',
                fontWeight: 'bold',
                bgcolor: '#2dd4bf',
                color: '#0f172a',
                border: '3px solid rgba(45, 212, 191, 0.4)',
                boxShadow: '0 4px 20px rgba(45, 212, 191, 0.2)',
              }}
            >
              {!avatarUrl && profile.fullName ? profile.fullName.charAt(0) : 'U'}
            </Avatar>
            <Chip
              label="Hoạt động"
              size="small"
              color="success"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                fontWeight: 'bold',
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Box>

          <Box>
            <Typography variant="h5" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, mb: 0.5 }}>
              {profile.fullName || 'Khách Hàng'}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              <WorkspacePremiumIcon sx={{ color: '#fbbf24', fontSize: '1.2rem' }} />
              <Typography variant="subtitle2" sx={{ color: '#fbbf24', fontWeight: 700 }}>
                Hạng {tierName}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 3 }} />

        {/* Detailed details */}
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2} alignItems="center">
            <EmailIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
            <Box>
              <Typography variant="caption" display="block" color="rgba(255,255,255,0.4)">
                Email đăng ký
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{email}</Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <PhoneIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
            <Box>
              <Typography variant="caption" display="block" color="rgba(255,255,255,0.4)">
                Số điện thoại
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{profile.phone || 'Chưa cập nhật'}</Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <StarsIcon sx={{ color: '#2dd4bf' }} />
            <Box>
              <Typography variant="caption" display="block" color="rgba(255,255,255,0.4)">
                Điểm tích lũy Smart Park
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#2dd4bf' }}>
                {points} điểm
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <CalendarMonthIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
            <Box>
              <Typography variant="caption" display="block" color="rgba(255,255,255,0.4)">
                Ngày gia nhập
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {profile.createdAt ? profile.createdAt.split('T')[0] : 'Chưa có thông tin'}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
