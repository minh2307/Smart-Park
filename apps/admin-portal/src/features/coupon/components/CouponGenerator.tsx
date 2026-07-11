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
  Typography,
} from '@mui/material';
import { useGetCampaignsQuery } from '../../campaign/services/campaignApi';

const generatorSchema = z.object({
  name: z.string().min(1, 'Ten nhom coupon khong duoc de trong'),
  campaignId: z.number().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().min(0, 'Gia tri khong hop le'),
  quantity: z.number().min(1, 'So luong su dung cua moi code phai tu 1'),
  expirationDate: z.string().min(1, 'Vui long chon ngay het han'),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  length: z.number().min(4, 'Do dai phai tu 4 ki tu').max(16, 'Do dai toi da 16 ki tu'),
  format: z.enum(['ALPHANUMERIC', 'NUMERIC', 'ALPHA']),
  count: z.number().min(1, 'So luong ma phat sinh phai tu 1').max(500, 'Gioi han phat sinh toi da 500 ma'),
});

type GeneratorFormValues = z.infer<typeof generatorSchema>;

interface CouponGeneratorProps {
  onSubmit: (values: GeneratorFormValues) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const CouponGenerator: React.FC<CouponGeneratorProps> = ({
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
  } = useForm<GeneratorFormValues>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      name: '',
      campaignId: null,
      discountType: 'PERCENTAGE',
      discountValue: 0,
      quantity: 1,
      expirationDate: '',
      prefix: 'SUMMER-',
      suffix: '',
      length: 8,
      format: 'ALPHANUMERIC',
      count: 10,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Phat sinh hang loat ma coupon ngau nhien dua theo dinh dang tuy chon.
      </Typography>

      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('name')}
            label="Ten chung cua nhom coupon *"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Thuoc Chien dich"
            fullWidth
            defaultValue=""
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
            {...register('discountType')}
            label="Kieu giam gia *"
            fullWidth
            defaultValue="PERCENTAGE"
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
            label="So luong dung cua moi ma *"
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

        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" mt={2}>
            Tuy chon dinh dang ma code
          </Typography>
        </Grid>

        <Grid item xs={12} sm={3}>
          <TextField
            {...register('prefix')}
            label="Tien to (Prefix)"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            {...register('suffix')}
            label="Hau to (Suffix)"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            {...register('length', { valueAsNumber: true })}
            label="Do dai phan ngau nhien *"
            type="number"
            fullWidth
            error={!!errors.length}
            helperText={errors.length?.message}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            {...register('format')}
            defaultValue="ALPHANUMERIC"
            onChange={(e) => setValue('format', e.target.value as any)}
            label="Dinh dang chuoi *"
            fullWidth
          >
            <MenuItem value="ALPHANUMERIC">Chu & So (A-Z, 0-9)</MenuItem>
            <MenuItem value="NUMERIC">Chi gom so (0-9)</MenuItem>
            <MenuItem value="ALPHA">Chi gom chu (A-Z)</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            {...register('count', { valueAsNumber: true })}
            label="So luong ma can phat sinh hang loat *"
            type="number"
            fullWidth
            error={!!errors.count}
            helperText={errors.count?.message}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        <Button onClick={onCancel} variant="outlined" color="inherit" disabled={loading}>
          Huy
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Phat sinh'}
        </Button>
      </Box>
    </Box>
  );
};
export default CouponGenerator;
