import React from 'react';
import { useForm } from 'react-hook-form';
import { Grid, TextField, Button, Box, Typography } from '@mui/material';
import { Locker } from '../types';

interface LockerRentalFormProps {
  locker: Locker;
  onSubmit: (values: { customerName: string; deposit: number }) => void;
  onCancel: () => void;
}

export const LockerRentalForm: React.FC<LockerRentalFormProps> = ({ locker, onSubmit, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ customerName: string; deposit: number }>({
    defaultValues: {
      customerName: '',
      deposit: 50000,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Cho thuê tủ đồ: {locker.lockerCode} ({locker.size})
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Vui lòng nhập thông tin của khách hàng để tiến hành kích hoạt mã tủ đồ thông minh.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Họ tên Khách Hàng"
            {...register('customerName', { required: 'Họ tên khách hàng là bắt buộc' })}
            error={!!errors.customerName}
            helperText={errors.customerName?.message}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="Số tiền đặt cọc (VNĐ)"
            {...register('deposit', {
              required: 'Tiền đặt cọc là bắt buộc',
              valueAsNumber: true,
              min: { value: 10000, message: 'Số tiền tối thiểu là 10,000đ' },
            })}
            error={!!errors.deposit}
            helperText={errors.deposit?.message}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 4 }}>
        <Button onClick={onCancel} variant="outlined">
          Hủy bỏ
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Xác nhận thuê tủ
        </Button>
      </Box>
    </Box>
  );
};
export default LockerRentalForm;
