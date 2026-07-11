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
import { Supplier } from '../types';

const supplierSchema = z.object({
  supplierCode: z.string().min(2, 'Mã NCC phải có ít nhất 2 ký tự'),
  supplierName: z.string().min(3, 'Tên nhà cung cấp phải có ít nhất 3 ký tự'),
  contactName: z.string().min(2, 'Tên người liên hệ phải có ít nhất 2 ký tự'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  phone: z.string().min(8, 'Số điện thoại phải từ 8 số trở lên'),
  address: z.string().min(3, 'Địa chỉ phải từ 3 ký tự trở lên'),
  status: z.enum(['ACTIVE', 'INACTIVE'] as const),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  initialValues?: Supplier | null;
  onSubmit: (values: SupplierFormData) => void;
  onCancel: () => void;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplierCode: initialValues?.supplierCode || '',
      supplierName: initialValues?.supplierName || '',
      contactName: initialValues?.contactName || '',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      address: initialValues?.address || '',
      status: initialValues?.status || 'ACTIVE',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="supplierCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Mã Nhà Cung Cấp (Code)"
                error={!!errors.supplierCode}
                helperText={errors.supplierCode?.message}
                placeholder="Ví dụ: SUP-SPEEDO"
                disabled={!!initialValues}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="supplierName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Tên Nhà Cung Cấp"
                error={!!errors.supplierName}
                helperText={errors.supplierName?.message}
                placeholder="Ví dụ: Speedo Việt Nam Co."
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="contactName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Người liên hệ"
                error={!!errors.contactName}
                helperText={errors.contactName?.message}
                placeholder="Ví dụ: Mr. Johnathan"
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
                fullWidth
                label="Số điện thoại"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                placeholder="Ví dụ: 0901234567"
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email liên lạc"
                error={!!errors.email}
                helperText={errors.email?.message}
                placeholder="Ví dụ: contact@speedo.vn"
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Địa chỉ trụ sở chính"
                error={!!errors.address}
                helperText={errors.address?.message}
                placeholder="Ví dụ: 120 Nguyễn Văn Linh, Quận 7, TP.HCM"
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
                  <MenuItem value="INACTIVE">Ngừng Hợp Tác</MenuItem>
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
export default SupplierForm;
