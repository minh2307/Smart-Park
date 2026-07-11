import React from 'react';
import { Card, CardContent, Typography, Grid, Stack, Switch, FormControlLabel, Box, Chip } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyIcon from '@mui/icons-material/Key';

interface AccountSecurityCardProps {
  lastLogin: string;
  twoFactorEnabled: boolean;
  onToggleTwoFactor: (enabled: boolean) => void;
  activeSessionsCount: number;
}

export const AccountSecurityCard: React.FC<AccountSecurityCardProps> = ({
  lastLogin,
  twoFactorEnabled,
  onToggleTwoFactor,
  activeSessionsCount,
}) => {
  return (
    <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 3 }}>
          Thông Tin Bảo Mật
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <KeyIcon sx={{ color: '#2dd4bf' }} />
                <Typography variant="caption" color="rgba(255,255,255,0.5)">Đăng nhập gần nhất</Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{lastLogin}</Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SecurityIcon sx={{ color: '#2dd4bf' }} />
                <Typography variant="caption" color="rgba(255,255,255,0.5)">Số phiên hoạt động</Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{activeSessionsCount} thiết bị</Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ShieldIcon sx={{ color: '#2dd4bf' }} />
                <Typography variant="caption" color="rgba(255,255,255,0.5)">Bảo mật 2 lớp (2FA)</Typography>
              </Stack>
              <Chip
                label={twoFactorEnabled ? 'BẬT' : 'TẮT'}
                color={twoFactorEnabled ? 'success' : 'default'}
                size="small"
                sx={{ fontWeight: 'bold', width: 'fit-content' }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={twoFactorEnabled}
                  onChange={(e) => onToggleTwoFactor(e.target.checked)}
                  color="primary"
                />
              }
              label="Kích hoạt xác minh hai yếu tố (Nhận mã OTP qua số điện thoại/Email khi đăng nhập)"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export default AccountSecurityCard;
