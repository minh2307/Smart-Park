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
import { Category } from '../types';

const categorySchema = z.object({
  categoryName: z.string().min(2, 'Tên danh mục phải từ 2 ký tự trở lên'),
  description: z.string().optional(),
  sortOrder: z.number().min(1, 'Thứ tự hiển thị phải tối thiểu là 1'),
  status: z.enum(['ACTIVE', 'INACTIVE'] as const),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialValues?: Category | null;
  onSubmit: (values: CategoryFormData) => void;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: initialValues?.categoryName || '',
      description: initialValues?.description || '',
      sortOrder: initialValues?.sortOrder || 1,
      status: initialValues?.status || 'ACTIVE',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="categoryName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Tên Danh Mục"
                error={!!errors.categoryName}
                helperText={errors.categoryName?.message}
                placeholder="Ví dụ: Kính & Mũ Bơi"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="sortOrder"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Thứ tự hiển thị"
                error={!!errors.sortOrder}
                helperText={errors.sortOrder?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <MenuItem value="INACTIVE">Ngừng Sử Dụng</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
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
                rows={3}
                label="Mô tả danh mục"
                placeholder="Nhập ghi chú hoặc mô tả về danh mục sản phẩm này..."
              />
            )}
          />
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
export default CategoryForm;
