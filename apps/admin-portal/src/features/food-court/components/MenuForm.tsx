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
import { MenuItem as FoodMenuItem } from '../types';

const menuSchema = z.object({
  itemName: z.string().min(2, 'Tên món ăn phải có ít nhất 2 ký tự'),
  categoryName: z.string().min(2, 'Danh mục món ăn phải có ít nhất 2 ký tự'),
  price: z.number().min(0, 'Giá tiền không được nhỏ hơn 0'),
  discount: z.number().min(0).max(100, 'Chiết khấu từ 0% đến 100%'),
  preparationTime: z.number().min(1, 'Thời gian chuẩn bị phải ít nhất 1 phút'),
  calories: z.number().min(0, 'Lượng calo không được nhỏ hơn 0'),
  description: z.string().min(5, 'Mô tả món ăn phải từ 5 ký tự'),
  status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'OUT_OF_STOCK'] as const),
});

type MenuFormData = z.infer<typeof menuSchema>;

interface MenuFormProps {
  initialValues?: FoodMenuItem | null;
  onSubmit: (values: MenuFormData) => void;
  onCancel: () => void;
}

export const MenuForm: React.FC<MenuFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      itemName: initialValues?.itemName || '',
      categoryName: initialValues?.categoryName || '',
      price: initialValues?.price || 0,
      discount: initialValues?.discount || 0,
      preparationTime: initialValues?.preparationTime || 10,
      calories: initialValues?.calories || 300,
      description: initialValues?.description || '',
      status: initialValues?.status || 'AVAILABLE',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="itemName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Tên Món Ăn"
                error={!!errors.itemName}
                helperText={errors.itemName?.message}
                placeholder="Ví dụ: Phở Bò Tái Lăn"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="categoryName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Phân Loại / Danh Mục"
                error={!!errors.categoryName}
                helperText={errors.categoryName?.message}
                placeholder="Ví dụ: Phở & Bún"
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Giá bán (VNĐ)"
                error={!!errors.price}
                helperText={errors.price?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="discount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Chiết khấu (%)"
                error={!!errors.discount}
                helperText={errors.discount?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="preparationTime"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Thời gian chế biến (phút)"
                error={!!errors.preparationTime}
                helperText={errors.preparationTime?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="calories"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Lượng Calo (Kcal)"
                error={!!errors.calories}
                helperText={errors.calories?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
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
                rows={3}
                label="Mô tả món ăn"
                error={!!errors.description}
                helperText={errors.description?.message}
                placeholder="Nhập mô tả nguyên liệu, hương vị..."
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
                  <MenuItem value="AVAILABLE">Có Sẵn</MenuItem>
                  <MenuItem value="UNAVAILABLE">Không Phục Vụ</MenuItem>
                  <MenuItem value="OUT_OF_STOCK">Tạm Thời Hết Hàng</MenuItem>
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
export default MenuForm;
