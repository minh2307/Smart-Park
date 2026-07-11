import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Button,
  TextField,
  Grid,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Voucher } from '../types';

const voucherSchema = z.object({
  code: z.string().min(1, 'Ma voucher khong duoc de trong'),
  voucherType: z.enum([
    'GIFT',
    'CASH',
    'DISCOUNT',
    'MEMBERSHIP',
    'BIRTHDAY',
    'PROMOTION',
    'REFERRAL',
    'COMPENSATION',
  ]),
  voucherValue: z.number().min(0, 'Gia tri phai la so duong'),
  expirationDate: z.string().min(1, 'Vui long chon ngay het han'),
  assignedCustomer: z.string().nullable().optional(),
  status: z.enum(['UNREDEEMED', 'REDEEMED', 'EXPIRED']),
});

type VoucherFormValues = z.infer<typeof voucherSchema>;

interface VoucherFormProps {
  initialValues?: Partial<Voucher>;
  onSubmit: (values: VoucherFormValues) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const VoucherForm: React.FC<VoucherFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: initialValues?.code || '',
      voucherType: initialValues?.voucherType || 'GIFT',
      voucherValue: initialValues?.voucherValue || 0,
      expirationDate: initialValues?.expirationDate || '',
      assignedCustomer: initialValues?.assignedCustomer || '',
      status: initialValues?.status || 'UNREDEEMED',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('code')}
            label="Ma Voucher *"
            fullWidth
            error={!!errors.code}
            helperText={errors.code?.message}
            disabled={!!initialValues?.id}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            {...register('voucherType')}
            label="Loai Voucher *"
            fullWidth
            defaultValue={initialValues?.voucherType || 'GIFT'}
            onChange={(e) => setValue('voucherType', e.target.value as any)}
            error={!!errors.voucherType}
            helperText={errors.voucherType?.message}
          >
            <MenuItem value="GIFT">Qua tang (Gift)</MenuItem>
            <MenuItem value="CASH">Tien mat (Cash)</MenuItem>
            <MenuItem value="DISCOUNT">Giam gia (Discount)</MenuItem>
            <MenuItem value="MEMBERSHIP">Thanh vien (Membership)</MenuItem>
            <MenuItem value="BIRTHDAY">Sinh nhat (Birthday)</MenuItem>
            <MenuItem value="PROMOTION">Khuyen mai (Promotion)</MenuItem>
            <MenuItem value="REFERRAL">Gioi thieu (Referral)</MenuItem>
            <MenuItem value="COMPENSATION">Den bu (Compensation)</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('voucherValue', { valueAsNumber: true })}
            label="Gia tri voucher (USD) *"
            type="number"
            fullWidth
            error={!!errors.voucherValue}
            helperText={errors.voucherValue?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('expirationDate')}
            label="Ngay het han *"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.expirationDate}
            helperText={errors.expirationDate?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('assignedCustomer')}
            label="Khach hang su dung"
            fullWidth
            placeholder="Ten hoac Email khach hang (neu co)"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            {...register('status')}
            defaultValue={initialValues?.status || 'UNREDEEMED'}
            onChange={(e) => setValue('status', e.target.value as any)}
            label="Trang thai *"
            fullWidth
            error={!!errors.status}
            helperText={errors.status?.message}
          >
            <MenuItem value="UNREDEEMED">Chua su dung</MenuItem>
            <MenuItem value="REDEEMED">Da su dung</MenuItem>
            <MenuItem value="EXPIRED">Het han</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button onClick={onCancel} variant="outlined" color="inherit" disabled={loading}>
          Huy
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Luu'}
        </Button>
      </Box>
    </Box>
  );
};
export default VoucherForm;
