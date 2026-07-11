import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
} from '@mui/material';
import { Button } from '../../../components/common/Button';
import { rideCategorySchema, RideCategoryFormInput } from '../schemas/rideCategorySchema';
import { RideCategory } from '../types';

interface RideCategoryFormProps {
  initialData?: RideCategory | null;
  onSubmit: (data: RideCategoryFormInput) => void;
  loading?: boolean;
}

export const RideCategoryForm: React.FC<RideCategoryFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RideCategoryFormInput>({
    resolver: zodResolver(rideCategorySchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
      status: initialData?.status || 'ACTIVE',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Tên danh mục"
                placeholder="VD: Tàu lượn"
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Mã danh mục"
                placeholder="VD: CAT-COASTER"
                error={!!errors.code}
                helperText={errors.code?.message || 'Chữ viết hoa và số, có thể dùng dấu gạch ngang/gạch dưới'}
                disabled={loading || !!initialData}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.status} disabled={loading}>
                <InputLabel id="ride-cat-status-label">Trạng thái *</InputLabel>
                <Select
                  {...field}
                  labelId="ride-cat-status-label"
                  label="Trạng thái *"
                >
                  <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Ngưng hoạt động</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={4}
                label="Mô tả"
                placeholder="Mô tả ngắn gọn về đặc điểm và giới hạn của danh mục"
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button type="submit" variant="contained" loading={loading}>
          {initialData ? 'Cập nhật danh mục' : 'Đăng ký danh mục'}
        </Button>
      </Box>
    </Box>
  );
};
