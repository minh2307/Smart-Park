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
import { Coupon } from '../types';
import { useGetCampaignsQuery } from '../../campaign/services/campaignApi';

const couponSchema = z.object({
  code: z.string().min(1, 'Ma coupon khong duoc de trong'),
  name: z.string().min(1, 'Ten coupon khong duoc de trong'),
  campaignId: z.number().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().min(0, 'Gia tri khong hop le'),
  quantity: z.number().min(1, 'So luong phai tu 1 tro len'),
  expirationDate: z.string().min(1, 'Vui long chon ngay het han'),
  status: z.enum(['ACTIVE', 'EXPIRED', 'PAUSED']),
});

type CouponFormValues = z.infer<typeof couponSchema>;

interface CouponFormProps {
  initialValues?: Partial<Coupon>;
  onSubmit: (values: CouponFormValues) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const CouponForm: React.FC<CouponFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { data: campaignList } = useGetCampaignsQuery({});
  const campaigns = campaignList?.content || [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: initialValues?.code || '',
      name: initialValues?.name || '',
      campaignId: initialValues?.campaignId || null,
      discountType: initialValues?.discountType || 'PERCENTAGE',
      discountValue: initialValues?.discountValue || 0,
      quantity: initialValues?.quantity || 100,
      expirationDate: initialValues?.expirationDate || '',
      status: initialValues?.status || 'ACTIVE',
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('name')}
            label="Ten Coupon *"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('code')}
            label="Ma Coupon *"
            fullWidth
            error={!!errors.code}
            helperText={errors.code?.message}
            disabled={!!initialValues?.id}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Thuoc Chien dich"
            fullWidth
            defaultValue={initialValues?.campaignId || ''}
            onChange={(e) => setValue('campaignId', e.target.value ? Number(e.target.value) : null)}
          >
            <MenuItem value="">Khong thuoc chien dich</MenuItem>
            {campaigns.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            {...register('status')}
            defaultValue={initialValues?.status || 'ACTIVE'}
            onChange={(e) => setValue('status', e.target.value as any)}
            label="Trang thai *"
            fullWidth
            error={!!errors.status}
            helperText={errors.status?.message}
          >
            <MenuItem value="ACTIVE">Hoat dong</MenuItem>
            <MenuItem value="PAUSED">Tam dung</MenuItem>
            <MenuItem value="EXPIRED">Het han</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            {...register('discountType')}
            label="Kieu giam gia *"
            fullWidth
            defaultValue={initialValues?.discountType || 'PERCENTAGE'}
            onChange={(e) => setValue('discountType', e.target.value as any)}
            error={!!errors.discountType}
            helperText={errors.discountType?.message}
          >
            <MenuItem value="PERCENTAGE">Phan tram (%)</MenuItem>
            <MenuItem value="FIXED_AMOUNT">So tien (USD)</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('discountValue', { valueAsNumber: true })}
            label="Gia tri giam gia *"
            type="number"
            fullWidth
            error={!!errors.discountValue}
            helperText={errors.discountValue?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('quantity', { valueAsNumber: true })}
            label="So luong phat hanh *"
            type="number"
            fullWidth
            error={!!errors.quantity}
            helperText={errors.quantity?.message}
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
export default CouponForm;
