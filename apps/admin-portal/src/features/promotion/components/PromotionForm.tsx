import React, { useEffect } from 'react';
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
  Divider,
} from '@mui/material';
import { Promotion } from '../types';
import { useGetCampaignsQuery } from '../../campaign/services/campaignApi';
import DiscountRuleBuilder from './DiscountRuleBuilder';
import EligibilityRuleBuilder from './EligibilityRuleBuilder';

const promotionSchema = z.object({
  code: z.string().min(1, 'Ma khuyen mai khong duoc de trong'),
  name: z.string().min(1, 'Ten khuyen mai khong duoc de trong'),
  description: z.string().optional(),
  campaignId: z.number().nullable(),
  promotionType: z.enum(['DISCOUNT', 'BOGO', 'COMBO', 'FLASH_SALE', 'EARLY_BIRD']),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().min(0, 'Gia tri khong hop le'),
  maxDiscount: z.number().nullable().optional(),
  minOrderAmount: z.number().nullable().optional(),
  maxUsage: z.number().nullable().optional(),
  usagePerCustomer: z.number().nullable().optional(),
  priority: z.number().min(1, 'Uu tien tu 1 tro len'),
  stackable: z.boolean(),
  startDate: z.string().min(1, 'Ngay bat dau khong duoc de trong'),
  endDate: z.string().min(1, 'Ngay ket thuc khong duoc de trong'),
  applicableVenues: z.array(z.string()),
  applicableTicketTypes: z.array(z.string()),
  applicableMemberships: z.array(z.string()),
  applicableCustomerGroups: z.array(z.string()),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'EXPIRED', 'ARCHIVED', 'CANCELLED']),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Ngay bat dau phai nho hon hoac bang ngay ket thuc',
  path: ['endDate'],
});

type PromotionFormValues = z.infer<typeof promotionSchema>;

interface PromotionFormProps {
  initialValues?: Partial<Promotion>;
  onSubmit: (values: PromotionFormValues) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const PromotionForm: React.FC<PromotionFormProps> = ({
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
    watch,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      code: initialValues?.code || '',
      name: initialValues?.name || '',
      description: initialValues?.description || '',
      campaignId: initialValues?.campaignId || null,
      promotionType: initialValues?.promotionType || 'DISCOUNT',
      discountType: initialValues?.discountType || 'PERCENTAGE',
      discountValue: initialValues?.discountValue || 0,
      maxDiscount: initialValues?.maxDiscount || null,
      minOrderAmount: initialValues?.minOrderAmount || null,
      maxUsage: initialValues?.maxUsage || null,
      usagePerCustomer: initialValues?.usagePerCustomer || null,
      priority: initialValues?.priority || 1,
      stackable: initialValues?.stackable || false,
      startDate: initialValues?.startDate || '',
      endDate: initialValues?.endDate || '',
      applicableVenues: initialValues?.applicableVenues || [],
      applicableTicketTypes: initialValues?.applicableTicketTypes || [],
      applicableMemberships: initialValues?.applicableMemberships || [],
      applicableCustomerGroups: initialValues?.applicableCustomerGroups || [],
      status: initialValues?.status || 'DRAFT',
    },
  });

  const watchPromotionType = watch('promotionType');
  const watchDiscountType = watch('discountType');

  // Register autocomplete fields manually
  useEffect(() => {
    register('applicableVenues');
    register('applicableTicketTypes');
    register('applicableMemberships');
    register('applicableCustomerGroups');
  }, [register]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('name')}
            label="Ten khuyen mai *"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('code')}
            label="Ma khuyen mai *"
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
            defaultValue={initialValues?.status || 'DRAFT'}
            onChange={(e) => setValue('status', e.target.value as any)}
            label="Trang thai *"
            fullWidth
            error={!!errors.status}
            helperText={errors.status?.message}
          >
            <MenuItem value="DRAFT">Nhao</MenuItem>
            <MenuItem value="SCHEDULED">Da len lich</MenuItem>
            <MenuItem value="ACTIVE">Hoat dong</MenuItem>
            <MenuItem value="PAUSED">Tam dung</MenuItem>
            <MenuItem value="EXPIRED">Het han</MenuItem>
            <MenuItem value="ARCHIVED">Luu tru</MenuItem>
            <MenuItem value="CANCELLED">Huy</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register('description')}
            label="Mo ta khuyen mai"
            multiline
            rows={3}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('startDate')}
            label="Ngay bat dau *"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.startDate}
            helperText={errors.startDate?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('endDate')}
            label="Ngay ket thuc *"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.endDate}
            helperText={errors.endDate?.message}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        {/* Discount Rules */}
        <Grid item xs={12}>
          <DiscountRuleBuilder
            register={register}
            setValue={setValue}
            errors={errors}
            watchPromotionType={watchPromotionType}
            watchDiscountType={watchDiscountType}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        {/* Eligibility Rules */}
        <Grid item xs={12}>
          <EligibilityRuleBuilder
            setValue={setValue}
            initialVenues={initialValues?.applicableVenues}
            initialTicketTypes={initialValues?.applicableTicketTypes}
            initialMemberships={initialValues?.applicableMemberships}
            initialCustomerGroups={initialValues?.applicableCustomerGroups}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
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
export default PromotionForm;
