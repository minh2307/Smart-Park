import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
} from '@mui/material';
import { parkingAreaSchema, ParkingAreaFormValues } from '../schemas/parkingSchema';
import { ParkingArea } from '../types';

interface ParkingFormProps {
  initialValues?: ParkingArea;
  onSubmit: (values: ParkingAreaFormValues) => void;
  onCancel: () => void;
}

export const ParkingForm: React.FC<ParkingFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ParkingAreaFormValues>({
    resolver: zodResolver(parkingAreaSchema),
    defaultValues: {
      code: initialValues?.code || '',
      name: initialValues?.name || '',
      parkId: initialValues?.parkId || 1,
      totalSpaces: initialValues?.totalSpaces || 100,
      operatingHours: initialValues?.operatingHours || '08:00 - 22:00',
      pricingPolicy: initialValues?.pricingPolicy || 'Xe máy: 5k, Ô tô: 30k/lượt',
      description: initialValues?.description || '',
      status: initialValues?.status || 'ACTIVE',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Mã Bãi Đỗ Xe (Code)"
            {...register('code')}
            error={!!errors.code}
            helperText={errors.code?.message}
            disabled={!!initialValues}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tên Bãi Đỗ Xe"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.parkId}>
            <InputLabel id="form-park-select">Khu Vực Công Viên (Venue)</InputLabel>
            <Controller
              name="parkId"
              control={control}
              render={({ field }) => (
                <Select labelId="form-park-select" label="Khu Vực Công Viên (Venue)" {...field}>
                  <MenuItem value={1}>Đầm Sen Cultural Park</MenuItem>
                  <MenuItem value={2}>Suối Tiên Theme Park</MenuItem>
                </Select>
              )}
            />
            {errors.parkId && <FormHelperText>{errors.parkId.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="Tổng Số Chỗ Đỗ (Capacity)"
            {...register('totalSpaces', { valueAsNumber: true })}
            error={!!errors.totalSpaces}
            helperText={errors.totalSpaces?.message}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Giờ Hoạt Động"
            {...register('operatingHours')}
            error={!!errors.operatingHours}
            helperText={errors.operatingHours?.message}
            placeholder="Ví dụ: 06:00 - 22:00"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id="form-status-select">Trạng Thái</InputLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select labelId="form-status-select" label="Trạng Thái" {...field}>
                  <MenuItem value="ACTIVE">Hoạt động (ACTIVE)</MenuItem>
                  <MenuItem value="INACTIVE">Ngừng hoạt động (INACTIVE)</MenuItem>
                  <MenuItem value="MAINTENANCE">Bảo trì (MAINTENANCE)</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Chính Sách Tính Phí"
            {...register('pricingPolicy')}
            error={!!errors.pricingPolicy}
            helperText={errors.pricingPolicy?.message}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Mô tả bãi đỗ xe"
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
        <Button onClick={onCancel} variant="outlined">
          Hủy
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Lưu Lại
        </Button>
      </Box>
    </Box>
  );
};
export default ParkingForm;
