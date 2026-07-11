import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Box,
} from '@mui/material';
import { Button } from '../../../components/common/Button';
import { visitorFormSchema, VisitorFormInput } from '../schemas/visitorSchema';
import { Visitor } from '../types';
import { mockCustomers } from '../../customer/services/customerApi';

interface VisitorFormProps {
  initialData?: Visitor | null;
  onSubmit: (data: VisitorFormInput) => void;
  loading?: boolean;
}

export const VisitorForm: React.FC<VisitorFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VisitorFormInput>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      customerId: initialData?.customerId || '',
      fullName: initialData?.fullName || '',
      age: initialData?.age || 0,
      gender: initialData?.gender || 'MALE',
      nationality: initialData?.nationality || '',
      identificationNumber: initialData?.identificationNumber || '',
      relationship: initialData?.relationship || 'SELF',
      emergencyContactName: initialData?.emergencyContactName || '',
      emergencyContactPhone: initialData?.emergencyContactPhone || '',
      medicalNotes: initialData?.medicalNotes || '',
      status: initialData?.status || 'ACTIVE',
    } as any,
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.customerId}>
            <InputLabel id="customer-owner-label">Tài khoản khách hàng sở hữu *</InputLabel>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="customer-owner-label"
                  label="Tài khoản khách hàng sở hữu *"
                  disabled={!!initialData} // Lock customer association on edit
                >
                  {mockCustomers.map((cust) => (
                    <MenuItem key={cust.id} value={cust.id}>
                      {cust.fullName} (CUST-{String(cust.id).padStart(4, '0')})
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.customerId && <FormHelperText>{errors.customerId.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Họ và tên khách tham quan *"
                fullWidth
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="age"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Tuổi *"
                fullWidth
                error={!!errors.age}
                helperText={errors.age?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth error={!!errors.gender}>
            <InputLabel id="visitor-gender-label">Giới tính *</InputLabel>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="visitor-gender-label" label="Giới tính *">
                  <MenuItem value="MALE">Nam</MenuItem>
                  <MenuItem value="FEMALE">Nữ</MenuItem>
                  <MenuItem value="OTHER">Khác</MenuItem>
                </Select>
              )}
            />
            {errors.gender && <FormHelperText>{errors.gender.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth error={!!errors.relationship}>
            <InputLabel id="relationship-label">Mối quan hệ với chủ tài khoản *</InputLabel>
            <Controller
              name="relationship"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="relationship-label" label="Mối quan hệ với chủ tài khoản *">
                  <MenuItem value="SELF">Bản thân</MenuItem>
                  <MenuItem value="SPOUSE">Vợ/Chồng</MenuItem>
                  <MenuItem value="CHILD">Con cái</MenuItem>
                  <MenuItem value="PARENT">Cha mẹ</MenuItem>
                  <MenuItem value="FRIEND">Bạn bè</MenuItem>
                  <MenuItem value="OTHER">Khác</MenuItem>
                </Select>
              )}
            />
            {errors.relationship && <FormHelperText>{errors.relationship.message}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="nationality"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Quốc tịch *"
                fullWidth
                error={!!errors.nationality}
                helperText={errors.nationality?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="identificationNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Số giấy tờ tùy thân (CMND/CCCD/Hộ chiếu) *"
                fullWidth
                error={!!errors.identificationNumber}
                helperText={errors.identificationNumber?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="emergencyContactName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Tên người liên hệ khẩn cấp"
                fullWidth
                error={!!errors.emergencyContactName}
                helperText={errors.emergencyContactName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="emergencyContactPhone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Số điện thoại liên hệ khẩn cấp"
                fullWidth
                error={!!errors.emergencyContactPhone}
                helperText={errors.emergencyContactPhone?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="medicalNotes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Lưu ý y tế đặc biệt / Dị ứng / Yêu cầu trợ giúp"
                fullWidth
                multiline
                rows={3}
                error={!!errors.medicalNotes}
                helperText={errors.medicalNotes?.message}
                placeholder="Liệt kê các dị ứng thực phẩm, hạn chế thể chất hoặc cảnh báo y tế..."
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id="visitor-status-label">Trạng thái</InputLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="visitor-status-label" label="Trạng thái">
                  <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Ngưng hoạt động</MenuItem>
                </Select>
              )}
            />
            {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
          </FormControl>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
        <Button type="submit" variant="contained" loading={loading}>
          {initialData ? 'Lưu thay đổi' : 'Đăng ký khách tham quan'}
        </Button>
      </Box>
    </Box>
  );
};
