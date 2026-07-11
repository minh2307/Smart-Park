import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Grid } from '@mui/material';
import { TextField, Select } from '../../../components/common/Form';
import { Button } from '../../../components/common/Button';
import { UploadVenueImage } from './UploadVenueImage';
import { venueSchema, VenueInput } from '../schemas/venueSchema';
import { Venue } from '../types';

interface VenueFormProps {
  initialData?: Venue;
  onSubmit: (data: VenueInput & { logoUrl?: string; coverImageUrl?: string }) => void;
  loading?: boolean;
}

export const VenueForm: React.FC<VenueFormProps> = ({ initialData, onSubmit, loading = false }) => {
  const isEdit = !!initialData;
  const initialStatus = initialData
    ? typeof initialData.status === 'number'
      ? initialData.status === 1 ? 'ACTIVE' : 'INACTIVE'
      : initialData.status
    : 'ACTIVE';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(venueSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          venueCode: initialData.venueCode,
          description: initialData.description || '',
          address: initialData.address,
          city: initialData.city,
          provinceState: initialData.provinceState || '',
          country: initialData.country,
          postalCode: initialData.postalCode || '',
          phone: initialData.phone || '',
          email: initialData.email || '',
          website: initialData.website || '',
          openingTime: initialData.openingTime || '08:00',
          closingTime: initialData.closingTime || '22:00',
          status: initialStatus,
          logoUrl: initialData.logoUrl || '',
          coverImageUrl: initialData.coverImageUrl || '',
        }
      : {
          name: '',
          venueCode: '',
          description: '',
          address: '',
          city: '',
          provinceState: '',
          country: '',
          postalCode: '',
          phone: '',
          email: '',
          website: '',
          openingTime: '08:00',
          closingTime: '22:00',
          status: 'ACTIVE',
          logoUrl: '',
          coverImageUrl: '',
        },
  });

  const selectedStatus = watch('status');
  const logoUrl = watch('logoUrl');
  const coverImageUrl = watch('coverImageUrl');

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Tên địa điểm"
            error={!!errors.name}
            helperText={errors.name?.message as string}
            {...register('name')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Mã địa điểm"
            error={!!errors.venueCode}
            helperText={errors.venueCode?.message as string}
            {...register('venueCode')}
            disabled={isEdit}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Mô tả"
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message as string}
            {...register('description')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Địa chỉ"
            error={!!errors.address}
            helperText={errors.address?.message as string}
            {...register('address')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Thành phố"
            error={!!errors.city}
            helperText={errors.city?.message as string}
            {...register('city')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Tỉnh / Bang"
            error={!!errors.provinceState}
            helperText={errors.provinceState?.message as string}
            {...register('provinceState')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Quốc gia"
            error={!!errors.country}
            helperText={errors.country?.message as string}
            {...register('country')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Mã bưu chính"
            error={!!errors.postalCode}
            helperText={errors.postalCode?.message as string}
            {...register('postalCode')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Số điện thoại"
            error={!!errors.phone}
            helperText={errors.phone?.message as string}
            {...register('phone')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Địa chỉ email"
            error={!!errors.email}
            helperText={errors.email?.message as string}
            {...register('email')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Trang web"
            error={!!errors.website}
            helperText={errors.website?.message as string}
            {...register('website')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Giờ mở cửa (HH:MM)"
            error={!!errors.openingTime}
            helperText={errors.openingTime?.message as string}
            {...register('openingTime')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Giờ đóng cửa (HH:MM)"
            error={!!errors.closingTime}
            helperText={errors.closingTime?.message as string}
            {...register('closingTime')}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Select
            label="Trạng thái"
            value={selectedStatus}
            onChange={(e: any) => setValue('status', e.target.value)}
            error={!!errors.status}
            helperText={errors.status?.message as string}
            options={[
              { value: 'ACTIVE', label: 'Hoạt động' },
              { value: 'INACTIVE', label: 'Ngưng hoạt động' },
              { value: 'UNDER_MAINTENANCE', label: 'Đang bảo trì' },
              { value: 'CLOSED', label: 'Đã đóng cửa' },
            ]}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <UploadVenueImage
            label="Ảnh Logo"
            value={logoUrl}
            onChange={(url) => setValue('logoUrl', url)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <UploadVenueImage
            label="Ảnh bìa"
            value={coverImageUrl}
            onChange={(url) => setValue('coverImageUrl', url)}
          />
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button type="submit" variant="contained" loading={loading}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo địa điểm'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
