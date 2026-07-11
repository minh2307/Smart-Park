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
import { Campaign } from '../types';

const campaignSchema = z.object({
  name: z.string().min(1, 'Ten chien dich khong duoc de trong'),
  code: z.string().min(1, 'Ma chien dich khong duoc de trong'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Vui long chon ngay bat dau'),
  endDate: z.string().min(1, 'Vui long chon ngay ket thuc'),
  budget: z.number().min(0, 'Ngan sach phai la so duong'),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']),
  targetAudience: z.string().min(1, 'Doi tuong khach hang khong duoc de trong'),
  targetConversion: z.number().min(0).max(100, 'Ti le chuyen doi trong khoang 0-100'),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Ngay bat dau phai nho hon hoac bang ngay ket thuc',
  path: ['endDate'],
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  initialValues?: Partial<Campaign>;
  onSubmit: (values: CampaignFormValues) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({
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
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: initialValues?.name || '',
      code: initialValues?.code || '',
      description: initialValues?.description || '',
      startDate: initialValues?.startDate || '',
      endDate: initialValues?.endDate || '',
      budget: initialValues?.budget || 0,
      status: initialValues?.status || 'DRAFT',
      targetAudience: initialValues?.targetAudience || '',
      targetConversion: initialValues?.targetConversion || 0,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('name')}
            label="Ten chien dich *"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            {...register('code')}
            label="Ma chien dich *"
            fullWidth
            error={!!errors.code}
            helperText={errors.code?.message}
            disabled={!!initialValues?.id}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register('description')}
            label="Mo ta"
            multiline
            rows={3}
            fullWidth
            error={!!errors.description}
            helperText={errors.description?.message}
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
        <Grid item xs={12} sm={4}>
          <TextField
            {...register('budget', { valueAsNumber: true })}
            label="Ngan sach (USD) *"
            type="number"
            fullWidth
            error={!!errors.budget}
            helperText={errors.budget?.message}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            {...register('targetConversion', { valueAsNumber: true })}
            label="Muc tieu chuyen doi (%) *"
            type="number"
            fullWidth
            error={!!errors.targetConversion}
            helperText={errors.targetConversion?.message}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
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
            <MenuItem value="ACTIVE">Hoat dong</MenuItem>
            <MenuItem value="PAUSED">Tam dung</MenuItem>
            <MenuItem value="COMPLETED">Da hoan thanh</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            {...register('targetAudience')}
            label="Doi tuong khach hang tieu bieu *"
            fullWidth
            error={!!errors.targetAudience}
            helperText={errors.targetAudience?.message}
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
export default CampaignForm;
