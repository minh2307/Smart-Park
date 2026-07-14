import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { Button } from '../../../components/common/Button';
import { rideSchema, RideFormInput } from '../schemas/rideSchema';
import { Ride } from '../types';
import { mockRideCategories } from '../../ride-category/services/rideCategoryApi';

interface RideFormProps {
  initialData?: Ride | null;
  onSubmit: (data: RideFormInput) => void;
  loading?: boolean;
}

export const RideForm: React.FC<RideFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RideFormInput>({
    resolver: zodResolver(rideSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      description: initialData?.description || '',
      capacity: initialData?.capacity || 100,
      durationSeconds: initialData?.durationSeconds || 120,
      status: initialData?.status || 'OPERATING',
      venueId: initialData?.venueId || 1,
      zoneId: initialData?.zoneId || 1,
      rideCategoryId: initialData?.rideCategoryId || 1,
      operatingHours: {
        open: initialData?.operatingHours?.open || '09:00',
        close: initialData?.operatingHours?.close || '21:00',
      },
      restrictions: {
        minHeight: initialData?.restrictions?.minHeight || '',
        maxHeight: initialData?.restrictions?.maxHeight || '',
        minAge: initialData?.restrictions?.minAge || '',
        maxAge: initialData?.restrictions?.maxAge || '',
        minWeight: initialData?.restrictions?.minWeight || '',
        maxWeight: initialData?.restrictions?.maxWeight || '',
        healthWarning: initialData?.restrictions?.healthWarning ?? false,
        pregnancyRestriction: initialData?.restrictions?.pregnancyRestriction ?? false,
        accessibilityFriendly: initialData?.restrictions?.accessibilityFriendly ?? false,
        safetyNotes: initialData?.restrictions?.safetyNotes || '',
      },
    },
  });



  const mockZones = [
    { id: 1, name: 'Space Zone A', venueId: 1 },
    { id: 2, name: 'Tropical Paradise', venueId: 2 },
    { id: 3, name: 'Adrenaline Plaza', venueId: 1 },
    { id: 4, name: 'Fantasy Meadow', venueId: 1 },
    { id: 5, name: 'Cyber Metropolis', venueId: 1 },
  ];

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="primary" fontWeight="bold">
            Thông số cơ bản trò chơi
          </Typography>
          <Divider sx={{ my: 1 }} />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Tên trò chơi"
                placeholder="VD: Tàu lượn siêu tốc"
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Mã trò chơi"
                placeholder="VD: RD-SPACE"
                error={!!errors.code}
                helperText={errors.code?.message || 'Chữ viết hoa và số, có thể dùng dấu gạch ngang/gạch dưới'}
                disabled={loading || !!initialData}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="rideCategoryId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.rideCategoryId} disabled={loading}>
                <InputLabel id="ride-cat-label">Danh mục *</InputLabel>
                <Select {...field} labelId="ride-cat-label" label="Danh mục *">
                  {mockRideCategories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.rideCategoryId && <FormHelperText>{errors.rideCategoryId.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="zoneId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.zoneId} disabled={loading}>
                <InputLabel id="ride-zone-label">Phân khu *</InputLabel>
                <Select {...field} labelId="ride-zone-label" label="Phân khu *">
                  {mockZones.map((z) => (
                    <MenuItem key={z.id} value={z.id}>
                      {z.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.zoneId && <FormHelperText>{errors.zoneId.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="capacity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                type="number"
                label="Công suất hàng giờ (Khách/Giờ)"
                error={!!errors.capacity}
                helperText={errors.capacity?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="durationSeconds"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Thời lượng chu kỳ (Giây)"
                error={!!errors.durationSeconds}
                helperText={errors.durationSeconds?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.status} disabled={loading}>
                <InputLabel id="ride-status-label">Trạng thái vận hành *</InputLabel>
                <Select {...field} labelId="ride-status-label" label="Trạng thái vận hành *">
                  <MenuItem value="OPERATING">Đang vận hành</MenuItem>
                  <MenuItem value="CLOSED">Đã đóng cửa</MenuItem>
                  <MenuItem value="MAINTENANCE">Đang bảo trì</MenuItem>
                  <MenuItem value="TEMPORARILY_CLOSED">Tạm đóng cửa</MenuItem>
                  <MenuItem value="EMERGENCY_STOP">Dừng khẩn cấp</MenuItem>
                  <MenuItem value="RESERVED">Đã đặt chỗ</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="operatingHours.open"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Giờ mở cửa (HH:MM)"
                placeholder="09:00"
                error={!!errors.operatingHours?.open}
                helperText={errors.operatingHours?.open?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="operatingHours.close"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label="Giờ đóng cửa (HH:MM)"
                placeholder="21:00"
                error={!!errors.operatingHours?.close}
                helperText={errors.operatingHours?.close?.message}
                disabled={loading}
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
                label="Mô tả"
                placeholder="Chi tiết về câu chuyện trò chơi, hiệu ứng đặc biệt, v.v."
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="primary" fontWeight="bold">
            Giới hạn an toàn & Quy định tham gia
          </Typography>
          <Divider sx={{ my: 1 }} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="restrictions.minHeight"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Chiều cao tối thiểu (cm)"
                error={!!errors.restrictions?.minHeight}
                helperText={errors.restrictions?.minHeight?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="restrictions.maxHeight"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Chiều cao tối đa (cm)"
                error={!!errors.restrictions?.maxHeight}
                helperText={errors.restrictions?.maxHeight?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="restrictions.minAge"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Độ tuổi tối thiểu (Tuổi)"
                error={!!errors.restrictions?.minAge}
                helperText={errors.restrictions?.minAge?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Controller
            name="restrictions.minWeight"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Cân nặng tối thiểu (kg)"
                error={!!errors.restrictions?.minWeight}
                helperText={errors.restrictions?.minWeight?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="restrictions.healthWarning"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                label="Kích hoạt cảnh báo y tế/tim mạch"
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="restrictions.pregnancyRestriction"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                label="Không dành cho phụ nữ mang thai"
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="restrictions.accessibilityFriendly"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={field.onChange} />}
                label="Hỗ trợ xe lăn/tiếp cận dễ dàng"
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="restrictions.safetyNotes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={2}
                label="Lưu ý hướng dẫn an toàn & lên xe"
                placeholder="VD: Giữ tay bên trong cabin mọi lúc..."
                error={!!errors.restrictions?.safetyNotes}
                helperText={errors.restrictions?.safetyNotes?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        <Button type="submit" variant="contained" loading={loading}>
          {initialData ? 'Cập nhật thông số' : 'Đăng ký trò chơi'}
        </Button>
      </Box>
    </Box>
  );
};
