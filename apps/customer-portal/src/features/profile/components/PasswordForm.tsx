import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  LinearProgress,
  Stack,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { passwordValidationSchema, type PasswordFormValues } from '../schemas/profile.schema';

interface PasswordFormProps {
  onSubmit: (values: PasswordFormValues) => Promise<void>;
  isLoading: boolean;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({ onSubmit, isLoading }) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('Yếu');
  const [strengthColor, setStrengthColor] = useState<'error' | 'warning' | 'info' | 'success'>('error');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordValidationSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = watch('newPassword');

  useEffect(() => {
    if (!newPasswordValue) {
      setStrength(0);
      setStrengthLabel('Yếu');
      setStrengthColor('error');
      return;
    }

    let score = 0;
    if (newPasswordValue.length >= 8) score += 20;
    if (/[a-z]/.test(newPasswordValue)) score += 20;
    if (/[A-Z]/.test(newPasswordValue)) score += 20;
    if (/[0-9]/.test(newPasswordValue)) score += 20;
    if (/[^a-zA-Z0-9]/.test(newPasswordValue)) score += 20;

    setStrength(score);

    if (score <= 40) {
      setStrengthLabel('Yếu');
      setStrengthColor('error');
    } else if (score <= 80) {
      setStrengthLabel('Trung bình');
      setStrengthColor('warning');
    } else {
      setStrengthLabel('Mạnh');
      setStrengthColor('success');
    }
  }, [newPasswordValue]);

  const handleFormSubmit = async (values: PasswordFormValues) => {
    await onSubmit(values);
    reset();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 3 }}>
        Đổi Mật Khẩu
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Mật khẩu hiện tại"
            type={showCurrent ? 'text' : 'password'}
            {...register('currentPassword')}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end">
                    {showCurrent ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.02)',
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Mật khẩu mới"
            type={showNew ? 'text' : 'password'}
            {...register('newPassword')}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNew(!showNew)} edge="end">
                    {showNew ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.02)',
              },
            }}
          />

          {newPasswordValue && (
            <Box sx={{ mt: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="rgba(255,255,255,0.5)">
                  Độ mạnh mật khẩu
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }} color={`${strengthColor}.main`}>
                  {strengthLabel}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={strength}
                color={strengthColor}
                sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.08)' }}
              />
            </Box>
          )}
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Xác nhận mật khẩu mới"
            type={showConfirm ? 'text' : 'password'}
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.02)',
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={<VpnKeyIcon />}
            sx={{
              bgcolor: '#2dd4bf',
              color: '#0f172a',
              fontWeight: 'bold',
              px: 4,
              py: 1.2,
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#14b8a6',
              },
            }}
          >
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
export default PasswordForm;
