import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { profileValidationSchema, type ProfileFormValues } from '../schemas/profile.schema';
import type { CustomerProfile } from '../types/profile.types';

interface ProfileFormProps {
  profile: CustomerProfile;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  isLoading: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileValidationSchema),
    defaultValues: {
      fullName: profile.fullName || '',
      phone: profile.phone || '',
      address: profile.address || '',
      birthDate: profile.birthDate || '',
      gender: profile.gender || 'MALE',
    },
  });

  const selectedGender = watch('gender');

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Typography variant="h6" sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, mb: 3 }}>
        Thông Tin Cá Nhân
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Họ và tên"
            {...register('fullName')}
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.02)',
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Số điện thoại"
            {...register('phone')}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.02)',
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Ngày sinh"
            type="date"
            {...register('birthDate')}
            error={!!errors.birthDate}
            helperText={errors.birthDate?.message}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.02)',
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset" error={!!errors.gender} sx={{ width: '100%' }}>
            <FormLabel component="legend" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1, fontSize: '0.85rem' }}>
              Giới tính
            </FormLabel>
            <RadioGroup
              row
              value={selectedGender}
              onChange={(e) => setValue('gender', e.target.value as any, { shouldValidate: true })}
            >
              <FormControlLabel value="MALE" control={<Radio color="primary" />} label="Nam" />
              <FormControlLabel value="FEMALE" control={<Radio color="primary" />} label="Nữ" />
              <FormControlLabel value="OTHER" control={<Radio color="primary" />} label="Khác" />
            </RadioGroup>
            {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Địa chỉ cư trú"
            multiline
            rows={2}
            {...register('address')}
            error={!!errors.address}
            helperText={errors.address?.message}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.02)',
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={<SaveIcon />}
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
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
