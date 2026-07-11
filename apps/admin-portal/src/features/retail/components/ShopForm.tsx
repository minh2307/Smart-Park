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
import { Shop } from '../types';

const shopSchema = z.object({
  shopCode: z.string().min(2, 'Mã cửa hàng phải có ít nhất 2 ký tự'),
  shopName: z.string().min(3, 'Tên cửa hàng phải có ít nhất 3 ký tự'),
  location: z.string().min(3, 'Vị trí chi tiết phải có ít nhất 3 ký tự'),
  businessHours: z.string().min(5, 'Giờ hoạt động phải có ít nhất 5 ký tự'),
  manager: z.string().min(2, 'Tên người quản lý phải có ít nhất 2 ký tự'),
  category: z.string().min(2, 'Ngành hàng/Phân loại phải từ 2 ký tự'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE'] as const),
});

type ShopFormData = z.infer<typeof shopSchema>;

interface ShopFormProps {
  initialValues?: Shop | null;
  onSubmit: (values: ShopFormData) => void;
  onCancel: () => void;
}

export const ShopForm: React.FC<ShopFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      shopCode: initialValues?.shopCode || '',
      shopName: initialValues?.shopName || '',
      location: initialValues?.location || '',
      businessHours: initialValues?.businessHours || '08:00 - 22:00',
      manager: initialValues?.manager || '',
      category: initialValues?.category || 'Thời Trang',
      status: initialValues?.status || 'ACTIVE',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="shopCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Mã Cửa Hàng (Code)"
                error={!!errors.shopCode}
                helperText={errors.shopCode?.message}
                placeholder="Ví dụ: SHP-SOUV01"
                disabled={!!initialValues}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="shopName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Tên Cửa Hàng"
                error={!!errors.shopName}
                helperText={errors.shopName?.message}
                placeholder="Ví dụ: Quầy Lưu Niệm GateOS"
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
                label="Địa điểm / Khu vực"
                error={!!errors.location}
                helperText={errors.location?.message}
                placeholder="Ví dụ: Cổng chính - Khu A"
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
                placeholder="Ví dụ: 08:00 - 21:00"
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
                label="Người phụ trách"
                error={!!errors.manager}
                helperText={errors.manager?.message}
                placeholder="Ví dụ: Phạm Thị Thùy"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Ngành Hàng / Phân Loại"
                error={!!errors.category}
                helperText={errors.category?.message}
                placeholder="Ví dụ: Quà Lưu Niệm"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
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
export default ShopForm;
