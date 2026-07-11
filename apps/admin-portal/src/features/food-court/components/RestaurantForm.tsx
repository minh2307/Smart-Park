import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
} from '@mui/material';
import { Restaurant } from '../types';

const restaurantSchema = z.object({
  restaurantCode: z.string().min(2, 'Mã nhà hàng phải có ít nhất 2 ký tự'),
  restaurantName: z.string().min(3, 'Tên nhà hàng phải có ít nhất 3 ký tự'),
  location: z.string().min(3, 'Vị trí chi tiết phải có ít nhất 3 ký tự'),
  businessHours: z.string().min(5, 'Giờ hoạt động phải có ít nhất 5 ký tự'),
  manager: z.string().min(2, 'Tên người quản lý phải có ít nhất 2 ký tự'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

interface RestaurantFormProps {
  initialValues?: Restaurant | null;
  onSubmit: (values: RestaurantFormData) => void;
  onCancel: () => void;
}

export const RestaurantForm: React.FC<RestaurantFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      restaurantCode: initialValues?.restaurantCode || '',
      restaurantName: initialValues?.restaurantName || '',
      location: initialValues?.location || '',
      businessHours: initialValues?.businessHours || '08:00 - 22:00',
      manager: initialValues?.manager || '',
      status: initialValues?.status || 'ACTIVE',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="restaurantCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Mã Nhà Hàng (Code)"
                error={!!errors.restaurantCode}
                helperText={errors.restaurantCode?.message}
                placeholder="Ví dụ: RES-PHO01"
                disabled={!!initialValues}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="restaurantName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Tên Nhà Hàng"
                error={!!errors.restaurantName}
                helperText={errors.restaurantName?.message}
                placeholder="Ví dụ: Phở Sen Hồ Tây"
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Mô tả vị trí gian hàng"
                error={!!errors.location}
                helperText={errors.location?.message}
                placeholder="Ví dụ: Gian số 101, Tầng 1"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="businessHours"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Giờ hoạt động"
                error={!!errors.businessHours}
                helperText={errors.businessHours?.message}
                placeholder="Ví dụ: 08:00 - 22:00"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="manager"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Người quản lý"
                error={!!errors.manager}
                helperText={errors.manager?.message}
                placeholder="Ví dụ: Nguyễn Văn Hải"
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel>Trạng thái</InputLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Trạng thái">
                  <MenuItem value="ACTIVE">Hoạt Động</MenuItem>
                  <MenuItem value="INACTIVE">Ngừng Hoạt Động</MenuItem>
                  <MenuItem value="MAINTENANCE">Bảo Trì / Sửa Chữa</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="flex-end" gap={1.5} mt={3}>
        <Button onClick={onCancel} variant="outlined">
          Hủy bỏ
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Lưu Lại
        </Button>
      </Box>
    </Box>
  );
};
export default RestaurantForm;
