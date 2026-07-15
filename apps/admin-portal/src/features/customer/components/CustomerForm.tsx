import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Box,
} from '@mui/material';
import { Button } from '../../../components/common/Button';
import { customerFormSchema, CustomerFormInput } from '../schemas/customerSchema';
import { Customer } from '../types';
import { mockMembershipTiers } from '../services/customerApi';

interface CustomerFormProps {
  initialData?: Customer | null;
  onSubmit: (data: CustomerFormInput) => void;
  loading?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormInput>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      birthDate: initialData?.birthDate || '',
      gender: (initialData?.gender as any) || '',
      address: initialData?.address || '',
      status: initialData?.status || 'ACTIVE',
      membershipTierId: initialData?.membership?.tier?.id || '',
      initialPoints: initialData?.membership?.points || 0,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Họ và tên *"
                fullWidth
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Địa chỉ email *"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Số điện thoại *"
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="Ngày sinh"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.birthDate}
                helperText={errors.birthDate?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.gender}>
            <InputLabel id="gender-label">Giới tính</InputLabel>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="gender-label" label="Giới tính">
                  <MenuItem value=""><em>Không chọn</em></MenuItem>
                  <MenuItem value="MALE">Nam</MenuItem>
                  <MenuItem value="FEMALE">Nữ</MenuItem>
                  <MenuItem value="OTHER">Khác</MenuItem>
                </Select>
              )}
            />
            {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id="status-label">Trạng thái</InputLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="status-label" label="Trạng thái">
                  <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Ngừng hoạt động</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Địa chỉ thường trú"
                fullWidth
                multiline
                rows={2}
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            )}
          />
        </Grid>

        {/* Membership Details */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.membershipTierId}>
            <InputLabel id="membership-label">Hạng thành viên</InputLabel>
            <Controller
              name="membershipTierId"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="membership-label" label="Hạng thành viên">
                  <MenuItem value=""><em>Không có hạng thành viên</em></MenuItem>
                  {mockMembershipTiers.map((tier) => (
                    <MenuItem key={tier.id} value={tier.id}>
                      {tier.name} (Giảm {tier.discountPercentage}%)
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.membershipTierId && <FormHelperText>{errors.membershipTierId.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="initialPoints"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Số dư điểm thưởng"
                fullWidth
                error={!!errors.initialPoints}
                helperText={errors.initialPoints?.message}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        <Button type="submit" variant="contained" loading={loading}>
          {initialData ? 'Lưu thay đổi' : 'Đăng ký khách hàng'}
        </Button>
      </Box>
    </Box>
  );
};
